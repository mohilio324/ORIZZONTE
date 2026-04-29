"""
missions/views.py
~~~~~~~~~~~~~~~~~
API endpoints only — zero business logic.
All logic is delegated to services.py.
 
Endpoint map
------------
Client:
    POST /missions/estimate/          → price estimation (no DB write)
    POST /missions/confirm/           → confirm mission (DB write)
 
Employee:
    GET  /missions/available/         → list active missions with status colours
    POST /missions/<id>/accept/       → accept a mission        (pending → accepted)
    POST /missions/<id>/start/        → start a mission         (accepted → in_progress)
    POST /missions/<id>/complete/     → complete a mission      (in_progress → completed)
 
Boss:
    GET  /missions/all/               → list all missions (full detail)
    GET  /missions/dashboard/         → analytics & business statistics
"""
from __future__ import annotations
 
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
 
from .models import Mission, MissionStatus
from .permissions import IsBoss, IsClient, IsEmployee
from .serializers import (
    BossDashboardSerializer,
    MissionBossSerializer,
    MissionClientSerializer,
    MissionCreateSerializer,
    MissionEmployeeListSerializer,
    PriceEstimateSerializer,
)
from .services import (
    MissionAlreadyAcceptedError,
    MissionInvalidTransitionError,
    MissionNotAssignedToYouError,
    accept_mission,
    assign_mission,
    cancel_mission,
    complete_mission,
    create_mission,
    delete_mission,
    get_boss_dashboard_stats,
    start_mission,
    TRUCK_SIZE_SURCHARGE,
)
 
 
# ---------------------------------------------------------------------------
# Client endpoints
# ---------------------------------------------------------------------------
 
class PriceEstimateView(APIView):
    """
    POST /missions/estimate/
 
    Accepts trip parameters, returns a price estimate.
    No mission is created — client can still cancel.
 
    Permissions: client only.
    """
 
    permission_classes = [IsClient]
 
    def post(self, request):
        serializer = PriceEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        return Response(
            {
                "estimated_price": serializer.validated_data["estimated_price"],
                "breakdown": {
                    "distance_km": serializer.validated_data["distance"],
                    "workers": serializer.validated_data["workers"],
                    "size": serializer.validated_data["size"],
                    "price_per_km": 200,
                    "fixed_fuel_cost": 2000,
                    "price_per_worker": 1500,
                    "size_surcharge": TRUCK_SIZE_SURCHARGE[serializer.validated_data["size"]],
                },
            },
            status=status.HTTP_200_OK,
        )
 
 
class MissionConfirmView(APIView):
    """
    POST /missions/confirm/
 
    Client confirms the price and creates the mission.
    Price is always recalculated server-side.
 
    Permissions: client only.
    """
 
    permission_classes = [IsClient]
 
    def post(self, request):
        serializer = MissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
 
        mission = create_mission(
            client=request.user,
            validated_data=serializer.validated_data,
        )
 
        return Response(
            MissionClientSerializer(mission).data,
            status=status.HTTP_201_CREATED,
        )
 
 
# ---------------------------------------------------------------------------
# Employee endpoints
# ---------------------------------------------------------------------------
 
class AvailableMissionsView(APIView):
    """
    GET /missions/available/
 
    Returns all non-completed missions so the frontend can colour-code them:
        pending     → green   (available to accept)
        accepted    → red     (taken, shows assigned employee name)
        in_progress → orange  (being executed by assigned employee)
 
    Completed missions are excluded — they belong to history, not the dashboard.
 
    Permissions: employee only.
    """
 
    permission_classes = [IsEmployee]
 
    def get(self, request):
        missions = (
            Mission.objects
            .exclude(status=MissionStatus.COMPLETED)
            .select_related("assigned_employee")
            .order_by("-created_at")
        )
        serializer = MissionEmployeeListSerializer(missions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmployeeMissionHistoryView(APIView):
    """
    GET /missions/my/
    
    Returns all missions assigned to the logged-in employee, 
    including completed ones.
    """
    permission_classes = [IsEmployee]

    def get(self, request):
        missions = (
            Mission.objects
            .filter(assigned_employee=request.user)
            .order_by("-created_at")
        )
        serializer = MissionEmployeeListSerializer(missions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
 
 
class AcceptMissionView(APIView):
    """
    POST /missions/<pk>/accept/
 
    Atomically assigns the requesting employee to the mission.
    Returns 409 if another employee already accepted it.
 
    Permissions: employee only.
    """
 
    permission_classes = [IsEmployee]
 
    def post(self, request, pk: int):
        try:
            mission = accept_mission(mission_id=pk, employee=request.user)
        except Mission.DoesNotExist:
            return Response(
                {"detail": "Mission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except MissionAlreadyAcceptedError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )
 
        return Response(
            MissionEmployeeListSerializer(mission).data,
            status=status.HTTP_200_OK,
        )
 
 
class StartMissionView(APIView):
    """
    POST /missions/<pk>/start/
 
    Transitions the mission from ACCEPTED → IN_PROGRESS.
    Only the employee who accepted the mission can start it.
 
    Permissions: employee only.
    """
 
    permission_classes = [IsEmployee]
 
    def post(self, request, pk: int):
        try:
            mission = start_mission(mission_id=pk, employee=request.user)
        except Mission.DoesNotExist:
            return Response(
                {"detail": "Mission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except MissionNotAssignedToYouError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except MissionInvalidTransitionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )
 
        return Response(
            MissionEmployeeListSerializer(mission).data,
            status=status.HTTP_200_OK,
        )
 
 
class CompleteMissionView(APIView):
    """
    POST /missions/<pk>/complete/
 
    Transitions the mission from IN_PROGRESS → COMPLETED.
    Only the employee who accepted the mission can complete it.
 
    Permissions: employee only.
    """
 
    permission_classes = [IsEmployee]
 
    def post(self, request, pk: int):
        try:
            mission = complete_mission(mission_id=pk, employee=request.user)
        except Mission.DoesNotExist:
            return Response(
                {"detail": "Mission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except MissionNotAssignedToYouError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except MissionInvalidTransitionError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )
 
        return Response(
            MissionEmployeeListSerializer(mission).data,
            status=status.HTTP_200_OK,
        )
 
 
# ---------------------------------------------------------------------------
# Boss endpoints
# ---------------------------------------------------------------------------
 
class AllMissionsView(APIView):
    """
    GET /missions/all/
 
    Returns every mission with full detail including client and
    assigned employee information.
 
    Supports optional query-param filtering:
        ?status=pending|accepted|completed
 
    Permissions: boss only.
    """
 
    permission_classes = [IsBoss]
 
    def get(self, request):
        qs = Mission.objects.select_related("client", "assigned_employee").order_by("-created_at")
 
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
 
        serializer = MissionBossSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AssignMissionView(APIView):
    """
    POST /missions/<pk>/assign/

    Boss-only. Assigns a specific employee to a mission.
    Body: { "employee_id": <int> }

    Permissions: boss only.
    """

    permission_classes = [IsBoss]

    def post(self, request, pk: int):
        employee_id = request.data.get("employee_id")
        if not employee_id:
            return Response(
                {"detail": "employee_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            mission = assign_mission(mission_id=pk, employee_id=employee_id)
        except Mission.DoesNotExist:
            return Response(
                {"detail": "Mission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except MissionAlreadyAcceptedError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            MissionBossSerializer(mission).data,
            status=status.HTTP_200_OK,
        )
 
 
class BossDashboardView(APIView):
    """
    GET /missions/dashboard/
 
    Returns aggregated business statistics for the boss:
 
        total_missions_month    — missions created in the current calendar month
        completed_missions      — completed missions this month
        completion_percentage   — completed / total * 100  (0 when no missions)
        today_missions          — missions created today
        monthly_revenue         — sum of price for completed missions this month (DZD)
        monthly_overview        — completed count per month for the last 6 months
                                  [{"month": "January", "year": 2025, "completed": 12}, ...]
 
    All computation is delegated to get_boss_dashboard_stats() in services.py.
    No business logic lives here.
 
    Permissions: boss only.
    """
 
    permission_classes = [IsBoss]
 
    def get(self, request):
        stats      = get_boss_dashboard_stats()
        serializer = BossDashboardSerializer(data=stats)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminEmployeeHistoryView(APIView):
    """
    GET /missions/employee/<id>/
    
    Returns all missions assigned to a specific employee.
    Permissions: boss only.
    """
    permission_classes = [IsBoss]

    def get(self, request, pk: int):
        missions = (
            Mission.objects
            .filter(assigned_employee_id=pk)
            .order_by("-created_at")
        )
        serializer = MissionBossSerializer(missions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CancelMissionView(APIView):
    """
    POST /missions/<pk>/cancel/
    
    Boss-only action. Cancels a mission.
    """
    permission_classes = [IsBoss]

    def post(self, request, pk: int):
        try:
            mission = cancel_mission(mission_id=pk)
            return Response(MissionBossSerializer(mission).data, status=status.HTTP_200_OK)
        except Mission.DoesNotExist:
            return Response({"detail": "Mission not found."}, status=status.HTTP_404_NOT_FOUND)
        except MissionInvalidTransitionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)


class MissionDeleteView(APIView):
    """
    DELETE /missions/<pk>/delete/
    
    Boss-only action. Deletes a mission permanently.
    """
    permission_classes = [IsBoss]

    def delete(self, request, pk: int):
        try:
            delete_mission(mission_id=pk)
            return Response({"message": "Mission deleted."}, status=status.HTTP_200_OK)
        except Mission.DoesNotExist:
            return Response({"detail": "Mission not found."}, status=status.HTTP_404_NOT_FOUND)
