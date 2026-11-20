# FlightFix — REST API Documentation

**Base URL (Local):** `http://localhost:8000/api`  
**Interactive Swagger UI:** `/api/docs/` | **OpenAPI Schema:** `/api/schema/`  
**Authentication:** JWT Bearer Token (`Authorization: Bearer <access_token>`)

---

## 1. Authentication & Accounts (`/api/accounts/`)

| Method | Endpoint | Auth / Role | Description |
|---|---|---|---|
| `POST` | `/api/accounts/login/` | Public | Obtain `access`, `refresh`, and `user` profile |
| `POST` | `/api/accounts/refresh/` | Public | Rotate refresh token and obtain new `access` token |
| `POST` | `/api/accounts/logout/` | Authenticated | Blacklist refresh token |
| `GET/PATCH` | `/api/accounts/me/` | Authenticated | Retrieve or update current user profile |
| `GET` | `/api/accounts/technicians/` | Authenticated | List active users for assignment dropdowns |
| `GET/POST/PATCH/DELETE` | `/api/accounts/users/` | `ADMIN` only | User Management CRUD |
| `POST` | `/api/accounts/users/{id}/activate/` | `ADMIN` only | Activate user |
| `POST` | `/api/accounts/users/{id}/deactivate/` | `ADMIN` only | Deactivate user |

### Example Login Request
```json
POST /api/accounts/login/
{
  "username": "safety_officer",
  "password": "FlightFix@123"
}
```
### Example Login Response (`200 OK`)
```json
{
  "refresh": "<jwt-refresh-token>",
  "access": "<jwt-access-token>",
  "user": {
    "id": 2,
    "username": "safety_officer",
    "email": "safety@flightfix.in",
    "role": "SAFETY_OFFICER",
    "employee_id": "EMP-FF-002"
  }
}
```

---

## 2. Domain Endpoints

| Module | Endpoints | Permissions |
|---|---|---|
| **Health** | `GET /api/health/` | Public |
| **Aircraft & Equipment** | `CRUD /api/aircraft/`, `CRUD /api/equipment/` | Read: All Auth; Write: `ADMIN`, `SAFETY_OFFICER` |
| **Maintenance Plans** | `CRUD /api/maintenance/plans/`, `POST /api/maintenance/plans/{id}/archive/` | Read: All Auth; Write: `ADMIN`, `SAFETY_OFFICER` |
| **Work Orders** | `CRUD /api/workorders/orders/`, `GET /api/workorders/orders/my_work_orders/`, `POST .../start/`, `POST .../complete/` | Read: All Auth; Create/Edit: `ADMIN`, `SAFETY_OFFICER`; Start/Complete: + `FIELD_TECHNICIAN` |
| **Work Order Tasks** | `CRUD /api/workorders/tasks/`, `POST /api/workorders/tasks/{id}/toggle/` | `ADMIN`, `SAFETY_OFFICER`, `FIELD_TECHNICIAN` |
| **Inventory** | `CRUD /api/inventory/parts/`, `GET /api/inventory/parts/low_stock/`, `CRUD /api/inventory/movements/` | Parts Write: `ADMIN`, `CONTRACTS_MANAGER`; Movements: All Auth |
| **Execution** | `CRUD /api/execution/logs/`, `POST .../complete/`, `CRUD /api/execution/parts-used/` | `ADMIN`, `SAFETY_OFFICER`, `FIELD_TECHNICIAN` |
| **Compliance** | `CRUD /api/compliance/records/`, `CRUD /api/compliance/inspections/` | Read: All Auth; Write: `ADMIN`, `SAFETY_OFFICER` |
| **Supply Chain** | `CRUD /api/supply-chain/vendors/`, `CRUD /api/supply-chain/purchase-requests/`, `POST .../approve/`, `POST .../receive/`, `GET /api/supply-chain/logs/`, `POST /api/supply-chain/logs/simulate-erp-sync/` | Read: All Auth; Write: `ADMIN`, `CONTRACTS_MANAGER` |
| **Analytics** | `GET /api/analytics/dashboard/?aircraft=&status=&priority=&start_date=&end_date=` | Authenticated |
| **Notifications** | `CRUD /api/notifications/`, `POST .../mark_read/`, `POST .../mark_all_read/` | Authenticated |
