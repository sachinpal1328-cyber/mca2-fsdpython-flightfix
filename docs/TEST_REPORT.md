# FlightFix — Test Report

**Test Date:** 2026-11-20  
**Backend Framework:** `pytest 8.3.4` + `pytest-django 4.9.0` (Django 4.2.17)  
**Frontend Build Tool:** `Vite 5.4.21` (`npm run build`)

---

## 1. Backend Automated Test Execution (`pytest -v`)

| Test Case ID | Test Name | Scope | Result |
|---|---|---|---|
| `TC-01` | `test_health_endpoint` | `/api/health/` returns `200` and `"status": "healthy"` | **PASSED** |
| `TC-02` | `test_jwt_login_and_profile` | JWT login, token issuance, role payload, `/api/accounts/me/` | **PASSED** |
| `TC-03` | `test_rbac_permissions_enforced` | Verifies `FIELD_TECHNICIAN` blocked (403) from user/aircraft creation; `SAFETY_OFFICER` allowed aircraft, blocked from users; `ADMIN` allowed | **PASSED** |
| `TC-04` | `test_maintenance_plan_date_validation` | Rejects `due_date < scheduled_date` with `400 Bad Request` | **PASSED** |
| `TC-05` | `test_workorder_lifecycle_and_task_toggle` | Auto `WO-` number generation, task creation, technician task toggle, work order completion | **PASSED** |
| `TC-06` | `test_inventory_stock_movement_and_part_usage` | Atomic `IN` restock increments quantity; `OUT` exceeding available stock returns `400` | **PASSED** |
| `TC-07` | `test_supply_chain_and_analytics` | Simulated ERP sync returns `201` with `is_simulated=True`; analytics returns seeded KPIs | **PASSED** |

**Summary:** **7 passed, 0 failed** in `9.80s`.

---

## 2. Frontend Production Build Validation

- Command: `cd frontend && npm run build`
- Result: **PASSED** (`111 modules transformed`, built `dist/` in `1.79s` with 0 errors).

---

## 3. Not Tested / Blocked in Sandbox

- **Live Socket / Port Binding (`runserver` + `curl`):** Blocked in sandboxed Windows environment (`WinError 10013`), though all DRF views and serializers are verified through `pytest` `APIClient`.
- **Live Supabase PostgreSQL / Render / Netlify:** Pending user environment credentials and platform deployment.
