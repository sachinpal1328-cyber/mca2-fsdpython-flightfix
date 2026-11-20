# FlightFix — Project Requirements Specification

**Project Code:** P05  
**Project Name:** FlightFix — Enhancing Aircraft Maintenance Efficiency  
**Domain:** Aerospace & Defense (Aircraft Maintenance, Repair, and Overhaul — MRO)  
**Academic Context:** ABES Engineering College — MCA 2nd Year | HCLTech Career Shaper (Skill Track: FSD Python)  
**Repository:** `mca2-fsdpython-flightfix`  
**Primary Users:** Safety Officer, Contracts Manager, Admin, Field Technician  

---

## 1. Business & Operational Objectives

Aerospace & Defense MRO organizations manage mission-critical fleets where unscheduled downtime, missing spare parts, expired compliance inspections, and fragmented paper logs directly impact flight safety and contract SLAs.

**FlightFix** provides a unified, role-based web platform to:
1. Centralize aircraft and equipment registries with flight-hour tracking.
2. Plan and schedule preventive and corrective maintenance.
3. Manage end-to-end work orders with priority, assignment, and completion workflows.
4. Track spare parts inventory in real time with INR valuation, minimum stock alerts, and stock movement history.
5. Enable field technicians to execute checklists, log work hours, record parts consumption, and capture notes from mobile-responsive screens.
6. Track regulatory/safety compliance records and inspections with expiry alerts and audit trails.
7. Support ERP and supply chain workflows (vendors, purchase requests, procurement tracking, and simulated ERP sync logs).
8. Deliver live database-driven analytics and operational reports.
9. Enforce strict role-based access control (RBAC) across 4 operational roles.

---

## 2. Functional Requirements (Mapped to 12 Epics)

| Epic ID | Epic Name | Core Functional Scope |
|---|---|---|
| **E01** | Project Setup, Git Workflow & Design | Repository structure, branching (`main`, `develop`, `feature/*`), environment config, PostgreSQL setup, JWT auth skeleton, responsive enterprise UI shell, wireframes. |
| **E02** | Maintenance Planning & Scheduling | CRUD for maintenance plans, aircraft association, maintenance types (A/B/C/D-Check, Line, Unscheduled), frequency, scheduled/due dates, calendar/schedule view, search & filters. |
| **E03** | Work Order Management | Auto-numbered work orders (`WO-YYYY-XXXX`), aircraft & task association, priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), status workflow (`OPEN` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`), technician assignment, due dates. |
| **E04** | Aircraft & Equipment Management | Aircraft registry (registration, model, manufacturer, serial number, status, flight hours), equipment registry linked to aircraft, search/filters, CRUD. |
| **E05** | Spare Parts Inventory Management | Parts catalogue (part number, description, quantity, min threshold, warehouse/location, supplier, unit cost in INR), stock movements (`IN`, `OUT`, `ADJUSTMENT`), low-stock warnings. |
| **E06** | Maintenance Execution & Documentation | Technician task execution, interactive checklists, start/completion timestamps, work logs, parts consumed (linked to inventory deduction), maintenance notes & history. |
| **E07** | Compliance Management | Compliance records, regulatory framework/requirement tracking, inspection records, status (`COMPLIANT`, `PENDING`, `EXPIRED`, `NON_COMPLIANT`), expiry alerts, audit logs. *(Educational demonstration only; does not claim official DGCA/FAA certification.)* |
| **E08** | ERP & Supply Chain Integration | Vendor directory, purchase requests, procurement/PO tracking, inventory linkage, simulated ERP sync endpoint & integration logs (clearly labeled as simulated). |
| **E09** | Mobile App Module for Field Technicians | Mobile-responsive technician workspace: assigned work orders, task checklists, quick status updates, parts usage logging, maintenance notes, completion actions. |
| **E10** | Analytics & Reporting | Live DB-aggregated KPIs (total aircraft, active/completed WOs, pending/overdue maintenance, low stock, compliance status), charts, and filterable reports (date range, aircraft, status, priority). |
| **E11** | User Management & Access Control | Admin user CRUD, deactivation, role assignment (`ADMIN`, `SAFETY_OFFICER`, `CONTRACTS_MANAGER`, `FIELD_TECHNICIAN`), department, employee ID, backend RBAC enforcement. |
| **E12** | Testing, Documentation & Release | Backend pytest/Django tests, frontend production build verification, API docs (Swagger/OpenAPI + Markdown), test report, defect log, deployment guides, 10-slide presentation, `v1.0.0` release. |

---

## 3. Non-Functional Requirements

- **Security:** JWT authentication (Access + Refresh tokens via `SimpleJWT`), PBKDF2/Argon2 password hashing, backend role-based permission classes, CORS allowlist, environment-driven secrets, no credentials in Git.
- **Database:** Normalized relational schema on **Supabase PostgreSQL** via Django ORM with foreign keys, unique constraints, check constraints, indexes, and timestamps.
- **Usability & Responsiveness:** Aviation-grade dark navy & slate enterprise UI built with React 18 + Bootstrap 5, responsive across desktop, tablet, and mobile viewports (375px+).
- **Reliability & Maintainability:** Modular Django apps (`accounts`, `aircraft`, `maintenance`, `workorders`, `inventory`, `execution`, `compliance`, `integrations`, `analytics`, `notifications`), structured error handling, paginated/filterable REST APIs.
- **Deployment Readiness:** Backend configured for Render (Gunicorn + WhiteNoise + `dj-database-url`), Frontend configured for Netlify (`VITE_API_BASE_URL` + SPA `_redirects`), Database hosted on Supabase PostgreSQL.
