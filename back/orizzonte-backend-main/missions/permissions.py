"""
missions/permissions.py
~~~~~~~~~~~~~~~~~~~~~~~
Role-based DRF permission classes.

Assumes the User model has a `role` field with values:
    "client" | "employee" | "boss"

Adjust the role-check logic below to match your actual User model.
For example, if you use groups instead:
    return request.user.groups.filter(name="employee").exists()
"""
from rest_framework.permissions import IsAuthenticated


class IsClient(IsAuthenticated):
    """Allow access only to authenticated users with role='client'."""

    def has_permission(self, request, view) -> bool:
        return (
            super().has_permission(request, view)
            and getattr(request.user, "role", None) == "client"
        )


class IsEmployee(IsAuthenticated):
    """Allow access only to authenticated users with role='employee'."""

    def has_permission(self, request, view) -> bool:
        return (
            super().has_permission(request, view)
            and getattr(request.user, "role", None) == "employee"
        )


class IsBoss(IsAuthenticated):
    """Allow access only to authenticated users with role='boss'."""

    def has_permission(self, request, view) -> bool:
        return (
            super().has_permission(request, view)
            and getattr(request.user, "role", None) == "boss"
        )


class IsEmployeeOrBoss(IsAuthenticated):
    """Allow access to employees and bosses."""

    def has_permission(self, request, view) -> bool:
        return (
            super().has_permission(request, view)
            and getattr(request.user, "role", None) in ("employee", "boss")
        )
