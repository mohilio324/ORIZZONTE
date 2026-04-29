"""
missions/tests/test_lifecycle.py
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Tests for the extended mission lifecycle:
    pending → accepted → in_progress → completed

Covers:
  ✔ happy path: start and complete by assigned employee
  ✔ display_status values in employee list response
  ✗ wrong employee blocked at each step
  ✗ invalid transitions (skipping steps, acting on wrong status)
  ✗ completed mission is immutable
"""
from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from missions.models import Mission, MissionStatus, TruckSize
from missions.services import (
    MissionInvalidTransitionError,
    MissionNotAssignedToYouError,
    accept_mission,
    complete_mission,
    create_mission,
    start_mission,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures & helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def client_user(db):
    return User.objects.create_user(username="client1", password="pass", role="client")


@pytest.fixture
def employee_user(db):
    return User.objects.create_user(username="emp1", password="pass", role="employee")


@pytest.fixture
def other_employee(db):
    return User.objects.create_user(username="emp2", password="pass", role="employee")


@pytest.fixture
def boss_user(db):
    return User.objects.create_user(username="boss1", password="pass", role="boss")


def make_payload(**overrides) -> dict:
    base = {
        "shipment_type": "house_moving",
        "phone_number": "0551234567",
        "truck_type": "medium",
        "category": "closed",
        "capacity": 5,
        "size": TruckSize.MEDIUM,
        "departure_latitude": Decimal("36.737232"),
        "departure_longitude": Decimal("3.086472"),
        "arrival_latitude": Decimal("36.365"),
        "arrival_longitude": Decimal("6.614"),
        "distance": Decimal("300.00"),
        "date": "2024-08-01",
        "time": "09:00:00",
        "workers": 2,
    }
    base.update(overrides)
    return base


@pytest.fixture
def pending_mission(client_user):
    return create_mission(client_user, make_payload())


@pytest.fixture
def accepted_mission(client_user, employee_user):
    mission = create_mission(client_user, make_payload())
    return accept_mission(mission.pk, employee_user)


@pytest.fixture
def in_progress_mission(client_user, employee_user):
    mission = create_mission(client_user, make_payload())
    accept_mission(mission.pk, employee_user)
    return start_mission(mission.pk, employee_user)


def auth_api(user) -> APIClient:
    api = APIClient()
    api.force_authenticate(user=user)
    return api


# ===========================================================================
# Service layer tests
# ===========================================================================

class TestStartMissionService:

    def test_assigned_employee_can_start(self, accepted_mission, employee_user):
        result = start_mission(accepted_mission.pk, employee_user)
        assert result.status == MissionStatus.IN_PROGRESS

    def test_status_persisted_to_db(self, accepted_mission, employee_user):
        start_mission(accepted_mission.pk, employee_user)
        accepted_mission.refresh_from_db()
        assert accepted_mission.status == MissionStatus.IN_PROGRESS

    def test_other_employee_blocked(self, accepted_mission, other_employee):
        with pytest.raises(MissionNotAssignedToYouError):
            start_mission(accepted_mission.pk, other_employee)

    def test_cannot_start_pending_mission(self, pending_mission, employee_user):
        """pending → in_progress is not a valid transition."""
        with pytest.raises(MissionInvalidTransitionError, match="expected status 'accepted'"):
            start_mission(pending_mission.pk, employee_user)

    def test_cannot_start_already_in_progress(self, in_progress_mission, employee_user):
        with pytest.raises(MissionInvalidTransitionError):
            start_mission(in_progress_mission.pk, employee_user)

    def test_nonexistent_mission_raises(self, employee_user):
        with pytest.raises(Mission.DoesNotExist):
            start_mission(99999, employee_user)


class TestCompleteMissionService:

    def test_assigned_employee_can_complete(self, in_progress_mission, employee_user):
        result = complete_mission(in_progress_mission.pk, employee_user)
        assert result.status == MissionStatus.COMPLETED

    def test_status_persisted_to_db(self, in_progress_mission, employee_user):
        complete_mission(in_progress_mission.pk, employee_user)
        in_progress_mission.refresh_from_db()
        assert in_progress_mission.status == MissionStatus.COMPLETED

    def test_other_employee_blocked(self, in_progress_mission, other_employee):
        with pytest.raises(MissionNotAssignedToYouError):
            complete_mission(in_progress_mission.pk, other_employee)

    def test_cannot_complete_accepted_mission(self, accepted_mission, employee_user):
        """accepted → completed is not a valid transition (must go through in_progress)."""
        with pytest.raises(MissionInvalidTransitionError, match="expected status 'in_progress'"):
            complete_mission(accepted_mission.pk, employee_user)

    def test_cannot_complete_pending_mission(self, pending_mission, employee_user):
        with pytest.raises(MissionInvalidTransitionError):
            complete_mission(pending_mission.pk, employee_user)

    def test_cannot_complete_already_completed(self, in_progress_mission, employee_user):
        complete_mission(in_progress_mission.pk, employee_user)
        with pytest.raises(MissionInvalidTransitionError):
            complete_mission(in_progress_mission.pk, employee_user)

    def test_nonexistent_mission_raises(self, employee_user):
        with pytest.raises(Mission.DoesNotExist):
            complete_mission(99999, employee_user)


# ===========================================================================
# API / view layer tests
# ===========================================================================

class TestStartMissionView:

    def test_assigned_employee_gets_200(self, accepted_mission, employee_user):
        url = reverse("missions:mission-start", kwargs={"pk": accepted_mission.pk})
        response = auth_api(employee_user).post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == MissionStatus.IN_PROGRESS

    def test_other_employee_gets_403(self, accepted_mission, other_employee):
        url = reverse("missions:mission-start", kwargs={"pk": accepted_mission.pk})
        response = auth_api(other_employee).post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_wrong_status_gets_409(self, pending_mission, employee_user):
        """Cannot start a pending mission."""
        # Give the pending mission to employee_user so ownership check passes
        pending_mission.assigned_employee = employee_user
        pending_mission.status = MissionStatus.PENDING
        pending_mission.save()

        url = reverse("missions:mission-start", kwargs={"pk": pending_mission.pk})
        response = auth_api(employee_user).post(url)
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_nonexistent_mission_gets_404(self, employee_user):
        url = reverse("missions:mission-start", kwargs={"pk": 99999})
        response = auth_api(employee_user).post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_boss_cannot_access(self, accepted_mission, boss_user):
        url = reverse("missions:mission-start", kwargs={"pk": accepted_mission.pk})
        response = auth_api(boss_user).post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_rejected(self, accepted_mission):
        url = reverse("missions:mission-start", kwargs={"pk": accepted_mission.pk})
        response = APIClient().post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestCompleteMissionView:

    def test_assigned_employee_gets_200(self, in_progress_mission, employee_user):
        url = reverse("missions:mission-complete", kwargs={"pk": in_progress_mission.pk})
        response = auth_api(employee_user).post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == MissionStatus.COMPLETED

    def test_other_employee_gets_403(self, in_progress_mission, other_employee):
        url = reverse("missions:mission-complete", kwargs={"pk": in_progress_mission.pk})
        response = auth_api(other_employee).post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_skipping_start_gets_409(self, accepted_mission, employee_user):
        """accepted → completed directly is rejected."""
        url = reverse("missions:mission-complete", kwargs={"pk": accepted_mission.pk})
        response = auth_api(employee_user).post(url)
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_nonexistent_mission_gets_404(self, employee_user):
        url = reverse("missions:mission-complete", kwargs={"pk": 99999})
        response = auth_api(employee_user).post(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_boss_cannot_access(self, in_progress_mission, boss_user):
        url = reverse("missions:mission-complete", kwargs={"pk": in_progress_mission.pk})
        response = auth_api(boss_user).post(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_rejected(self, in_progress_mission):
        url = reverse("missions:mission-complete", kwargs={"pk": in_progress_mission.pk})
        response = APIClient().post(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestFullLifecycleFlow:
    """
    End-to-end happy path: pending → accepted → in_progress → completed.
    Verifies status at every step.
    """

    def test_full_lifecycle(self, pending_mission, employee_user):
        pk = pending_mission.pk

        # Step 1: accept
        accept_url  = reverse("missions:mission-accept",   kwargs={"pk": pk})
        start_url   = reverse("missions:mission-start",    kwargs={"pk": pk})
        complete_url = reverse("missions:mission-complete", kwargs={"pk": pk})
        api = auth_api(employee_user)

        r1 = api.post(accept_url)
        assert r1.status_code == status.HTTP_200_OK
        assert r1.data["status"] == MissionStatus.ACCEPTED

        # Step 2: start
        r2 = api.post(start_url)
        assert r2.status_code == status.HTTP_200_OK
        assert r2.data["status"] == MissionStatus.IN_PROGRESS

        # Step 3: complete
        r3 = api.post(complete_url)
        assert r3.status_code == status.HTTP_200_OK
        assert r3.data["status"] == MissionStatus.COMPLETED

        # Confirm final DB state
        pending_mission.refresh_from_db()
        assert pending_mission.status == MissionStatus.COMPLETED


class TestDisplayStatusField:
    """
    Verify the display_status field in employee list responses for all statuses.
    """

    def _get_list(self, employee_user, extra_status_filter=None):
        url = reverse("missions:mission-available")
        api = auth_api(employee_user)
        return api.get(url)

    def test_pending_shows_available(self, pending_mission, employee_user):
        response = self._get_list(employee_user)
        assert response.status_code == status.HTTP_200_OK
        record = next(m for m in response.data if m["id"] == pending_mission.pk)
        assert record["display_status"] == "available"
        assert record["is_taken"] is False

    def test_accepted_shows_taken(self, accepted_mission, employee_user):
        response = self._get_list(employee_user)
        assert response.status_code == status.HTTP_200_OK
        record = next(m for m in response.data if m["id"] == accepted_mission.pk)
        assert record["display_status"] == "taken"
        assert record["is_taken"] is True

    def test_in_progress_shows_in_progress(self, in_progress_mission, employee_user):
        response = self._get_list(employee_user)
        assert response.status_code == status.HTTP_200_OK
        record = next(m for m in response.data if m["id"] == in_progress_mission.pk)
        assert record["display_status"] == "in_progress"
        assert record["is_taken"] is True

    def test_completed_mission_excluded_from_available(self, in_progress_mission, employee_user):
        """Completed missions must NOT appear in the employee dashboard."""
        complete_mission(in_progress_mission.pk, employee_user)

        response = self._get_list(employee_user)
        ids = [m["id"] for m in response.data]
        assert in_progress_mission.pk not in ids


class TestBossSeeFullLifecycle:

    def test_boss_sees_in_progress_status(self, in_progress_mission, boss_user):
        url = reverse("missions:mission-all")
        response = auth_api(boss_user).get(url)

        assert response.status_code == status.HTTP_200_OK
        record = next(m for m in response.data if m["id"] == in_progress_mission.pk)
        assert record["status"] == MissionStatus.IN_PROGRESS
        assert record["assigned_employee"] is not None

    def test_boss_can_filter_in_progress(self, in_progress_mission, pending_mission, boss_user):
        url = reverse("missions:mission-all")
        response = auth_api(boss_user).get(url, {"status": "in_progress"})

        assert response.status_code == status.HTTP_200_OK
        assert all(m["status"] == MissionStatus.IN_PROGRESS for m in response.data)
        ids = [m["id"] for m in response.data]
        assert in_progress_mission.pk in ids
        assert pending_mission.pk not in ids
