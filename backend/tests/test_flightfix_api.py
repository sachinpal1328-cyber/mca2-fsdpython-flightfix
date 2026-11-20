from datetime import date, timedelta
from decimal import Decimal
import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.aircraft.models import Aircraft
from apps.inventory.models import SparePart
from apps.workorders.models import WorkOrder


@pytest.fixture
def seeded_db(db):
    call_command("seed_flightfix")
    return {
        "admin": User.objects.get(username="admin"),
        "safety": User.objects.get(username="safety_officer"),
        "contracts": User.objects.get(username="contracts_mgr"),
        "tech": User.objects.get(username="tech_arjun"),
    }


def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_health_endpoint():
    client = APIClient()
    resp = client.get("/api/health/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


@pytest.mark.django_db
def test_jwt_login_and_profile(seeded_db):
    client = APIClient()
    resp = client.post(
        "/api/accounts/login/",
        {"username": "safety_officer", "password": "FlightFix@123"},
        format="json",
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access" in data
    assert "refresh" in data
    assert data["user"]["role"] == "SAFETY_OFFICER"

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {data['access']}")
    me = client.get("/api/accounts/me/")
    assert me.status_code == 200
    assert me.json()["username"] == "safety_officer"


@pytest.mark.django_db
def test_rbac_permissions_enforced(seeded_db):
    # Field technician cannot create/delete users or create aircraft
    tech_client = auth_client(seeded_db["tech"])
    assert tech_client.get("/api/accounts/users/").status_code == 403
    assert (
        tech_client.post(
            "/api/aircraft/",
            {"registration": "VT-TST", "model_name": "A320", "manufacturer": "Airbus", "serial_number": "SN-999"},
            format="json",
        ).status_code
        == 403
    )

    # Safety officer CAN create aircraft, CANNOT manage users
    safety_client = auth_client(seeded_db["safety"])
    assert safety_client.get("/api/accounts/users/").status_code == 403
    resp = safety_client.post(
        "/api/aircraft/",
        {
            "registration": "VT-NEW",
            "model_name": "A321neo",
            "manufacturer": "Airbus",
            "serial_number": "MSN-9999",
            "status": "OPERATIONAL",
            "flight_hours": "120.5",
        },
        format="json",
    )
    assert resp.status_code == 201

    # Admin CAN manage users
    admin_client = auth_client(seeded_db["admin"])
    assert admin_client.get("/api/accounts/users/").status_code == 200


@pytest.mark.django_db
def test_maintenance_plan_date_validation(seeded_db):
    client = auth_client(seeded_db["safety"])
    ac = Aircraft.objects.first()
    resp = client.post(
        "/api/maintenance/plans/",
        {
            "title": "Invalid Date Plan",
            "aircraft": ac.id,
            "maintenance_type": "A_CHECK",
            "scheduled_date": str(date.today() + timedelta(days=10)),
            "due_date": str(date.today() + timedelta(days=5)),
        },
        format="json",
    )
    assert resp.status_code == 400
    assert "due_date" in resp.json()


@pytest.mark.django_db
def test_workorder_lifecycle_and_task_toggle(seeded_db):
    safety_client = auth_client(seeded_db["safety"])
    tech_client = auth_client(seeded_db["tech"])
    ac = Aircraft.objects.first()

    wo_resp = safety_client.post(
        "/api/workorders/orders/",
        {
            "title": "Test Wing Flap Inspection",
            "aircraft": ac.id,
            "priority": "HIGH",
            "assigned_technician": seeded_db["tech"].id,
            "due_date": str(date.today() + timedelta(days=3)),
        },
        format="json",
    )
    assert wo_resp.status_code == 201
    wo_id = wo_resp.json()["id"]
    assert wo_resp.json()["wo_number"].startswith("WO-")

    task_resp = safety_client.post(
        "/api/workorders/tasks/",
        {"work_order": wo_id, "title": "Inspect actuator bolts", "order": 1},
        format="json",
    )
    assert task_resp.status_code == 201
    task_id = task_resp.json()["id"]

    # Technician toggles task and completes work order
    toggle = tech_client.post(f"/api/workorders/tasks/{task_id}/toggle/")
    assert toggle.status_code == 200
    assert toggle.json()["is_completed"] is True

    complete = tech_client.post(f"/api/workorders/orders/{wo_id}/complete/")
    assert complete.status_code == 200
    assert complete.json()["status"] == "COMPLETED"


@pytest.mark.django_db
def test_inventory_stock_movement_and_part_usage(seeded_db):
    contracts_client = auth_client(seeded_db["contracts"])
    tech_client = auth_client(seeded_db["tech"])
    part = SparePart.objects.get(part_number="FF-ENG-104")
    initial_qty = part.quantity

    # Stock IN
    in_resp = contracts_client.post(
        "/api/inventory/movements/",
        {
            "part": part.id,
            "movement_type": "IN",
            "quantity": 5,
            "reference_note": "Test restock",
        },
        format="json",
    )
    assert in_resp.status_code == 201
    part.refresh_from_db()
    assert part.quantity == initial_qty + 5

    # Insufficient stock OUT should fail
    bad_out = tech_client.post(
        "/api/inventory/movements/",
        {
            "part": part.id,
            "movement_type": "OUT",
            "quantity": initial_qty + 100,
            "reference_note": "Too much",
        },
        format="json",
    )
    assert bad_out.status_code == 400


@pytest.mark.django_db
def test_supply_chain_and_analytics(seeded_db):
    contracts_client = auth_client(seeded_db["contracts"])
    sync_resp = contracts_client.post("/api/supply-chain/logs/simulate-erp-sync/")
    assert sync_resp.status_code == 201
    assert sync_resp.json()["is_simulated"] is True

    analytics_resp = contracts_client.get("/api/analytics/dashboard/")
    assert analytics_resp.status_code == 200
    kpis = analytics_resp.json()["kpis"]
    assert kpis["total_aircraft"] >= 6
    assert kpis["total_parts"] >= 8
