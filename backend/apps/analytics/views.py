from datetime import date
from django.db.models import Count, F, Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.aircraft.models import Aircraft, Equipment
from apps.compliance.models import ComplianceRecord
from apps.execution.models import MaintenanceExecution
from apps.integrations.models import PurchaseRequest
from apps.inventory.models import SparePart
from apps.maintenance.models import MaintenancePlan
from apps.workorders.models import WorkOrder


class DashboardAnalyticsView(APIView):
    """Real-time database-backed analytics for Dashboard & Reports."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        aircraft_id = request.query_params.get("aircraft")
        status_filter = request.query_params.get("status")
        priority_filter = request.query_params.get("priority")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        wo_qs = WorkOrder.objects.all()
        mp_qs = MaintenancePlan.objects.all()
        comp_qs = ComplianceRecord.objects.all()

        if aircraft_id:
            wo_qs = wo_qs.filter(aircraft_id=aircraft_id)
            mp_qs = mp_qs.filter(aircraft_id=aircraft_id)
            comp_qs = comp_qs.filter(aircraft_id=aircraft_id)
        if status_filter:
            wo_qs = wo_qs.filter(status=status_filter)
        if priority_filter:
            wo_qs = wo_qs.filter(priority=priority_filter)
        if start_date:
            wo_qs = wo_qs.filter(due_date__gte=start_date)
            mp_qs = mp_qs.filter(due_date__gte=start_date)
        if end_date:
            wo_qs = wo_qs.filter(due_date__lte=end_date)
            mp_qs = mp_qs.filter(due_date__lte=end_date)

        today = date.today()

        total_aircraft = Aircraft.objects.count()
        operational_aircraft = Aircraft.objects.filter(status=Aircraft.Status.OPERATIONAL).count()
        in_maintenance_aircraft = Aircraft.objects.filter(
            status__in=[Aircraft.Status.IN_MAINTENANCE, Aircraft.Status.GROUNDED, Aircraft.Status.AOG]
        ).count()
        total_equipment = Equipment.objects.count()

        active_work_orders = wo_qs.filter(
            status__in=[WorkOrder.Status.OPEN, WorkOrder.Status.IN_PROGRESS, WorkOrder.Status.ON_HOLD]
        ).count()
        completed_work_orders = wo_qs.filter(status=WorkOrder.Status.COMPLETED).count()
        total_work_orders = wo_qs.count()

        pending_maintenance = mp_qs.filter(
            status__in=[MaintenancePlan.Status.SCHEDULED, MaintenancePlan.Status.IN_PROGRESS]
        ).count()
        overdue_maintenance = mp_qs.filter(
            status__in=[MaintenancePlan.Status.SCHEDULED, MaintenancePlan.Status.OVERDUE],
            due_date__lt=today,
        ).count()

        low_stock_parts_qs = SparePart.objects.filter(quantity__lte=F("min_stock_threshold"))
        low_stock_count = low_stock_parts_qs.count()
        total_parts = SparePart.objects.count()
        total_inventory_value_inr = (
            SparePart.objects.aggregate(
                total=Sum(F("quantity") * F("unit_cost_inr"))
            )["total"]
            or 0
        )

        wo_by_status = list(
            wo_qs.values("status").annotate(count=Count("id")).order_by("status")
        )
        wo_by_priority = list(
            wo_qs.values("priority").annotate(count=Count("id")).order_by("priority")
        )
        aircraft_by_status = list(
            Aircraft.objects.values("status").annotate(count=Count("id")).order_by("status")
        )
        compliance_by_status = list(
            comp_qs.values("status").annotate(count=Count("id")).order_by("status")
        )
        technician_workload = list(
            wo_qs.exclude(assigned_technician__isnull=True)
            .values(
                "assigned_technician__id",
                "assigned_technician__first_name",
                "assigned_technician__last_name",
                "assigned_technician__username",
            )
            .annotate(
                total_assigned=Count("id"),
            )
            .order_by("-total_assigned")
        )

        total_hours_logged = (
            MaintenanceExecution.objects.aggregate(total=Sum("hours_logged"))["total"] or 0
        )
        open_purchase_requests = PurchaseRequest.objects.filter(
            status__in=[PurchaseRequest.Status.SUBMITTED, PurchaseRequest.Status.APPROVED, PurchaseRequest.Status.ORDERED]
        ).count()

        upcoming_maintenance = list(
            mp_qs.filter(status__in=[MaintenancePlan.Status.SCHEDULED, MaintenancePlan.Status.IN_PROGRESS])
            .select_related("aircraft")
            .order_by("due_date")[:5]
            .values("id", "title", "aircraft__registration", "maintenance_type", "due_date", "status")
        )

        low_stock_items = list(
            low_stock_parts_qs.order_by("quantity")[:5].values(
                "id", "part_number", "name", "quantity", "min_stock_threshold", "warehouse_location"
            )
        )

        return Response(
            {
                "kpis": {
                    "total_aircraft": total_aircraft,
                    "operational_aircraft": operational_aircraft,
                    "in_maintenance_aircraft": in_maintenance_aircraft,
                    "total_equipment": total_equipment,
                    "total_work_orders": total_work_orders,
                    "active_work_orders": active_work_orders,
                    "completed_work_orders": completed_work_orders,
                    "pending_maintenance": pending_maintenance,
                    "overdue_maintenance": overdue_maintenance,
                    "total_parts": total_parts,
                    "low_stock_parts": low_stock_count,
                    "total_inventory_value_inr": float(total_inventory_value_inr),
                    "total_hours_logged": float(total_hours_logged),
                    "open_purchase_requests": open_purchase_requests,
                },
                "charts": {
                    "work_orders_by_status": wo_by_status,
                    "work_orders_by_priority": wo_by_priority,
                    "aircraft_by_status": aircraft_by_status,
                    "compliance_by_status": compliance_by_status,
                    "technician_workload": technician_workload,
                },
                "highlights": {
                    "upcoming_maintenance": upcoming_maintenance,
                    "low_stock_items": low_stock_items,
                },
            }
        )
