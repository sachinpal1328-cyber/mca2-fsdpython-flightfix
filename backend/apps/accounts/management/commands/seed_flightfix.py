from datetime import date, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.aircraft.models import Aircraft, Equipment
from apps.compliance.models import ComplianceRecord, Inspection
from apps.execution.models import MaintenanceExecution, PartUsage
from apps.integrations.models import IntegrationLog, PurchaseRequest, Vendor
from apps.inventory.models import SparePart, StockMovement
from apps.maintenance.models import MaintenancePlan
from apps.notifications.models import Notification
from apps.workorders.models import WorkOrder, WorkOrderTask


class Command(BaseCommand):
    help = "Seed realistic Indian Aerospace MRO demo data for FlightFix"

    def handle(self, *args, **options):
        today = date.today()

        # 1. Users (4 roles)
        users_spec = [
            ("admin", "admin@flightfix.in", "FlightFix@123", "Rajesh", "Sharma", "ADMIN", "EMP-FF-001", "IT & MRO Administration", "+91-9811001100", True),
            ("safety_officer", "safety@flightfix.in", "FlightFix@123", "Ananya", "Verma", "SAFETY_OFFICER", "EMP-FF-002", "Flight Safety & Quality", "+91-9811002200", False),
            ("contracts_mgr", "contracts@flightfix.in", "FlightFix@123", "Vikram", "Patel", "CONTRACTS_MANAGER", "EMP-FF-003", "Procurement & Supply Chain", "+91-9811003300", False),
            ("tech_arjun", "arjun.tech@flightfix.in", "FlightFix@123", "Arjun", "Nair", "FIELD_TECHNICIAN", "EMP-FF-004", "Line Maintenance — Hangar 2", "+91-9811004400", False),
            ("tech_priya", "priya.tech@flightfix.in", "FlightFix@123", "Priya", "Kulkarni", "FIELD_TECHNICIAN", "EMP-FF-005", "Avionics & Heavy Check", "+91-9811005500", False),
        ]
        user_map = {}
        for uname, email, pwd, fn, ln, role, emp_id, dept, phone, is_su in users_spec:
            u, created = User.objects.get_or_create(
                username=uname,
                defaults={
                    "email": email,
                    "first_name": fn,
                    "last_name": ln,
                    "role": role,
                    "employee_id": emp_id,
                    "department": dept,
                    "phone": phone,
                    "is_staff": is_su,
                    "is_superuser": is_su,
                },
            )
            if created:
                u.set_password(pwd)
                u.save()
            user_map[uname] = u

        # 2. Aircraft
        aircraft_spec = [
            ("VT-FFX", "A320neo", "Airbus", "MSN-8841", "COMMERCIAL", "OPERATIONAL", Decimal("4120.5"), "IGI Airport, New Delhi (VIDP)", today - timedelta(days=35), today + timedelta(days=55)),
            ("VT-IND", "737 MAX 8", "Boeing", "LN-7922", "COMMERCIAL", "IN_MAINTENANCE", Decimal("6340.0"), "CSMIA, Mumbai (VABB)", today - timedelta(days=10), today + timedelta(days=80)),
            ("VT-HAL", "Dornier 228", "HAL", "HAL-D228-104", "DEFENSE", "OPERATIONAL", Decimal("2890.2"), "HAL Airport, Bengaluru (VOBG)", today - timedelta(days=20), today + timedelta(days=70)),
            ("VT-BLR", "ATR 72-600", "ATR", "ATR-1590", "COMMERCIAL", "GROUNDED", Decimal("5105.8"), "KIA, Bengaluru (VOBL)", today - timedelta(days=95), today - timedelta(days=5)),
            ("VT-DEL", "C-130J Super Hercules", "Lockheed Martin", "LM-5812", "DEFENSE", "OPERATIONAL", Decimal("3410.0"), "Hindon AFS, Ghaziabad (VIDX)", today - timedelta(days=15), today + timedelta(days=75)),
            ("VT-BOM", "ALH Dhruv Mk-III", "HAL", "HAL-ALH-319", "HELICOPTER", "IN_MAINTENANCE", Decimal("1650.4"), "Juhu Aerodrome, Mumbai (VAJJ)", today - timedelta(days=45), today + timedelta(days=15)),
        ]
        ac_map = {}
        for reg, model, mfg, sn, atype, st, hrs, loc, last_i, next_d in aircraft_spec:
            ac, _ = Aircraft.objects.get_or_create(
                registration=reg,
                defaults={
                    "model_name": model,
                    "manufacturer": mfg,
                    "serial_number": sn,
                    "aircraft_type": atype,
                    "status": st,
                    "flight_hours": hrs,
                    "base_location": loc,
                    "last_inspection_date": last_i,
                    "next_due_date": next_d,
                },
            )
            ac_map[reg] = ac

        # 3. Equipment
        equip_spec = [
            ("VT-FFX", "CFM LEAP-1A Engine #1", "CFM-LEAP1A-01", "EQ-SN-1001", "PROPULSION", "SERVICEABLE"),
            ("VT-FFX", "Honeywell Primus Epic FMS", "HW-FMS-440", "EQ-SN-1002", "AVIONICS", "SERVICEABLE"),
            ("VT-IND", "Nose Landing Gear Actuator", "BOE-NLG-737", "EQ-SN-1003", "LANDING_GEAR", "NEEDS_INSPECTION"),
            ("VT-IND", "Hydraulic System Pump A", "PARKER-HYD-88", "EQ-SN-1004", "HYDRAULICS", "UNSERVICEABLE"),
            ("VT-HAL", "Garrett TPE331 Turboprop", "GAR-TPE331-10", "EQ-SN-1005", "PROPULSION", "SERVICEABLE"),
            ("VT-BLR", "Auxiliary Power Unit (APU)", "PW-APS5000", "EQ-SN-1006", "ELECTRICAL", "NEEDS_INSPECTION"),
            ("VT-DEL", "AN/APN-241 Weather Radar", "NG-RADAR-241", "EQ-SN-1007", "AVIONICS", "SERVICEABLE"),
            ("VT-BOM", "HAL Shakti Turboshaft #1", "HAL-SHK-01", "EQ-SN-1008", "PROPULSION", "SERVICEABLE"),
        ]
        for reg, name, pn, sn, cat, st in equip_spec:
            Equipment.objects.get_or_create(
                serial_number=sn,
                defaults={
                    "aircraft": ac_map[reg],
                    "name": name,
                    "part_number": pn,
                    "category": cat,
                    "status": st,
                    "installed_date": today - timedelta(days=180),
                },
            )

        # 4. Maintenance Plans
        plans_spec = [
            ("Scheduled 500-Hr A-Check", "VT-FFX", "A_CHECK", 90, 500, today + timedelta(days=10), today + timedelta(days=14), "SCHEDULED", "tech_arjun"),
            ("Landing Gear & Hydraulic B-Check", "VT-IND", "B_CHECK", 180, 1200, today - timedelta(days=2), today + timedelta(days=5), "IN_PROGRESS", "tech_arjun"),
            ("APU Overdue Inspection", "VT-BLR", "LINE", 30, 250, today - timedelta(days=12), today - timedelta(days=5), "OVERDUE", "tech_priya"),
            ("Rotor Blade & Gearbox Check", "VT-BOM", "C_CHECK", 365, 2000, today, today + timedelta(days=7), "IN_PROGRESS", "tech_priya"),
            ("Avionics Radar Calibration", "VT-DEL", "LINE", 60, 400, today + timedelta(days=20), today + timedelta(days=25), "SCHEDULED", "tech_arjun"),
            ("Annual Structural Inspection", "VT-HAL", "C_CHECK", 365, 1800, today - timedelta(days=30), today - timedelta(days=20), "COMPLETED", "tech_priya"),
        ]
        plan_map = {}
        for title, reg, mtype, fdays, fhrs, sdate, ddate, st, tech in plans_spec:
            mp, _ = MaintenancePlan.objects.get_or_create(
                title=title,
                aircraft=ac_map[reg],
                defaults={
                    "maintenance_type": mtype,
                    "frequency_days": fdays,
                    "frequency_hours": fhrs,
                    "scheduled_date": sdate,
                    "due_date": ddate,
                    "status": st,
                    "assigned_to": user_map[tech],
                    "description": f"Standard {mtype} maintenance schedule for {reg}.",
                },
            )
            plan_map[title] = mp

        # 5. Work Orders & Tasks
        wo_spec = [
            ("WO-2026-0001", "Replace Hydraulic Pump A on VT-IND", "VT-IND", "Landing Gear & Hydraulic B-Check", "CRITICAL", "IN_PROGRESS", "tech_arjun", today + timedelta(days=2)),
            ("WO-2026-0002", "APU Fault Diagnostics & Seal Replacement", "VT-BLR", "APU Overdue Inspection", "HIGH", "OPEN", "tech_priya", today + timedelta(days=1)),
            ("WO-2026-0003", "500-Hr A-Check Airframe & Brake Inspection", "VT-FFX", "Scheduled 500-Hr A-Check", "MEDIUM", "OPEN", "tech_arjun", today + timedelta(days=12)),
            ("WO-2026-0004", "Main Rotor Pitch Link Torque Check", "VT-BOM", "Rotor Blade & Gearbox Check", "HIGH", "IN_PROGRESS", "tech_priya", today + timedelta(days=4)),
            ("WO-2026-0005", "Dornier 228 Annual Structural Sign-off", "VT-HAL", "Annual Structural Inspection", "LOW", "COMPLETED", "tech_priya", today - timedelta(days=18)),
        ]
        wo_map = {}
        for wonum, title, reg, plan_title, prio, st, tech, ddate in wo_spec:
            wo, created = WorkOrder.objects.get_or_create(
                wo_number=wonum,
                defaults={
                    "title": title,
                    "aircraft": ac_map[reg],
                    "maintenance_plan": plan_map.get(plan_title),
                    "priority": prio,
                    "status": st,
                    "assigned_technician": user_map[tech],
                    "created_by": user_map["safety_officer"],
                    "due_date": ddate,
                    "completed_at": timezone.now() if st == "COMPLETED" else None,
                    "description": f"Operational work order for {reg}: {title}",
                },
            )
            wo_map[wonum] = wo
            if created:
                WorkOrderTask.objects.create(work_order=wo, title="Safety lock-out / tag-out & ground power check", order=1, is_completed=(st != "OPEN"))
                WorkOrderTask.objects.create(work_order=wo, title="Component removal / inspection & measurement", order=2, is_completed=(st == "COMPLETED"))
                WorkOrderTask.objects.create(work_order=wo, title="Operational leak/function test & QA sign-off", order=3, is_completed=(st == "COMPLETED"))

        # 6. Spare Parts Inventory (INR)
        parts_spec = [
            ("FF-HYD-3000", "Main Hydraulic Pump Seal Kit", "HYDRAULICS", 3, 5, "Mumbai Hangar Store B2", "HAL Accessories Division", Decimal("48500.00")),
            ("FF-BRK-737", "Carbon Brake Assembly (737/A320)", "HYDRAULICS", 12, 4, "Delhi Hangar Store A1", "Bharat Forge Aerospace", Decimal("215000.00")),
            ("FF-AVN-241", "Avionics Cooling Fan Module", "AVIONICS", 2, 4, "Bengaluru Avionics Vault", "Bharat Electronics Ltd (BEL)", Decimal("76000.00")),
            ("FF-ENG-104", "Turbine Igniter Plug Set", "ENGINE", 18, 6, "Delhi Hangar Store A1", "HAL Engine Division", Decimal("32400.00")),
            ("FF-CON-009", "Skydrol LD-4 Hydraulic Fluid (20L)", "CONSUMABLES", 4, 8, "Mumbai Hazmat Store C1", "IndianOil Aviation", Decimal("18900.00")),
            ("FF-ELC-512", "28V DC Aircraft Main Battery", "ELECTRICAL", 9, 3, "Bengaluru Store B1", "HBL Power Systems", Decimal("94000.00")),
            ("FF-AIR-881", "Cabin Door Pressure Seal", "AIRFRAME", 7, 3, "Delhi Hangar Store A1", "Tata Advanced Systems", Decimal("54200.00")),
            ("FF-CON-022", "MIL-PRF-23699 Synthetic Turbine Oil (Case)", "CONSUMABLES", 22, 10, "Hindon Base Store", "IndianOil Aviation", Decimal("14500.00")),
        ]
        part_map = {}
        for pnum, name, cat, qty, min_t, loc, sup, cost in parts_spec:
            sp, created = SparePart.objects.get_or_create(
                part_number=pnum,
                defaults={
                    "name": name,
                    "description": f"Certified aviation spare part: {name}",
                    "category": cat,
                    "quantity": qty,
                    "min_stock_threshold": min_t,
                    "warehouse_location": loc,
                    "supplier_name": sup,
                    "unit_cost_inr": cost,
                    "last_restocked_at": timezone.now() - timedelta(days=14),
                },
            )
            part_map[pnum] = sp
            if created:
                StockMovement.objects.create(
                    part=sp,
                    movement_type="IN",
                    quantity=qty,
                    reference_note="Initial opening stock balance",
                    performed_by=user_map["contracts_mgr"],
                )

        # 7. Maintenance Execution
        if not MaintenanceExecution.objects.exists():
            ex1 = MaintenanceExecution.objects.create(
                work_order=wo_map["WO-2026-0001"],
                technician=user_map["tech_arjun"],
                status="STARTED",
                hours_logged=Decimal("4.50"),
                checklist_completed=False,
                notes="Removed faulty hydraulic pump; installing replacement seal kit and pressure testing.",
            )
            PartUsage.objects.create(
                execution=ex1,
                part=part_map["FF-HYD-3000"],
                quantity_used=1,
                logged_by=user_map["tech_arjun"],
            )
            MaintenanceExecution.objects.create(
                work_order=wo_map["WO-2026-0005"],
                technician=user_map["tech_priya"],
                status="COMPLETED",
                completed_at=timezone.now() - timedelta(days=18),
                hours_logged=Decimal("12.00"),
                checklist_completed=True,
                notes="Annual structural inspection completed with zero airframe cracks observed.",
            )

        # 8. Compliance & Inspections
        comp_spec = [
            ("DGCA CAR-M Continuing Airworthiness Review", "DGCA-CAR-M-2026", "DGCA_CAR", "VT-FFX", "COMPLIANT", today - timedelta(days=60), today + timedelta(days=305)),
            ("Hydraulic Actuator Mandatory Service Bulletin", "EASA-SB-32-1104", "EASA_SB", "VT-IND", "PENDING", today - timedelta(days=15), today + timedelta(days=20)),
            ("APU Fire Detection Loop Airworthiness Directive", "FAA-AD-2025-18", "FAA_AD", "VT-BLR", "EXPIRING_SOON", today - timedelta(days=340), today + timedelta(days=10)),
            ("Defense Tactical Fleet Safety Audit", "MOD-AS-9001", "INTERNAL_SAFETY", "VT-DEL", "COMPLIANT", today - timedelta(days=30), today + timedelta(days=335)),
            ("Hazmat & Skydrol Storage Compliance", "ENV-HAZ-2026", "ENVIRONMENTAL", None, "COMPLIANT", today - timedelta(days=45), today + timedelta(days=320)),
        ]
        for title, code, cat, reg, st, idate, edate in comp_spec:
            cr, created = ComplianceRecord.objects.get_or_create(
                regulation_code=code,
                defaults={
                    "title": title,
                    "category": cat,
                    "aircraft": ac_map[reg] if reg else None,
                    "status": st,
                    "issue_date": idate,
                    "expiry_date": edate,
                    "last_audited_by": user_map["safety_officer"],
                    "notes": "Educational demonstration compliance record.",
                },
            )
            if created and reg:
                Inspection.objects.create(
                    compliance_record=cr,
                    aircraft=ac_map[reg],
                    inspector=user_map["safety_officer"],
                    inspection_date=today - timedelta(days=5),
                    result="PASS" if st == "COMPLIANT" else "CONDITIONAL",
                    findings="Routine safety officer audit completed.",
                    corrective_action="Monitor until next scheduled check." if st != "COMPLIANT" else "",
                )

        # 9. Vendors, Purchase Requests & Simulated ERP Logs
        vendor_spec = [
            ("VND-HAL-01", "Hindustan Aeronautics Ltd (HAL)", "Suresh Menon", "procurement@hal-india.example", "+91-80-22320001", "Bengaluru", "ACTIVE", 5),
            ("VND-BEL-02", "Bharat Electronics Ltd (BEL)", "Kavita Rao", "aerospace@bel-india.example", "+91-80-25039300", "Bengaluru", "ACTIVE", 5),
            ("VND-TASL-03", "Tata Advanced Systems Ltd", "Rohan Deshmukh", "supply@tasl.example", "+91-40-66238800", "Hyderabad", "ACTIVE", 4),
            ("VND-IOC-04", "IndianOil Aviation Services", "Amitabh Verma", "aviation@indianoil.example", "+91-22-26447600", "Mumbai", "ACTIVE", 4),
        ]
        v_map = {}
        for vcode, name, cp, email, phone, city, st, rating in vendor_spec:
            v, _ = Vendor.objects.get_or_create(
                vendor_code=vcode,
                defaults={
                    "name": name,
                    "contact_person": cp,
                    "email": email,
                    "phone": phone,
                    "city": city,
                    "country": "India",
                    "status": st,
                    "rating": rating,
                },
            )
            v_map[vcode] = v

        pr_spec = [
            ("PR-2026-0001", "VND-HAL-01", "FF-HYD-3000", "Restock Main Hydraulic Pump Seal Kits", 10, Decimal("485000.00"), "ORDERED", today + timedelta(days=6)),
            ("PR-2026-0002", "VND-BEL-02", "FF-AVN-241", "Avionics Cooling Fan Modules (Urgent)", 6, Decimal("456000.00"), "APPROVED", today + timedelta(days=4)),
            ("PR-2026-0003", "VND-IOC-04", "FF-CON-009", "Skydrol LD-4 Hydraulic Fluid Drums", 12, Decimal("226800.00"), "SUBMITTED", today + timedelta(days=9)),
        ]
        for prnum, vcode, pnum, desc, qty, cost, st, edate in pr_spec:
            PurchaseRequest.objects.get_or_create(
                pr_number=prnum,
                defaults={
                    "vendor": v_map[vcode],
                    "part": part_map[pnum],
                    "item_description": desc,
                    "quantity": qty,
                    "estimated_cost_inr": cost,
                    "status": st,
                    "requested_by": user_map["contracts_mgr"],
                    "approved_by": user_map["admin"] if st in ("APPROVED", "ORDERED") else None,
                    "expected_delivery_date": edate,
                },
            )

        if not IntegrationLog.objects.exists():
            IntegrationLog.objects.create(
                system_name="SAP S/4HANA ERP (Simulated)",
                direction="OUTBOUND",
                action="Purchase Order Sync: PR-2026-0001",
                status="SIMULATED",
                is_simulated=True,
                payload_summary="Vendor=VND-HAL-01, Amount=INR 485,000.00",
                response_message="Simulated ERP PO confirmation #SAP-PO-99401.",
            )
            IntegrationLog.objects.create(
                system_name="AMOS MRO Gateway (Simulated)",
                direction="INBOUND",
                action="Fleet Flight Hours Telemetry Sync",
                status="SIMULATED",
                is_simulated=True,
                payload_summary="Synced 6 active aircraft registrations (VT-FFX .. VT-BOM)",
                response_message="Simulated telemetry batch processed.",
            )

        # 10. Notifications
        if not Notification.objects.exists():
            Notification.objects.create(
                title="Critical Work Order Active: VT-IND",
                message="WO-2026-0001 (Hydraulic Pump A replacement) is in progress at Mumbai Hangar.",
                category="WORKORDER",
                severity="CRITICAL",
            )
            Notification.objects.create(
                title="Low Stock Alert: 3 Spare Parts Below Threshold",
                message="FF-HYD-3000, FF-AVN-241, and FF-CON-009 require immediate procurement.",
                category="INVENTORY",
                severity="WARNING",
            )
            Notification.objects.create(
                title="Compliance Expiring Soon: VT-BLR",
                message="FAA-AD-2025-18 (APU Fire Detection Loop) expires in 10 days.",
                category="COMPLIANCE",
                severity="WARNING",
            )
            Notification.objects.create(
                title="Overdue Maintenance Plan: VT-BLR",
                message="APU Overdue Inspection was due 5 days ago. Assign technician immediately.",
                category="MAINTENANCE",
                severity="CRITICAL",
            )

        self.stdout.write(self.style.SUCCESS("FlightFix demo data seeded successfully!"))
