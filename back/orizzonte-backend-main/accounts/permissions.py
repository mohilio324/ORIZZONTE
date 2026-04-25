"""
users/permissions.py

Custom DRF permission classes for role-based access control.

Usage in any view:
    from users.permissions import IsBoss, IsEmployee, IsClient

    class MyView(APIView):
        permission_classes = [IsAuthenticated, IsBoss]
"""
from rest_framework.permissions import BasePermission


class IsBoss(BasePermission):
    """Allow access only to users whose role is 'boss'."""
    message = "Access denied. Only the Boss can perform this action."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_boss
        )


class IsEmployee(BasePermission):
    """Allow access only to users whose role is 'employee'."""
    message = "Access denied. This endpoint is for employees only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_employee
        )


class IsClient(BasePermission):
    """Allow access only to users whose role is 'client'."""
    message = "Access denied. This endpoint is for clients only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_client
        )


class IsBossOrEmployee(BasePermission):
    """Allow access to boss or employees (internal staff)."""
    message = "Access denied. Staff only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('boss', 'employee')
        )
