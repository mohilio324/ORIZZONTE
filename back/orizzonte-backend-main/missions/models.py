from django.db import models
from django.conf import settings


class TruckType(models.TextChoices):
    SMALL = "small", "Small"
    MEDIUM = "medium", "Medium"
    LARGE = "large", "Large"
    EXTRA_LARGE = "extra_large", "Extra Large"


class TruckSize(models.TextChoices):
    SMALL = "small", "Small"
    MEDIUM = "medium", "Medium"
    BIG = "big", "Big"


class TruckCategory(models.TextChoices):
    OPEN = "open", "Open"
    CLOSED = "closed", "Closed"
    REFRIGERATED = "refrigerated", "Refrigerated"
    FLATBED = "flatbed", "Flatbed"


class MissionStatus(models.TextChoices):
    PENDING     = "pending",     "Pending"
    ACCEPTED    = "accepted",    "Accepted"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED   = "completed",   "Completed"
    CANCELLED   = "cancelled",   "Cancelled"


class Mission(models.Model):
    """
    Represents a confirmed moving order (mission).
    Created only after the client reviews and confirms the price estimation.
    """

    # Shipment — the primary attribute the client selects first.
    # Free-form CharField so the list of types can grow without a migration.
    # Examples: "house_moving", "commercial_goods", "heavy_equipment"
    shipment_type = models.CharField(
        max_length=50,
        help_text="Kind of goods being transported (e.g. house_moving, commercial_goods).",
    )

    # Contact
    phone_number = models.CharField(
        max_length=10,
        help_text="Client contact number — must start with 05, 06, or 07 and be 10 digits.",
    )

    # Ownership
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="missions_as_client",
        help_text="The client who requested this mission.",
    )
    assigned_employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="missions_as_employee",
        help_text="The employee who accepted this mission. Null until accepted.",
    )

    # Truck details
    truck_type = models.CharField(
        max_length=20,
        choices=TruckType.choices,
    )
    category = models.CharField(
        max_length=20,
        choices=TruckCategory.choices,
    )
    capacity = models.PositiveIntegerField(
        help_text="Truck capacity in tons.",
    )
    size = models.CharField(
        max_length=10,
        choices=TruckSize.choices,
        help_text="Truck size — affects the final price.",
    )

    # Locations — stored as flat decimal fields for simplicity and query speed.
    # Use PostGIS PointField instead if spatial queries become a requirement.
    departure_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    departure_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    arrival_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    arrival_longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Trip info
    distance = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Distance in kilometres.",
    )
    date = models.DateField()
    time = models.TimeField()
    workers = models.PositiveSmallIntegerField(
        default=0,
        help_text="Number of additional workers (0–5).",
    )

    # Financials
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Calculated price in DZD.",
    )

    # Lifecycle
    status = models.CharField(
        max_length=20,
        choices=MissionStatus.choices,
        default=MissionStatus.PENDING,
        db_index=True,
    )

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Mission"
        verbose_name_plural = "Missions"

    def __str__(self) -> str:
        return f"Mission #{self.pk} — {self.client} [{self.status}]"

