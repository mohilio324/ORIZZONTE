"""
missions/tests/test_views.py
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Integration tests for all mission API endpoints.
Covers both existing behaviour (regression) and the new phone_number /
shipment_type fields introduced in this iteration.
"""
from __future__ import annotations

from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

from missions.models import Mission, MissionStatus, TruckSize
from missions.services import create_mission

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_api_payload(**overrides) -> dict:
    """Return a valid JSON-serialisable payload for /confirm/."""
    base = {
        "shipment_type": "house_moving",
        "phone_number": "0551234567",
        "truck_type": "medium",
        "category": "closed",
        "capacity": 5,
        "size": TruckSize.MEDIUM,
        "departure_latitude": "36.737232",
        "departure_longitude": "3.086472",
        "arrival_latitude": "36.365000",
        "arrival_longitude": "6.614000",
        "distance": "300.00",
        "date": "2024-08-01",
        "time": "09:00:00",
        "workers": 2,
    }
    base.update(overrides)
    return base


def make_service_payload(**overrides) -> dict:
    """Return a valid payload for direct calls to services.create_mission()."""
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
def client_user(db):
    return User.objects.create_user(username="client1", password="pass", role="client")


@pytest.fixture
def employee_user(db):
    return User.objects.create_user(username="emp1", password="pass", role="employee")


@pytest.fixture
def boss_user(db):
    return User.objects.create_user(username="boss1", password="pass", role="boss")


def auth_client(user) -> APIClient:
    api = APIClient()
    api.force_authenticate(user=user)
    return api


# ---------------------------------------------------------------------------
# POST /missions/estimate/
# Regression: estimate must remain unchanged — phone_number and
# shipment_type must NOT appear in the request or response.
# ---------------------------------------------------------------------------

class TestPriceEstimateView:

    def test_estimate_returns_correct_price(self, client_user):
        # Estimate payload has NO phone_number or shipment_type
        estimate_payload = {
            "truck_type": "medium",
            "category": "closed",
            "capacity": 5,
            "size": TruckSize.MEDIUM,
            "departure_latitude": "36.737232",
            "departure_longitude": "3.086472",
            "arrival_latitude": "36.365000",
            "arrival_longitude": "6.614000",
            "distance": "300.00",
            "date": "2024-08-01",
            "time": "09:00:00",
            "workers": 2,
        }
        api = auth_client(client_user)
        response = api.post(reverse("missions:mission-estimate"), estimate_payload, format="json")

        assert response.status_code == status.HTTP_200_OK
        # (300×200)+2000+(2×1500)+2500 = 67500
        assert Decimal(str(response.data["estimated_price"])) == Decimal("67500")

    def test_estimate_ignores_extra_fields(self, client_user):
        """
        Even if a client accidentally sends phone_number or shipment_type
        to /estimate/, the endpoint must succeed — DRF ignores unknown fields
        on plain Serializer subclasses by default.
        """
        payload_with_extras = {
            "truck_type": "medium",
            "category": "closed",
            "capacity": 5,
            "size": TruckSize.SMALL,
            "departure_latitude": "36.737232",
            "departure_longitude": "3.086472",
            "arrival_latitude": "36.365000",
            "arrival_longitude": "6.614000",
            "distance": "100.00",
            "date": "2024-08-01",
            "time": "09:00:00",
            "workers": 0,
            # These should be silently ignored:
            "phone_number": "0661234567",
            "shipment_type": "commercial_goods",
        }
        api = auth_client(client_user)
        response = api.post(reverse("missions:mission-estimate"), payload_with_extras, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_employee_cannot_access_estimate(self, employee_user):
        api = auth_client(employee_user)
        response = api.post(reverse("missions:mission-estimate"), {}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_rejected(self):
        response = APIClient().post(reverse("missions:mission-estimate"), {}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ---------------------------------------------------------------------------
# POST /missions/confirm/
# phone_number and shipment_type are REQUIRED here.
# ---------------------------------------------------------------------------

class TestMissionConfirmView:

    # ── Happy-path ────────────────────────────────────────────────────────

    def test_confirm_creates_mission_with_new_fields(self, client_user):
        api = auth_client(client_user)
        response = api.post(
            reverse("missions:mission-confirm"),
            make_api_payload(shipment_type="commercial_goods", phone_number="0661234567"),
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["shipment_type"] == "commercial_goods"
        assert response.data["phone_number"] == "0661234567"

        mission = Mission.objects.get(pk=response.data["id"])
        assert mission.shipment_type == "commercial_goods"
        assert mission.phone_number == "0661234567"

    def test_price_recalculated_server_side(self, client_user):
        api = auth_client(client_user)
        response = api.post(
            reverse("missions:mission-confirm"), make_api_payload(), format="json"
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert Decimal(str(response.data["price"])) == Decimal("67500")

    # ── Phone number validation ───────────────────────────────────────────

    @pytest.mark.parametrize("phone", [
        "0551234567",   # 05 prefix — valid
        "0661234567",   # 06 prefix — valid
        "0771234567",   # 07 prefix — valid
        "0598765432",   # 05, different digits — valid
    ])
    def test_valid_phone_numbers_accepted(self, client_user, phone):
        api = auth_client(client_user)
        response = api.post(
            reverse("missions:mission-confirm"),
            make_api_payload(phone_number=phone),
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED, (
            f"Expected 201 for phone={phone}, got {response.status_code}: {response.data}"
        )

    @pytest.mark.parametrize("bad_phone, reason", [
        ("0412345678", "wrong prefix (04)"),
        ("0312345678", "wrong prefix (03)"),
        ("0123456789", "wrong prefix (01)"),
        ("055123456",  "only 9 digits"),
        ("05512345678","11 digits"),
        ("055123456a", "contains a letter"),
        ("",           "empty string"),
        ("abcdefghij", "all letters"),
        ("+213551234567", "international format not accepted"),
    ])
    def test_invalid_phone_numbers_rejected(self, client_user, bad_phone, reason):
        api = auth_client(client_user)
        response = api.post(
            reverse("missions:mission-confirm"),
            make_api_payload(phone_number=bad_phone),
            format="json",
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST, (
            f"Expected 400 for phone={bad_phone!r} ({reason}), "
            f"got {response.status_code}: {response.data}"
        )
        assert "phone_number" in response.data

    def test_missing_phone_number_returns_400(self, client_user):
        payload = make_api_payload()
        payload.pop("phone_number")
        api = auth_client(client_user)
        response = api.post(reverse("missions:mission-confirm"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "phone_number" in response.data

    # ── Shipment type validation ──────────────────────────────────────────

    def test_missing_shipment_type_returns_400(self, client_user):
        payload = make_api_payload()
        payload.pop("shipment_type")
        api = auth_client(client_user)
        response = api.post(reverse("missions:mission-confirm"), payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "shipment_type" in response.data

    def test_shipment_type_normalised_to_lowercase(self, client_user):
        api = auth_client(client_user)
        response = api.post(
            reverse("missions:mission-confirm"),
            make_api_payload(shipment_type="  House_Moving  "),
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["shipment_type"] == "house_moving"

    def test_boss_cannot_confirm(self, boss_user):
        api = auth_client(boss_user)
        response = api.post(
            reverse("missions:mission-confirm"), make_api_payload(), format="json"
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# GET /missions/available/
# New fields must appear in employee responses.
# ---------------------------------------------------------------------------

class TestAvailableMissionsView:

    def test_employee_response_contains_new_fields(self, client_user, employee_user):
        create_mission(client_user, make_service_payload())

        api = auth_client(employee_user)
        response = api.get(reverse("missions:mission-available"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        record = response.data[0]
        assert "shipment_type" in record
        assert "phone_number" in record
        assert record["shipment_type"] == "house_moving"
        assert record["phone_number"] == "0551234567"

    def test_is_taken_flag_works_correctly(self, client_user, employee_user):
        m1 = create_mission(client_user, make_service_payload())
        m2 = create_mission(client_user, make_service_payload(distance=Decimal("200")))
        m2.status = MissionStatus.ACCEPTED
        m2.assigned_employee = employee_user
        m2.save()

        api = auth_client(employee_user)
        response = api.get(reverse("missions:mission-available"))

        assert response.status_code == status.HTTP_200_OK
        by_id = {m["id"]: m for m in response.data}
        assert by_id[m1.pk]["is_taken"] is False
        assert by_id[m2.pk]["is_taken"] is True
        assert by_id[m2.pk]["taken_by"] is not None

    def test_client_cannot_access(self, client_user):
        api = auth_client(client_user)
        response = api.get(reverse("missions:mission-available"))
        assert response.status_code == status.HTTP_403_FORBIDDEN


# ---------------------------------------------------------------------------
# POST /missions/<pk>/accept/
# Acceptance logic unchanged — new fields have no effect here.
# ---------------------------------------------------------------------------

class TestAcceptMissionView:

    def test_employee_can_accept(self, client_user, employee_user):
        mission = create_mission(client_user, make_service_payload())
        api = auth_client(employee_user)
        response = api.post(reverse("missions:mission-accept", kwargs={"pk": mission.pk}))

        assert response.status_code == status.HTTP_200_OK
        mission.refresh_from_db()
        assert mission.status == MissionStatus.ACCEPTED
        assert mission.assigned_employee == employee_user

    def test_second_employee_gets_409(self, client_user, employee_user, db):
        emp2 = User.objects.create_user(username="emp2", password="pass", role="employee")
        mission = create_mission(client_user, make_service_payload())

        auth_client(employee_user).post(
            reverse("missions:mission-accept", kwargs={"pk": mission.pk})
        )
        response = auth_client(emp2).post(
            reverse("missions:mission-accept", kwargs={"pk": mission.pk})
        )
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_accept_nonexistent_mission_returns_404(self, employee_user):
        response = auth_client(employee_user).post(
            reverse("missions:mission-accept", kwargs={"pk": 99999})
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# GET /missions/all/
# New fields must appear in boss responses.
# ---------------------------------------------------------------------------

class TestAllMissionsView:

    def test_boss_response_contains_new_fields(self, client_user, boss_user):
        create_mission(
            client_user,
            make_service_payload(shipment_type="heavy_equipment", phone_number="0771234567"),
        )

        api = auth_client(boss_user)
        response = api.get(reverse("missions:mission-all"))

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        record = response.data[0]
        assert record["shipment_type"] == "heavy_equipment"
        assert record["phone_number"] == "0771234567"

    def test_boss_sees_full_details(self, client_user, boss_user):
        create_mission(client_user, make_service_payload())
        api = auth_client(boss_user)
        response = api.get(reverse("missions:mission-all"))

        assert response.status_code == status.HTTP_200_OK
        record = response.data[0]
        for field in ("client", "assigned_employee", "price", "size",
                      "shipment_type", "phone_number"):
            assert field in record, f"Missing field: {field}"

    def test_boss_can_filter_by_status(self, client_user, employee_user, boss_user):
        m = create_mission(client_user, make_service_payload())
        create_mission(client_user, make_service_payload(distance=Decimal("50")))
        m.status = MissionStatus.ACCEPTED
        m.assigned_employee = employee_user
        m.save()

        api = auth_client(boss_user)
        response = api.get(reverse("missions:mission-all"), {"status": "accepted"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_employee_cannot_access_boss_endpoint(self, employee_user):
        response = auth_client(employee_user).get(reverse("missions:mission-all"))
        assert response.status_code == status.HTTP_403_FORBIDDEN
