"""
missions/serializers.py
~~~~~~~~~~~~~~~~~~~~~~~
Serializers handle validation and representation only.
No business logic — that lives in services.py.
"""
from __future__ import annotations
 
import re
from decimal import Decimal
 
from rest_framework import serializers
 
from .models import Mission, MissionStatus, TruckType, TruckCategory, TruckSize
from .services import calculate_price, MAX_WORKERS, TRUCK_SIZE_SURCHARGE
 
# Algerian mobile number pattern: exactly 10 digits starting with 05, 06, or 07.
_PHONE_RE = re.compile(r"^0[567]\d{8}$")
 
 
# ---------------------------------------------------------------------------
# Step 1 — Price estimation (no DB write, client-facing)
# Intentionally does NOT include phone_number or shipment_type:
# those fields are only relevant at confirmation time.
# ---------------------------------------------------------------------------
 
class PriceEstimateSerializer(serializers.Serializer):
    """
    Validates the client's trip parameters and returns a price estimate.
    No Mission is created at this stage.
 
    phone_number and shipment_type are deliberately absent — the estimate
    step is purely about calculating a price, not collecting client details.
    """
 
    truck_type = serializers.ChoiceField(choices=TruckType.choices)
    category = serializers.ChoiceField(choices=TruckCategory.choices)
    capacity = serializers.IntegerField(min_value=1)
    size = serializers.ChoiceField(
        choices=TruckSize.choices,
        help_text="Truck size — determines the size surcharge applied to the price.",
    )
 
    departure_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    departure_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    arrival_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    arrival_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
 
    distance = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        min_value=Decimal("0.01"),
        help_text="Distance in km.",
    )
    date = serializers.DateField()
    time = serializers.TimeField()
    workers = serializers.IntegerField(min_value=0, max_value=MAX_WORKERS)
 
    def validate(self, attrs):
        # Eagerly compute price so the view can return it without extra work.
        attrs["estimated_price"] = calculate_price(
            attrs["distance"], attrs["workers"], attrs["size"]
        )
        return attrs
 
 
# ---------------------------------------------------------------------------
# Step 2 — Mission confirmation (creates Mission in DB)
# ---------------------------------------------------------------------------
 
class MissionCreateSerializer(serializers.Serializer):
    """
    Validates all fields required to confirm and persist a Mission.
 
    Extends the estimate fields with:
      - shipment_type: what kind of goods are being transported (listed first,
                       as it is the primary attribute the client selects).
      - phone_number:  client contact number, validated to Algerian mobile
                       format (05/06/07 + 8 digits = 10 digits total).
 
    Price is always recalculated server-side — never trusted from the client.
    """
 
    # ── New confirm-only fields ──────────────────────────────────────────────
    # shipment_type is intentionally first: it is the primary selection in UI.
    shipment_type = serializers.CharField(
        max_length=50,
        help_text=(
            "Type of goods being transported. "
            "Examples: house_moving, commercial_goods, heavy_equipment."
        ),
    )
    phone_number = serializers.CharField(
        max_length=10,
        help_text="Algerian mobile number: starts with 05, 06, or 07; exactly 10 digits.",
    )
 
    # ── Trip fields (same as estimate) ──────────────────────────────────────
    truck_type = serializers.ChoiceField(choices=TruckType.choices)
    category = serializers.ChoiceField(choices=TruckCategory.choices)
    capacity = serializers.IntegerField(min_value=1)
    size = serializers.ChoiceField(
        choices=TruckSize.choices,
        help_text="Truck size — determines the size surcharge applied to the price.",
    )
 
    departure_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    departure_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    arrival_latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    arrival_longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
 
    distance = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    date = serializers.DateField()
    time = serializers.TimeField()
    workers = serializers.IntegerField(min_value=0, max_value=MAX_WORKERS)
 
    def validate_phone_number(self, value: str) -> str:
        """
        Enforce Algerian mobile number format:
          - Exactly 10 digits
          - Must start with 05, 06, or 07
 
        Examples of valid numbers:   0551234567, 0661234567, 0771234567
        Examples of invalid numbers: 0412345678 (wrong prefix),
                                     055123456  (9 digits),
                                     055123456a (non-digit character)
        """
        if not _PHONE_RE.match(value):
            raise serializers.ValidationError(
                "Phone number must be exactly 10 digits and start with 05, 06, or 07. "
                f"Got: '{value}'."
            )
        return value
 
    def validate_shipment_type(self, value: str) -> str:
        """Normalise to lowercase and strip surrounding whitespace."""
        return value.strip().lower()
 
 
# ---------------------------------------------------------------------------
# Mission read serializers — different verbosity per audience.
# Both phone_number and shipment_type are visible in all responses so that
# employees and the boss have complete context for every mission.
# ---------------------------------------------------------------------------
 
class MissionEmployeeListSerializer(serializers.ModelSerializer):
    """
    Serializer for the employee dashboard.
 
    Computed fields for frontend colour-coding:
      display_status  → one of: "available" | "taken" | "in_progress" | "completed"
      is_taken        → True when the mission is no longer open to accept
      taken_by        → name of the assigned employee (or None)
 
    Frontend mapping:
      available   → green   (pending, can be accepted)
      taken       → red     (accepted by someone else)
      in_progress → orange  (currently being executed)
      completed   → grey    (finished)
    """
 
    display_status = serializers.SerializerMethodField()
    is_taken = serializers.SerializerMethodField()
    taken_by = serializers.SerializerMethodField()
 
    class Meta:
        model = Mission
        fields = [
            "id",
            # Confirm-only fields first, matching the importance in the workflow
            "shipment_type",
            "phone_number",
            # Truck
            "truck_type",
            "category",
            "capacity",
            "size",
            # Route
            "departure_latitude",
            "departure_longitude",
            "arrival_latitude",
            "arrival_longitude",
            "distance",
            # Schedule
            "date",
            "time",
            "workers",
            # Financials & status
            "price",
            "status",
            "display_status",
            "is_taken",
            "taken_by",
            "created_at",
        ]
 
    def get_display_status(self, obj: Mission) -> str:
        """
        Map internal status to a frontend display hint.
 
        pending     → "available"   (green  — open to accept)
        accepted    → "taken"       (red    — locked to one employee)
        in_progress → "in_progress" (orange — being executed)
        completed   → "completed"   (grey   — finished)
        """
        return {
            MissionStatus.PENDING:     "available",
            MissionStatus.ACCEPTED:    "taken",
            MissionStatus.IN_PROGRESS: "in_progress",
            MissionStatus.COMPLETED:   "completed",
        }.get(obj.status, obj.status)  # fallback to raw value for forward-compat
 
    def get_is_taken(self, obj: Mission) -> bool:
        """True for any status that is no longer open to accept."""
        return obj.status != MissionStatus.PENDING
 
    def get_taken_by(self, obj: Mission) -> str | None:
        if obj.assigned_employee:
            emp = obj.assigned_employee
            full_name = f"{emp.first_name} {emp.last_name}".strip()
            return full_name or emp.username
        return None
 
 
class MissionBossSerializer(serializers.ModelSerializer):
    """
    Full-detail serializer for the boss dashboard.
    Includes client info, assigned employee info, price, and status.
    """
 
    client = serializers.SerializerMethodField()
    assigned_employee = serializers.SerializerMethodField()
 
    class Meta:
        model = Mission
        fields = [
            "id",
            "client",
            # Confirm-only fields
            "shipment_type",
            "phone_number",
            # Truck
            "truck_type",
            "category",
            "capacity",
            "size",
            # Route
            "departure_latitude",
            "departure_longitude",
            "arrival_latitude",
            "arrival_longitude",
            "distance",
            # Schedule
            "date",
            "time",
            "workers",
            # Financials & lifecycle
            "price",
            "status",
            "assigned_employee",
            "created_at",
            "updated_at",
        ]
 
    def get_client(self, obj: Mission) -> dict:
        u = obj.client
        return {
            "id": u.pk,
            "username": u.username,
            "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
            "email": u.email,
        }
 
    def get_assigned_employee(self, obj: Mission) -> dict | None:
        if not obj.assigned_employee:
            return None
        u = obj.assigned_employee
        return {
            "id": u.pk,
            "username": u.username,
            "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
        }
 
 
class MissionClientSerializer(serializers.ModelSerializer):
    """Read-only serializer returned to the client after mission confirmation."""
 
    class Meta:
        model = Mission
        fields = [
            "id",
            "shipment_type",
            "phone_number",
            "truck_type",
            "category",
            "capacity",
            "size",
            "departure_latitude",
            "departure_longitude",
            "arrival_latitude",
            "arrival_longitude",
            "distance",
            "date",
            "time",
            "workers",
            "price",
            "status",
            "created_at",
        ]
        read_only_fields = fields
 
 
# ---------------------------------------------------------------------------
# Boss dashboard analytics serializer
# ---------------------------------------------------------------------------
 
class MonthlyOverviewEntrySerializer(serializers.Serializer):
    """One entry in the monthly_overview list."""
    month     = serializers.CharField()
    year      = serializers.IntegerField()
    completed = serializers.IntegerField()
 
 
class BossDashboardSerializer(serializers.Serializer):
    """
    Validates and documents the shape of the boss dashboard response.
 
    Using an explicit serializer (rather than returning the dict directly)
    means the response contract is self-documenting and regressions in the
    service layer will surface as serializer validation errors.
    """
    total_missions_month  = serializers.IntegerField(min_value=0)
    completed_missions    = serializers.IntegerField(min_value=0)
    completion_percentage = serializers.FloatField(min_value=0, max_value=100)
    today_missions        = serializers.IntegerField(min_value=0)
    monthly_revenue       = serializers.DecimalField(max_digits=14, decimal_places=2)
    monthly_overview      = MonthlyOverviewEntrySerializer(many=True)
 
