from django.contrib import admin
from .models import Mission


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "client",
        "shipment_type",
        "phone_number",
        "truck_type",
        "category",
        "distance",
        "price",
        "status",
        "assigned_employee",
        "date",
        "created_at",
    ]
    list_filter = ["status", "truck_type", "category", "shipment_type", "date"]
    search_fields = [
        "client__username",
        "assigned_employee__username",
        "phone_number",
        "shipment_type",
    ]
    readonly_fields = ["price", "created_at", "updated_at"]
    raw_id_fields = ["client", "assigned_employee"]

    fieldsets = (
        ("Ownership", {"fields": ("client", "assigned_employee", "status")}),
        (
            "Shipment & Contact",
            {"fields": ("shipment_type", "phone_number")},
        ),
        (
            "Truck",
            {"fields": ("truck_type", "category", "capacity", "size")},
        ),
        (
            "Trip",
            {
                "fields": (
                    "departure_latitude",
                    "departure_longitude",
                    "arrival_latitude",
                    "arrival_longitude",
                    "distance",
                    "date",
                    "time",
                    "workers",
                )
            },
        ),
        ("Financials", {"fields": ("price",)}),
        ("Audit", {"fields": ("created_at", "updated_at")}),
    )
