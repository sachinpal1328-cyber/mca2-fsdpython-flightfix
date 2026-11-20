# FlightFix — PostgreSQL Schema & Seed Data Documentation

This document complements [DATABASE_DESIGN.md](../docs/DATABASE_DESIGN.md) and describes how the relational schema is managed and seeded for **Supabase PostgreSQL**.

## 1. Migration Strategy

All tables, foreign keys, unique constraints, check constraints, and indexes are defined in Django ORM models across 10 domain apps and applied via Django migrations:

```bash
cd backend
python manage.py migrate
```

### App Migration Files
- `apps/accounts/migrations/0001_initial.py` — `accounts_user`
- `apps/aircraft/migrations/0001_initial.py` — `aircraft_aircraft`, `aircraft_equipment`
- `apps/maintenance/migrations/0001_initial.py` — `maintenance_maintenanceplan`
- `apps/workorders/migrations/0001_initial.py` — `workorders_workorder`, `workorders_workordertask`
- `apps/inventory/migrations/0001_initial.py` — `inventory_sparepart`, `inventory_stockmovement`
- `apps/execution/migrations/0001_initial.py` — `execution_maintenanceexecution`, `execution_partusage`
- `apps/compliance/migrations/0001_initial.py` — `compliance_compliancerecord`, `compliance_inspection`
- `apps/integrations/migrations/0001_initial.py` — `integrations_vendor`, `integrations_purchaserequest`, `integrations_integrationlog`
- `apps/notifications/migrations/0001_initial.py` — `notifications_notification`

## 2. Seed / Demo Data

Seed data is idempotent and loaded via:

```bash
python manage.py seed_flightfix
```

It populates:
- **5 Users** across 4 roles (`admin`, `safety_officer`, `contracts_mgr`, `tech_arjun`, `tech_priya`).
- **6 Indian-registered Aircraft** (`VT-FFX`, `VT-IND`, `VT-HAL`, `VT-BLR`, `VT-DEL`, `VT-BOM`) and **8 Equipment** items.
- **6 Maintenance Plans** (A/B/C-Check, Line, Overdue, Completed).
- **5 Work Orders** (`WO-2026-0001`..`0005`) with **15 Work Order Tasks**.
- **8 Spare Parts** with INR unit costs (`₹14,500` to `₹2,15,000`), including 3 low-stock items, and initial `StockMovement` records.
- **2 Maintenance Execution Logs** and **1 Part Usage** record.
- **5 Compliance Records** and **4 Inspections**.
- **4 Indian Aerospace Vendors** (HAL, BEL, Tata Advanced Systems, IndianOil Aviation), **3 Purchase Requests**, and **2 Simulated ERP Integration Logs**.
- **4 Operational Notifications**.
