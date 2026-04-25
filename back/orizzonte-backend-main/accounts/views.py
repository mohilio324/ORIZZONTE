"""
users/views.py

New views that EXTEND (never replace) the existing authentication/ views.

What is untouched in authentication/:
    - LogoutView      → works as-is, no changes
    - ProfileView     → now returns role too (via updated serializer)

What is replaced/extended here:
    - SignUpView      → now hard-codes role='client'
    - LoginView       → now returns role + user info in response
    - New: CreateEmployeeView   (boss only)
    - New: EmployeeListView     (boss only)
    - New: MeView               (any authenticated user — role-aware profile)
"""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsBoss
from .serializers import (
    ClientSignUpSerializer,
    CreateEmployeeSerializer,
    EmployeeListSerializer,
    RoleAwareTokenSerializer,
    UserResponseSerializer,
)

# The existing LogoutSerializer lives in authentication/views.py.
# We import it to reuse it in our new LogoutView wrapper — or you can
# keep using authentication/views.LogoutView directly. Either works.


# ─────────────────────────────────────────────────────────────
#  Auth views (replace the ones in authentication/views.py)
# ─────────────────────────────────────────────────────────────

class SignUpView(APIView):
    """
    POST /api/signup/

    Public endpoint. Clients only.
    Role is set to 'client' by the backend — users cannot choose it.

    Body: { "username", "email", "password" }

    201 → { "message": "...", "user": { id, username, email, role, date_joined } }
    400 → { "message": "...", "errors": { ... } }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientSignUpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "message": "Registration failed. Please check the errors below.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = serializer.save()
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserResponseSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    """
    POST /api/token/

    Works for ALL roles: boss, employee, client.
    Returns role + user info in addition to JWT tokens.

    Body: { "username", "password" }

    200 → {
        "id": 1,
        "username": "john",
        "email": "john@example.com",
        "role": "employee",
        "access": "<jwt>",
        "refresh": "<jwt>"
    }
    401 → { "detail": "No active account found with the given credentials" }
    """
    permission_classes = [AllowAny]
    serializer_class = RoleAwareTokenSerializer   # ← only change vs old LoginView


class MeView(APIView):
    """
    GET /api/users/me/

    Returns the authenticated user's full profile including role.
    Works for every role. Frontend uses `role` for dashboard routing.

    Header: Authorization: Bearer <access_token>

    200 → { id, username, email, role, date_joined }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            UserResponseSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )


# ─────────────────────────────────────────────────────────────
#  Employee management (boss only)
# ─────────────────────────────────────────────────────────────

class CreateEmployeeView(APIView):
    """
    POST /api/users/employees/

    Boss-only. Creates a new employee account.
    Role is automatically set to 'employee' — boss cannot set it to anything else.

    Header: Authorization: Bearer <boss_access_token>
    Body:   { "username", "password", "email" (optional) }

    201 → { "message": "...", "employee": { id, username, email, role, date_joined } }
    400 → { "message": "...", "errors": { ... } }
    403 → { "detail": "Access denied. Only the Boss can perform this action." }
    """
    permission_classes = [IsAuthenticated, IsBoss]

    def post(self, request):
        serializer = CreateEmployeeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "message": "Employee creation failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        employee = serializer.save()
        return Response(
            {
                "message": f"Employee '{employee.username}' created successfully.",
                "employee": UserResponseSerializer(employee).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmployeeListView(APIView):
    """
    GET /api/users/employees/

    Boss-only. Returns all employee accounts.

    Header: Authorization: Bearer <boss_access_token>

    200 → [ { id, username, email, date_joined }, ... ]
    403 → { "detail": "Access denied. Only the Boss can perform this action." }
    """
    permission_classes = [IsAuthenticated, IsBoss]

    def get(self, request):
        employees = User.objects.filter(role=User.Role.EMPLOYEE).order_by('date_joined')
        return Response(
            EmployeeListSerializer(employees, many=True).data,
            status=status.HTTP_200_OK,
        )


class EmployeeDetailView(APIView):
    """
    GET    /api/users/employees/<id>/   → view one employee
    DELETE /api/users/employees/<id>/   → remove an employee

    Boss-only.
    """
    permission_classes = [IsAuthenticated, IsBoss]

    def _get_employee(self, pk):
        try:
            return User.objects.get(pk=pk, role=User.Role.EMPLOYEE)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        employee = self._get_employee(pk)
        if not employee:
            return Response(
                {"message": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(
            UserResponseSerializer(employee).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        employee = self._get_employee(pk)
        if not employee:
            return Response(
                {"message": "Employee not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        username = employee.username
        employee.delete()
        return Response(
            {"message": f"Employee '{username}' has been removed."},
            status=status.HTTP_200_OK,
        )


# Create your views here.
