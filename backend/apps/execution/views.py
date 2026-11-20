from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsExecutionActor
from apps.workorders.models import WorkOrder
from .models import MaintenanceExecution, PartUsage
from .serializers import MaintenanceExecutionSerializer, PartUsageSerializer


class MaintenanceExecutionViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceExecution.objects.select_related(
        "work_order", "work_order__aircraft", "technician"
    ).prefetch_related("parts_used__part").all()
    serializer_class = MaintenanceExecutionSerializer
    permission_classes = [IsExecutionActor]
    filterset_fields = ["work_order", "technician", "status", "checklist_completed"]
    search_fields = ["work_order__wo_number", "work_order__title", "notes"]

    def perform_create(self, serializer):
        technician = serializer.validated_data.get("technician") or self.request.user
        execution = serializer.save(technician=technician)
        if execution.work_order.status == WorkOrder.Status.OPEN:
            execution.work_order.status = WorkOrder.Status.IN_PROGRESS
            execution.work_order.save(update_fields=["status", "updated_at"])

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        execution = self.get_object()
        execution.status = MaintenanceExecution.Status.COMPLETED
        execution.completed_at = timezone.now()
        execution.checklist_completed = True
        execution.save(update_fields=["status", "completed_at", "checklist_completed", "updated_at"])
        return Response(self.get_serializer(execution).data)


class PartUsageViewSet(viewsets.ModelViewSet):
    queryset = PartUsage.objects.select_related("execution", "part", "logged_by").all()
    serializer_class = PartUsageSerializer
    permission_classes = [IsExecutionActor]
    filterset_fields = ["execution", "part"]

    def perform_create(self, serializer):
        serializer.save(logged_by=self.request.user)
