# FlightFix — User Stories & Acceptance Criteria Tracker (37 Stories / 97 Story Points)

**Status Legend:** `Not Started` | `In Progress` | `Implemented` | `Tested` | `Verified`

| Story ID | Epic | User Story | SP | Status |
|---|---|---|---|---|
| **US-01** | E01 | As a developer, I want a structured Git repo with `main`/`develop` branches and README so the team can collaborate cleanly. | 2 | `Verified` |
| **US-02** | E01 | As a developer, I want environment variables and PostgreSQL DB config so secrets are never hardcoded. | 3 | `Verified` |
| **US-03** | E01 | As a user, I want JWT login, refresh, and logout so my session is secure. | 3 | `Verified` |
| **US-04** | E01 | As a user, I want a responsive aviation-themed navigation shell so I can access modules on desktop and mobile. | 3 | `Verified` |
| **US-05** | E02 | As a Safety Officer, I want to create maintenance plans linked to aircraft so checks are scheduled proactively. | 3 | `Verified` |
| **US-06** | E02 | As a Safety Officer, I want to view, search, and filter maintenance plans by status and aircraft. | 2 | `Verified` |
| **US-07** | E02 | As a Safety Officer, I want to edit and archive maintenance plans with date validation (`due_date >= scheduled_date`). | 3 | `Verified` |
| **US-08** | E03 | As a Safety Officer, I want to create work orders with auto-generated `WO-YYYY-XXXX` numbers and priorities. | 3 | `Verified` |
| **US-09** | E03 | As a Safety Officer, I want to assign technicians and due dates to work orders. | 2 | `Verified` |
| **US-10** | E03 | As a Technician/Officer, I want to start, track tasks, and complete work orders. | 3 | `Verified` |
| **US-11** | E03 | As a user, I want to search and filter work orders by status, priority, and aircraft. | 2 | `Verified` |
| **US-12** | E04 | As a Safety Officer, I want to register and update aircraft with registration, model, serial number, and flight hours. | 3 | `Verified` |
| **US-13** | E04 | As a Safety Officer, I want to manage onboard equipment linked to each aircraft. | 3 | `Verified` |
| **US-14** | E04 | As a user, I want to search and filter aircraft and equipment by status and registration. | 2 | `Verified` |
| **US-15** | E05 | As a Contracts Manager, I want to manage a spare parts catalogue with INR unit costs and min stock thresholds. | 3 | `Verified` |
| **US-16** | E05 | As a Contracts Manager/Tech, I want to record atomic stock movements (`IN`, `OUT`, `ADJUSTMENT`) with negative-stock protection. | 3 | `Verified` |
| **US-17** | E05 | As a user, I want low-stock alerts and filters so critical parts are restocked before AOG events. | 2 | `Verified` |
| **US-18** | E06 | As a Field Technician, I want to start maintenance execution logs and record hours and notes. | 3 | `Verified` |
| **US-19** | E06 | As a Field Technician, I want to log spare parts consumed during execution and auto-deduct inventory. | 3 | `Verified` |
| **US-20** | E06 | As a Field Technician, I want to mark execution checklists complete and record completion timestamps. | 2 | `Verified` |
| **US-21** | E07 | As a Safety Officer, I want to create and track compliance records with regulation codes and expiry dates. | 3 | `Implemented` |
| **US-22** | E07 | As a Safety Officer, I want to log inspections (`PASS`/`FAIL`/`CONDITIONAL`) with findings and corrective actions. | 3 | `Implemented` |
| **US-23** | E07 | As a Safety Officer, I want compliance status visibility across the fleet. | 2 | `Implemented` |
| **US-24** | E08 | As a Contracts Manager, I want to manage aerospace vendors with ratings and contact details. | 2 | `Implemented` |
| **US-25** | E08 | As a Contracts Manager, I want to create, approve, and receive purchase requests directly into inventory. | 3 | `Implemented` |
| **US-26** | E08 | As a Contracts Manager, I want simulated ERP sync workflows and integration logs clearly labeled as simulated. | 3 | `Verified` |
| **US-27** | E09 | As a Field Technician, I want a mobile-responsive view showing my assigned work orders. | 3 | `Implemented` |
| **US-28** | E09 | As a Field Technician, I want to toggle checklist tasks, log notes, and record part usage from mobile. | 3 | `Implemented` |
| **US-29** | E09 | As a Field Technician, I want one-tap Start and Complete actions on my mobile cards. | 2 | `Implemented` |
| **US-30** | E10 | As a Manager/Officer, I want a live dashboard showing real DB KPIs (fleet, WOs, maintenance, low stock). | 3 | `Verified` |
| **US-31** | E10 | As a Manager/Officer, I want analytics breakdowns by WO status, priority, compliance, and technician workload. | 3 | `Verified` |
| **US-32** | E10 | As a Manager/Officer, I want to filter analytics reports by aircraft, status, and priority. | 2 | `Implemented` |
| **US-33** | E11 | As an Admin, I want to create, view, and manage users with role, employee ID, and department. | 3 | `Verified` |
| **US-34** | E11 | As an Admin, I want to activate/deactivate user accounts. | 2 | `Implemented` |
| **US-35** | E11 | As a Security Owner, I want RBAC enforced on every backend API endpoint, not only in the UI. | 3 | `Verified` |
| **US-36** | E12 | As a QA Engineer, I want automated backend pytest tests and a verified frontend production build. | 3 | `Verified` |
| **US-37** | E12 | As a Project Team, I want complete API, DB, Deployment, Test, Defect, and Presentation docs for v1.0.0 release. | 3 | `Verified` |

**Total:** 37 User Stories | **97 Story Points**
