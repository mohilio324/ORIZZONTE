"""
missions/tests/test_services.py
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Unit tests for price calculation, mission creation, and acceptance logic.
"""
from __future__ import annotations

from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model

from missions.models import Mission, MissionStatus, TruckSize
from missions.services import (
    TRUCK_SIZE_SURCHARGE,
    MissionAlreadyAcceptedError,
    accept_mission,
    calculate_price,
    create_mission,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

@pytest.fixture
def client_user(db):
    return User.objects.create_user(username="client1", password="pass", role="client")


@pytest.fixture
def employee_user(db):
    return User.objects.create_user(username="emp1", password="pass", role="employee")


@pytest.fixture
def employee_user_2(db):
    return User.objects.create_user(username="emp2", password="pass", role="employee")


def make_payload(**overrides) -> dict:
    """Return a valid create_mission payload dict."""
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


# ---------------------------------------------------------------------------
# calculate_price — unchanged by this feature, regression guard
# ---------------------------------------------------------------------------

class TestCalculatePrice:

    def test_formula_medium_size(self):
        # (300×200)+2000+(2×1500)+2500 = 67500
        result = calculate_price(Decimal("300"), 2, TruckSize.MEDIUM)
        assert result == Decimal("67500")

    def test_formula_small_size(self):
        # (50×200)+2000+0+1500 = 13500
        result = calculate_price(Decimal("50"), 0, TruckSize.SMALL)
        assert result == Decimal("13500")

    def test_formula_big_size(self):
        # (300×200)+2000+(2×1500)+3000 = 68000
        result = calculate_price(Decimal("300"), 2, TruckSize.BIG)
        assert result == Decimal("68000")

    def test_invalid_workers_raises(self):
        with pytest.raises(ValueError, match="workers must be between"):
            calculate_price(Decimal("100"), 6, TruckSize.SMALL)

    def test_invalid_size_raises(self):
        with pytest.raises(ValueError, match="size must be one of"):
            calculate_price(Decimal("100"), 0, "xxl")


# ---------------------------------------------------------------------------
# create_mission — new fields: shipment_type and phone_number
# ---------------------------------------------------------------------------

class TestCreateMission:

    def test_stores_shipment_type(self, client_user):
        mission = create_mission(client_user, make_payload(shipment_type="commercial_goods"))
        assert mission.shipment_type == "commercial_goods"

    def test_stores_phone_number(self, client_user):
        mission = create_mission(client_user, make_payload(phone_number="0661234567"))
        assert mission.phone_number == "0661234567"

    def test_price_still_calculated_server_side(self, client_user):
        # price = (300×200)+2000+(2×1500)+2500 = 67500
        mission = create_mission(client_user, make_payload())
        assert mission.price == Decimal("67500")

    def test_status_is_pending_on_creation(self, client_user):
        mission = create_mission(client_user, make_payload())
        assert mission.status == MissionStatus.PENDING
        assert mission.assigned_employee is None

    def test_all_new_fields_persisted(self, client_user):
        payload = make_payload(shipment_type="heavy_equipment", phone_number="0771234567")
        mission = create_mission(client_user, payload)
        # Re-fetch from DB to confirm persistence, not just in-memory state
        from_db = Mission.objects.get(pk=mission.pk)
        assert from_db.shipment_type == "heavy_equipment"
        assert from_db.phone_number == "0771234567"


# ---------------------------------------------------------------------------
# accept_mission — no change expected, regression guard
# ---------------------------------------------------------------------------

class TestAcceptMission:

    def test_first_employee_can_accept(self, client_user, employee_user):
        mission = create_mission(client_user, make_payload())
        updated = accept_mission(mission.pk, employee_user)
        assert updated.status == MissionStatus.ACCEPTED
        assert updated.assigned_employee == employee_user

    def test_second_employee_cannot_accept(self, client_user, employee_user, employee_user_2):
        mission = create_mission(client_user, make_payload())
        accept_mission(mission.pk, employee_user)
        with pytest.raises(MissionAlreadyAcceptedError):
            accept_mission(mission.pk, employee_user_2)

    def test_nonexistent_mission_raises(self, employee_user):
        with pytest.raises(Mission.DoesNotExist):
            accept_mission(99999, employee_user)
