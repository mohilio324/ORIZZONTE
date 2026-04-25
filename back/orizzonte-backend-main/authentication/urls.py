"""
URL patterns for the authentication app.

All routes are prefixed with /api/ from the root urls.py.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import SignUpView, LoginView, LogoutView, ProfileView

urlpatterns = [
    # ── Public endpoints (no token required) ──────────────────
    path('signup/', SignUpView.as_view(), name='signup'),
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Protected endpoints (Bearer token required) ────────────
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
