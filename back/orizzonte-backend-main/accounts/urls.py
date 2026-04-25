"""
users/urls.py

All new user-management routes.
Mounted at /api/ in demenagement/urls.py alongside the existing auth routes.

Full URL map after integration:
    POST   /api/signup/                  → ClientSignUp (clients only)
    POST   /api/token/                   → Login (all roles, returns role in response)
    POST   /api/token/refresh/           → Refresh access token  [unchanged]
    POST   /api/logout/                  → Blacklist refresh token [unchanged]

    GET    /api/users/me/                → Current user profile + role
    POST   /api/users/employees/         → Create employee [boss only]
    GET    /api/users/employees/         → List employees   [boss only]
    GET    /api/users/employees/<id>/    → Employee detail  [boss only]
    DELETE /api/users/employees/<id>/    → Remove employee  [boss only]
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from authentication.views import LogoutView   # ← reuse existing logout unchanged

from .views import (
    SignUpView,
    LoginView,
    MeView,
    CreateEmployeeView,
    EmployeeListView,
    EmployeeDetailView,
)

urlpatterns = [
    # ── Public ────────────────────────────────────────────────
    path('signup/', SignUpView.as_view(), name='signup'),
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Any authenticated user ─────────────────────────────────
    path('logout/', LogoutView.as_view(), name='logout'),       # unchanged
    path('users/me/', MeView.as_view(), name='me'),

    # ── Boss only ──────────────────────────────────────────────
    path('users/employees/', EmployeeListView.as_view(), name='employee-list'),
    path('users/employees/create/', CreateEmployeeView.as_view(), name='employee-create'),
    path('users/employees/<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
]
