# FlightFix — Enhancing Aircraft Maintenance Efficiency

**Project Code:** P05  
**Domain:** Aerospace & Defense (Aircraft MRO Management System)  
**Academic Context:** ABES Engineering College — MCA 2nd Year | HCLTech Career Shaper (Skill Track: FSD Python)  
**Repository Name:** `mca2-fsdpython-flightfix`  
**Version:** `v1.0.0`

---

## 1. Project Description & Objectives

**FlightFix** is a full-stack web-based Aircraft Maintenance, Repair, and Overhaul (MRO) Management System designed for Aerospace & Defense organizations. It replaces fragmented spreadsheets and paper maintenance logs with a centralized, role-based platform connecting **Safety Officers**, **Contracts Managers**, **Field Technicians**, and **Administrators**.

### Core Objectives
- Centralize aircraft and onboard equipment registries with flight-hour tracking.
- Plan, schedule, and monitor preventive and corrective maintenance plans.
- Manage end-to-end work orders with priority, task checklists, and completion workflows.
- Track spare parts inventory in real time with INR valuation, low-stock alerts, and atomic stock movements.
- Provide a mobile-responsive workspace for field technicians to execute checklists, log hours, and record parts usage.
- Track compliance records and inspections with expiry alerts.
- Support supply chain procurement (vendors, purchase requests, goods receipt, and simulated ERP sync logs).
- Deliver real-time, database-backed analytics and operational reports.

---

## 2. Features

- **JWT Authentication & RBAC:** Secure login, token refresh, logout with token blacklisting, and backend-enforced permissions for 4 roles (`ADMIN`, `SAFETY_OFFICER`, `CONTRACTS_MANAGER`, `FIELD_TECHNICIAN`).
- **Maintenance Planning (E02):** Create, edit, search, filter, and archive A/B/C/D-check and line maintenance schedules.
- **Work Order Management (E03):** Auto-numbered work orders (`WO-YYYY-XXXX`), task checklists, priority & status workflows.
- **Aircraft & Equipment (E04):** Fleet registry (`VT-FFX`, `VT-IND`, etc.) and linked equipment tracking.
- **Spare Parts Inventory (E05):** INR-valued parts catalogue, minimum stock threshold alerts, and atomic `IN`/`OUT`/`ADJUSTMENT` stock movements.
- **Maintenance Execution (E06):** Execution logs, hours logged, maintenance notes, and automatic inventory deduction on part usage.
- **Compliance Management (E07):** Regulatory/safety compliance records and inspection logs *(educational demonstration only)*.
- **ERP & Supply Chain Integration (E08):** Vendor directory, purchase requests, goods-receipt-to-inventory workflow, and clearly labeled simulated ERP sync logs.
- **Technician Mobile View (E09):** Mobile-first responsive interface for field technicians.
- **Analytics & Reporting (E10):** Live PostgreSQL/ORM-aggregated KPIs, breakdowns, and filterable reports.
- **User Management (E11):** Admin-only user creation, role assignment, and activation/deactivation.

---

## 3. Technology Stack

- **Backend:** Python 3.12, Django 4.2 LTS, Django REST Framework, SimpleJWT, django-filter, drf-spectacular (OpenAPI/Swagger), WhiteNoise, Gunicorn
- **Frontend:** React 18, Vite, React Router 6, Bootstrap 5, Bootstrap Icons, Axios
- **Database:** Supabase PostgreSQL (via `dj-database-url` and `psycopg2-binary`; local SQLite fallback when `DATABASE_URL` is unset)
- **Testing:** `pytest` + `pytest-django`
- **Deployment:** Render (Backend), Netlify (Frontend), Supabase (PostgreSQL), GitHub (Source Control)

---

## 4. Architecture & Project Folder Structure

```text
FlightFix/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh
│   ├── pytest.ini
│   ├── .env.example
│   ├── config/              # Django settings, URLs, WSGI, /api/health/
│   ├── apps/
│   │   ├── accounts/        # Custom User, JWT Auth, RBAC, seed_flightfix command
│   │   ├── aircraft/        # Aircraft & Equipment models/APIs
│   │   ├── maintenance/     # MaintenancePlan models/APIs
│   │   ├── workorders/      # WorkOrder & WorkOrderTask models/APIs
│   │   ├── inventory/       # SparePart & StockMovement models/APIs
│   │   ├── execution/       # MaintenanceExecution & PartUsage models/APIs
│   │   ├── compliance/      # ComplianceRecord & Inspection models/APIs
│   │   ├── integrations/    # Vendor, PurchaseRequest, IntegrationLog (Simulated)
│   │   ├── analytics/       # Real-time aggregated dashboard & report APIs
│   │   └── notifications/   # Alert & notification APIs
│   └── tests/               # pytest-django API & RBAC test suite
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios client with JWT refresh interceptor
│   │   ├── context/         # AuthContext
│   │   ├── components/      # Layout, StatusBadge
│   │   └── pages/           # 13 responsive pages
│   ├── public/_redirects    # Netlify SPA routing
│   ├── netlify.toml
│   ├── package.json
│   └── .env.example
├── database/
│   └── schema_documentation.md
├── docs/                    # Requirements, User Stories, API, DB, Test, Deploy docs
├── render.yaml
├── .env.example
├── .gitignore
└── LICENSE
```

---

## 5. Installation & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Supabase PostgreSQL project (recommended) or local fallback

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit backend/.env and set DATABASE_URL to your Supabase PostgreSQL connection string
python manage.py migrate
python manage.py seed_flightfix
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Environment Variables

### Backend (`backend/.env`)
- `SECRET_KEY` — Django secret key
- `DEBUG` — `True` for local dev, `False` in production
- `ALLOWED_HOSTS` — Comma-separated hosts (e.g. `localhost,127.0.0.1,.onrender.com`)
- `DATABASE_URL` — Supabase PostgreSQL URI (`postgresql://postgres.<ref>:<pass>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`)
- `CORS_ALLOWED_ORIGINS` — Comma-separated frontend origins (e.g. `http://localhost:5173,https://your-site.netlify.app`)

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL` — Backend API base URL (e.g. `http://localhost:8000/api` locally, or `https://your-backend.onrender.com/api` in production)

---

## 7. Demo Login Credentials & Roles

After running `python manage.py seed_flightfix`, you can log in with any of these accounts (password for all: `FlightFix@123`):

| Role | Username | Permissions Summary |
|---|---|---|
| **Admin** | `admin` | Full system access, User Management, all modules |
| **Safety Officer** | `safety_officer` | Aircraft, Equipment, Maintenance Plans, Work Orders, Compliance, Analytics |
| **Contracts Manager** | `contracts_mgr` | Inventory, Vendors, Purchase Requests, Simulated ERP Sync, Analytics |
| **Field Technician** | `tech_arjun` / `tech_priya` | Assigned Work Orders, Checklists, Execution Logs, Parts Usage, Mobile View |

---

## 8. API Documentation & Testing

- **Interactive Swagger UI:** `http://localhost:8000/api/docs/`
- **OpenAPI Schema:** `http://localhost:8000/api/schema/`
- **Health Check:** `http://localhost:8000/api/health/`
- **Markdown Reference:** [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Running Tests
```bash
cd backend
pytest -v
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 9. Deployment Information

- **Database:** Supabase PostgreSQL
- **Backend (Render):** `<RENDER_BACKEND_URL_PLACEHOLDER>` (configured via `render.yaml` & `backend/build.sh`)
- **Frontend (Netlify):** `<NETLIFY_FRONTEND_URL_PLACEHOLDER>` (configured via `frontend/netlify.toml` & `frontend/public/_redirects`)
- See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for step-by-step deployment instructions.

---

## 10. Known Limitations & Future Enhancements

- **Simulated ERP:** External SAP S/4HANA / AMOS ERP integrations are simulated via `IntegrationLog` because live enterprise ERP credentials are not provisioned.
- **Educational Compliance:** Compliance records are for academic demonstration only and do not constitute official DGCA/FAA/EASA airworthiness certification.
- **Future Enhancements:** Native React Native mobile app with offline sync, predictive maintenance ML models using flight-hour telemetry, and automated PDF work-order sign-off reports.

---

## 11. Credits

Developed for **ABES Engineering College — MCA 2nd Year**, **HCLTech Career Shaper (FSD Python, Project P05)**.
