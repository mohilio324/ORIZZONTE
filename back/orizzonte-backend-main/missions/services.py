"""
missions/services.py
~~~~~~~~~~~~~~~~~~~~
All business logic for the missions system.
 
Views must delegate to these functions — no business logic in views.py.
"""
from __future__ import annotations
 
from decimal import Decimal
from typing import Any
 
from django.db import transaction
 
from .models import Mission, MissionStatus, TruckSize
 
# ---------------------------------------------------------------------------
# Pricing constants (change only here — every calculation follows)
# ---------------------------------------------------------------------------
PRICE_PER_KM: Decimal = Decimal("200")      # DZD per kilometre
FIXED_FUEL_COST: Decimal = Decimal("2000")  # DZD flat fuel charge
PRICE_PER_WORKER: Decimal = Decimal("1500") # DZD per additional worker
 
MAX_WORKERS: int = 5
 
# Cost added per truck size — keyed by TruckSize values.
TRUCK_SIZE_SURCHARGE: dict[str, Decimal] = {
    TruckSize.SMALL:  Decimal("1500"),
    TruckSize.MEDIUM: Decimal("2500"),
    TruckSize.BIG:    Decimal("3000"),
}
 
 
# ---------------------------------------------------------------------------
# Price estimation (step 1 — no DB write)
# ---------------------------------------------------------------------------
 
def calculate_price(distance: Decimal, workers: int, size: str) -> Decimal:
    """
    Return the estimated price in DZD.
 
    Formula:
        price = (distance_km × 200) + 2000 + (workers × 1500) + size_surcharge
 
    Size surcharges:
        small  → +1500 DA
        medium → +2500 DA
        big    → +3000 DA
 
    Args:
        distance: Trip distance in kilometres.
        workers:  Number of additional workers (0–5).
        size:     Truck size — one of TruckSize values ("small", "medium", "big").
 
    Returns:
        Calculated price as a Decimal.
 
    Raises:
        ValueError: If workers is outside the valid 0–5 range.
        ValueError: If size is not a recognised TruckSize value.
    """
    if not (0 <= workers <= MAX_WORKERS):
        raise ValueError(f"workers must be between 0 and {MAX_WORKERS}, got {workers}.")
 
    if size not in TRUCK_SIZE_SURCHARGE:
        valid = ", ".join(TRUCK_SIZE_SURCHARGE.keys())
        raise ValueError(f"size must be one of [{valid}], got '{size}'.")
 
    base_price = (Decimal(str(distance)) * PRICE_PER_KM) + FIXED_FUEL_COST + (workers * PRICE_PER_WORKER)
    size_surcharge = TRUCK_SIZE_SURCHARGE[size]
    return base_price + size_surcharge
 
 
# ---------------------------------------------------------------------------
# Mission creation (step 2 — confirmed by client)
# ---------------------------------------------------------------------------
 
def create_mission(client, validated_data: dict[str, Any]) -> Mission:
    """
    Persist a new Mission after the client confirms the price.
 
    The price is (re-)calculated server-side so the client cannot tamper
    with it between the estimate step and the confirmation step.
 
    Args:
        client:         The authenticated User making the request.
        validated_data: Cleaned data from MissionCreateSerializer.
                        Must include shipment_type and phone_number
                        in addition to all trip fields.
 
    Returns:
        The newly created Mission instance.
    """
    distance = validated_data["distance"]
    workers  = validated_data["workers"]
    size     = validated_data["size"]
    price    = calculate_price(distance, workers, size)
 
    mission = Mission.objects.create(
        client=client,
        # New confirm-only fields
        shipment_type=validated_data["shipment_type"],
        phone_number=validated_data["phone_number"],
        # Truck
        truck_type=validated_data["truck_type"],
        category=validated_data["category"],
        capacity=validated_data["capacity"],
        size=size,
        # Route
        departure_latitude=validated_data["departure_latitude"],
        departure_longitude=validated_data["departure_longitude"],
        arrival_latitude=validated_data["arrival_latitude"],
        arrival_longitude=validated_data["arrival_longitude"],
        distance=distance,
        # Schedule
        date=validated_data["date"],
        time=validated_data["time"],
        workers=workers,
        # Financials
        price=price,
        status=MissionStatus.PENDING,
    )
    return mission
 
 
# ---------------------------------------------------------------------------
# Mission acceptance (employee action — concurrency-safe)
# ---------------------------------------------------------------------------
 
def accept_mission(mission_id: int, employee) -> Mission:
    """
    Atomically assign *employee* to the mission identified by *mission_id*.
 
    Uses SELECT … FOR UPDATE to prevent a race condition where two employees
    try to accept the same mission simultaneously — only the first wins.
 
    Args:
        mission_id: PK of the target Mission.
        employee:   The authenticated employee User.
 
    Returns:
        The updated Mission instance.
 
    Raises:
        Mission.DoesNotExist: If the mission does not exist.
        MissionAlreadyAcceptedError: If another employee already accepted it.
    """
    with transaction.atomic():
        try:
            mission = Mission.objects.select_for_update().get(pk=mission_id)
        except Mission.DoesNotExist:
            raise
 
        if mission.status != MissionStatus.PENDING:
            raise MissionAlreadyAcceptedError(
                f"Mission #{mission_id} has already been accepted by "
                f"{mission.assigned_employee}."
            )
 
        mission.status = MissionStatus.ACCEPTED
        mission.assigned_employee = employee
        mission.save(update_fields=["status", "assigned_employee", "updated_at"])
 
    return mission
def assign_mission(mission_id: int, employee_id: int) -> Mission:
    """
    Boss-only action: assign a specific employee to a mission.
    Transitions PENDING → ACCEPTED.

    Args:
        mission_id: PK of the mission.
        employee_id: PK of the target employee.

    Returns:
        The updated Mission instance.
    """
    from django.contrib.auth import get_user_model
    User = get_user_model()

    with transaction.atomic():
        try:
            mission = Mission.objects.select_for_update().get(pk=mission_id)
            employee = User.objects.get(pk=employee_id, role="employee")
        except Mission.DoesNotExist:
            raise
        except User.DoesNotExist:
            raise ValueError(f"Employee with ID {employee_id} not found or is not an employee.")

        if mission.status != MissionStatus.PENDING:
            raise MissionAlreadyAcceptedError(
                f"Mission #{mission_id} is already in {mission.status} status and cannot be reassigned this way."
            )

        mission.status = MissionStatus.ACCEPTED
        mission.assigned_employee = employee
        mission.save(update_fields=["status", "assigned_employee", "updated_at"])

    return mission


# ---------------------------------------------------------------------------
# Mission progression (employee actions — concurrency-safe)
# ---------------------------------------------------------------------------
 
def start_mission(mission_id: int, employee) -> Mission:
    """
    Transition a mission from ACCEPTED → IN_PROGRESS.
 
    Only the assigned employee may call this. The transition is atomic and
    row-locked so concurrent calls are safe.
 
    Args:
        mission_id: PK of the target Mission.
        employee:   The authenticated employee User.
 
    Returns:
        The updated Mission instance.
 
    Raises:
        Mission.DoesNotExist:        If the mission does not exist.
        MissionNotAssignedToYouError: If *employee* is not the assigned employee.
        MissionInvalidTransitionError: If the mission is not in ACCEPTED status.
    """
    with transaction.atomic():
        try:
            mission = Mission.objects.select_for_update().get(pk=mission_id)
        except Mission.DoesNotExist:
            raise
 
        if mission.assigned_employee_id != employee.pk:
            raise MissionNotAssignedToYouError(
                f"Mission #{mission_id} is not assigned to you."
            )
 
        if mission.status != MissionStatus.ACCEPTED:
            raise MissionInvalidTransitionError(
                f"Cannot start mission #{mission_id}: "
                f"expected status '{MissionStatus.ACCEPTED}', "
                f"got '{mission.status}'."
            )
 
        mission.status = MissionStatus.IN_PROGRESS
        mission.save(update_fields=["status", "updated_at"])
 
    return mission
 
 
def complete_mission(mission_id: int, employee) -> Mission:
    """
    Transition a mission from IN_PROGRESS → COMPLETED.
 
    Only the assigned employee may call this. The transition is atomic and
    row-locked so concurrent calls are safe.
 
    Args:
        mission_id: PK of the target Mission.
        employee:   The authenticated employee User.
 
    Returns:
        The updated Mission instance.
 
    Raises:
        Mission.DoesNotExist:         If the mission does not exist.
        MissionNotAssignedToYouError:  If *employee* is not the assigned employee.
        MissionInvalidTransitionError: If the mission is not in IN_PROGRESS status.
    """
    with transaction.atomic():
        try:
            mission = Mission.objects.select_for_update().get(pk=mission_id)
        except Mission.DoesNotExist:
            raise
 
        if mission.assigned_employee_id != employee.pk:
            raise MissionNotAssignedToYouError(
                f"Mission #{mission_id} is not assigned to you."
            )
 
        if mission.status != MissionStatus.IN_PROGRESS:
            raise MissionInvalidTransitionError(
                f"Cannot complete mission #{mission_id}: "
                f"expected status '{MissionStatus.IN_PROGRESS}', "
                f"got '{mission.status}'."
            )
 
        mission.status = MissionStatus.COMPLETED
        mission.save(update_fields=["status", "updated_at"])
 
    return mission
 
 
# ---------------------------------------------------------------------------
# Boss dashboard analytics (read-only aggregations)
# ---------------------------------------------------------------------------
 
def get_boss_dashboard_stats() -> dict:
    """
    Compute all boss dashboard metrics in as few DB round-trips as possible.
 
    Metrics returned
    ----------------
    total_missions_month    : int     — missions created in the current calendar month
    completed_missions      : int     — completed missions in the current calendar month
    completion_percentage   : float   — completed / total * 100  (0 if total == 0)
    today_missions          : int     — missions created today (local date)
    monthly_revenue         : Decimal — sum of price for completed missions this month
    monthly_overview        : list    — completed count per month for last 6 months
                                        [{"month": "January", "completed": 12}, ...]
 
    All date comparisons use timezone-aware datetimes via django.utils.timezone
    so the numbers stay correct regardless of the server's UTC offset.
    """
    from django.db.models import Count, Sum, Q
    from django.utils import timezone
 
    now        = timezone.now()
    today      = now.date()
 
    # First day of the current calendar month (timezone-aware)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
 
    # ── Metrics 1–4: single queryset over this month's missions ─────────────
 
    month_qs = Mission.objects.filter(created_at__gte=month_start)
 
    month_agg = month_qs.aggregate(
        total=Count("id"),
        completed=Count("id", filter=Q(status=MissionStatus.COMPLETED)),
        revenue=Sum(
            "price",
            filter=Q(status=MissionStatus.COMPLETED),
        ),
    )
 
    total_missions_month = month_agg["total"]       or 0
    completed_missions   = month_agg["completed"]   or 0
    monthly_revenue      = month_agg["revenue"]     or Decimal("0")
 
    completion_percentage = (
        round((completed_missions / total_missions_month) * 100, 2)
        if total_missions_month > 0
        else 0.0
    )
 
    # ── Metric 3: today's missions ───────────────────────────────────────────
    # Filter on the date portion of created_at (DB-side, uses the index).
    today_missions = Mission.objects.filter(created_at__date=today).count()
 
    # ── Metric 5: monthly overview — last 6 months ───────────────────────────
    # We iterate month-by-month so empty months always appear as 0 rather
    # than being omitted.  Each iteration issues one lightweight COUNT query.
    monthly_overview: list[dict] = []
 
    for months_ago in range(5, -1, -1):       # 5 → 0  (oldest → newest)
        # Compute the first day of the target month by rolling back from 'now'.
        # calendar.monthrange gives the number of days in any month reliably.
        import calendar
 
        target_year  = now.year  - ((now.month - 1 - months_ago) // 12 if (now.month - 1 - months_ago) < 0 else 0)
        raw_month    = now.month - months_ago
        # Normalise raw_month into 1–12 range
        while raw_month <= 0:
            raw_month  += 12
            target_year -= 1
 
        target_start = now.replace(
            year=target_year, month=raw_month, day=1,
            hour=0, minute=0, second=0, microsecond=0,
        )
        _, last_day  = calendar.monthrange(target_year, raw_month)
        target_end   = target_start.replace(day=last_day).replace(
            hour=23, minute=59, second=59, microsecond=999999,
        )
 
        count = Mission.objects.filter(
            status=MissionStatus.COMPLETED,
            created_at__gte=target_start,
            created_at__lte=target_end,
        ).count()
 
        monthly_overview.append({
            "month":     target_start.strftime("%B"),   # e.g. "January"
            "year":      target_year,                   # useful for multi-year charts
            "completed": count,
        })
 
    return {
        "total_missions_month":  total_missions_month,
        "completed_missions":    completed_missions,
        "completion_percentage": completion_percentage,
        "today_missions":        today_missions,
        "monthly_revenue":       monthly_revenue,
        "monthly_overview":      monthly_overview,
    }
def cancel_mission(mission_id: int) -> Mission:
    """
    Boss-only action: Cancel a mission.
    """
    with transaction.atomic():
        try:
            mission = Mission.objects.select_for_update().get(pk=mission_id)
        except Mission.DoesNotExist:
            raise

        if mission.status == MissionStatus.COMPLETED:
            raise MissionInvalidTransitionError("Cannot cancel a completed mission.")

        mission.status = MissionStatus.CANCELLED
        mission.save(update_fields=["status", "updated_at"])

    return mission


def delete_mission(mission_id: int):
    """
    Boss-only action: Permanently delete a mission.
    """
    try:
        mission = Mission.objects.get(pk=mission_id)
        mission.delete()
    except Mission.DoesNotExist:
        raise


# ---------------------------------------------------------------------------
# Custom exceptions
# ---------------------------------------------------------------------------
 
class MissionAlreadyAcceptedError(Exception):
    """Raised when an employee tries to accept an already-taken mission."""
 
 
class MissionNotAssignedToYouError(Exception):
    """Raised when an employee tries to act on a mission assigned to someone else."""
 
 
class MissionInvalidTransitionError(Exception):
    """Raised when a status transition is attempted out of the allowed order."""
