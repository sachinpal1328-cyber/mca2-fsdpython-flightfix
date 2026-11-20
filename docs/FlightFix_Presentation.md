# FlightFix — 10-Slide Project Presentation

---

## Slide 1: Project Title
- **Project Name:** FlightFix — Enhancing Aircraft Maintenance Efficiency
- **Project Code:** P05
- **Domain:** Aerospace & Defense (Aircraft MRO Management System)
- **Academic Context:** ABES Engineering College — MCA 2nd Year | HCLTech Career Shaper (FSD Python)
- **Repository:** `mca2-fsdpython-flightfix` | **Release:** `v1.0.0`

---

## Slide 2: Problem Statement
- Fragmented spreadsheets and paper logs delay aircraft turnaround times and increase Aircraft-on-Ground (AOG) risk.
- Lack of real-time visibility into spare parts stock levels and minimum reorder thresholds.
- Manual tracking of compliance directives and inspection expiry dates creates audit gaps.
- Field technicians lack a mobile-friendly interface to update checklists and log parts consumed on the hangar floor.

---

## Slide 3: Project Objectives
- Centralize Aircraft & Equipment registries with flight-hour and inspection tracking.
- Automate Maintenance Planning, Work Order lifecycle (`WO-YYYY-XXXX`), and Task Checklists.
- Provide atomic Spare Parts Inventory tracking in INR with low-stock alerts.
- Enforce strict Role-Based Access Control (Admin, Safety Officer, Contracts Manager, Field Technician).
- Deliver live database-driven analytics, compliance tracking, and supply chain integration.

---

## Slide 4: Technology Stack
- **Backend:** Python 3.12, Django 4.2 LTS, Django REST Framework, SimpleJWT, drf-spectacular (Swagger/OpenAPI)
- **Frontend:** React 18, Vite, React Router 6, Bootstrap 5, Axios (with automatic JWT refresh)
- **Database:** Supabase PostgreSQL via `dj-database-url` & `psycopg2-binary` (Django ORM)
- **Testing & DevOps:** `pytest-django`, WhiteNoise, Gunicorn, Render (Backend), Netlify (Frontend), GitHub

---

## Slide 5: System Architecture
- **Client Layer:** React 18 + Vite SPA (13 responsive pages, mobile-first Technician View) hosted on Netlify.
- **API Layer:** Django REST Framework with JWT authentication, RBAC permissions, filtering, and Swagger docs on Render.
- **Domain Apps:** `accounts`, `aircraft`, `maintenance`, `workorders`, `inventory`, `execution`, `compliance`, `integrations`, `analytics`, `notifications`.
- **Data Layer:** Persistent Supabase PostgreSQL with normalized relations, atomic transactions, and indexes.

---

## Slide 6: Database Design (Supabase PostgreSQL)
- **Core Entities:** `User`, `Aircraft`, `Equipment`, `MaintenancePlan`, `WorkOrder`, `WorkOrderTask`.
- **Inventory & Execution:** `SparePart`, `StockMovement`, `MaintenanceExecution`, `PartUsage` (atomic stock deduction).
- **Governance & Supply Chain:** `ComplianceRecord`, `Inspection`, `Vendor`, `PurchaseRequest`, `IntegrationLog`, `Notification`.
- **Integrity:** Unique registrations/part numbers, FK cascades/protections, check/min-value validators, composite indexes.

---

## Slide 7: Major Modules Implemented
- **E02 & E03:** Maintenance Planning & Work Order Management with interactive task checklists.
- **E04 & E05:** Aircraft/Equipment Registry & Spare Parts Inventory (INR valuation + low-stock alerts).
- **E06 & E09:** Maintenance Execution Logs + Mobile-Responsive Field Technician Workspace.
- **E07 & E08:** Compliance/Inspections (educational demo) & Supply Chain + Simulated ERP Sync.
- **E10 & E11:** Real-time Analytics Dashboard & Admin User Management with backend RBAC.

---

## Slide 8: Application UI & Live Screens
- **Dashboard:** Live KPI cards, Work Order status bars, Compliance summary, Low Stock & Upcoming Maintenance tables.
- **Operational CRUD Screens:** Maintenance Planning, Work Orders, Aircraft & Equipment, Inventory, Execution, Compliance.
- **Supply Chain & Admin:** Vendors, Purchase Requests (Approve/Receive to Stock), Simulated ERP Logs, User Management.
- *Note: Live screenshots should be captured after running `npm run dev` + `python manage.py runserver`.*

---

## Slide 9: Testing & Deployment Readiness
- **Backend Tests (`pytest-django`):** 7/7 automated tests PASSED (Health, JWT Login, RBAC 403/201, Date Validation, WO Lifecycle, Atomic Inventory, Analytics).
- **Frontend Build (Vite):** `npm run build` PASSED (111 modules transformed in 1.79s, 0 errors).
- **Deployment Configs:** `render.yaml` + `backend/build.sh` for Render; `frontend/netlify.toml` + `_redirects` for Netlify.
- **Database:** Ready for Supabase PostgreSQL via `DATABASE_URL` + `python manage.py migrate` + `seed_flightfix`.

---

## Slide 10: Conclusion & Future Scope
- **Conclusion:** FlightFix `v1.0.0` delivers a complete, secure, database-backed MRO MVP covering all 12 epics and 17 deliverables.
- **Future Scope:**
  1. Offline-first React Native mobile app for hangar technicians.
  2. Predictive maintenance ML models using historical flight-hour and component failure telemetry.
  3. Live SAP/AMOS ERP webhook integration and automated PDF airworthiness release certificates.
