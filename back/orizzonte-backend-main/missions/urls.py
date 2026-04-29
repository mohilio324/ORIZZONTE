"""
missions/urls.py
~~~~~~~~~~~~~~~~
URL patterns for the missions app.
 
Include in your project's root urls.py:
 
    path("api/", include("missions.urls")),
 
Which gives you:
    POST   /api/missions/estimate/
    POST   /api/missions/confirm/
    GET    /api/missions/available/
    POST   /api/missions/<pk>/accept/
    POST   /api/missions/<pk>/start/
    POST   /api/missions/<pk>/complete/
    GET    /api/missions/all/
    POST   /api/missions/<pk>/assign/
    GET    /api/missions/dashboard/
"""
from django.urls import path
 
from .views import (
    AcceptMissionView,
    AllMissionsView,
    AssignMissionView,
    AvailableMissionsView,
    BossDashboardView,
    CompleteMissionView,
    MissionConfirmView,
    PriceEstimateView,
    StartMissionView,
    EmployeeMissionHistoryView,
    AdminEmployeeHistoryView,
    CancelMissionView,
    MissionDeleteView,
)
 
app_name = "missions"
 
urlpatterns = [
    # ── Client ──────────────────────────────────────────────────────────────
    path("missions/estimate/", PriceEstimateView.as_view(), name="mission-estimate"),
    path("missions/confirm/", MissionConfirmView.as_view(), name="mission-confirm"),
 
    # ── Employee ─────────────────────────────────────────────────────────────
    path("missions/available/", AvailableMissionsView.as_view(), name="mission-available"),
    path("missions/my/", EmployeeMissionHistoryView.as_view(), name="mission-my"),
    path("missions/<int:pk>/accept/", AcceptMissionView.as_view(), name="mission-accept"),
    path("missions/<int:pk>/start/", StartMissionView.as_view(), name="mission-start"),
    path("missions/<int:pk>/complete/", CompleteMissionView.as_view(), name="mission-complete"),
 
    # ── Boss ─────────────────────────────────────────────────────────────────
    path("missions/all/", AllMissionsView.as_view(), name="mission-all"),
    path("missions/<int:pk>/assign/", AssignMissionView.as_view(), name="mission-assign"),
    path("missions/<int:pk>/cancel/", CancelMissionView.as_view(), name="mission-cancel"),
    path("missions/<int:pk>/delete/", MissionDeleteView.as_view(), name="mission-delete"),
    path("missions/employee/<int:pk>/", AdminEmployeeHistoryView.as_view(), name="mission-employee-history"),
    path("missions/dashboard/", BossDashboardView.as_view(), name="boss-dashboard"),
]
