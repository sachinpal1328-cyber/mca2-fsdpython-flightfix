from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsExecutionActor, IsSafetyOfficerOrAdmin
from .models import WorkOrder, WorkOrderTask
from .serializers import WorkOrderSerializer, WorkOrderTaskSerializer


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.select_related(
        "aircraft", "maintenance_plan", "assigned_technician", "created_by"
    ).prefetch_related("tasks").all()
    serializer_class = WorkOrderSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["aircraft", "priority", "status", "assigned_technician"]
    search_fields = ["wo_number", "title", "description", "aircraft__registration"]
    ordering_fields = ["due_date", "priority", "status", "created_at"]

    def get_permissions(self):
        # Technicians can update status/complete their assigned work orders
        if self.action in ("complete", "start", "my_work_orders"):
            return [IsExecutionActor()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def my_work_orders(self, request):
        qs = self.get_queryset()
        if request.user.role == "FIELD_TECHNICIAN":
            qs = qs.filter(assigned_technician=request.user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def start(self, request, pk=None):
        wo = self.get_object()
        wo.status = WorkOrder.Status.IN_PROGRESS
        wo.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(wo).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        wo = self.get_object()
        wo.status = WorkOrder.Status.COMPLETED
        wo.completed_at = timezone.now()
        wo.save(update_fields=["status", "completed_at", "updated_at"])
        return Response(self.get_serializer(wo).data)


class WorkOrderTaskViewSet(viewsets.ModelViewSet):
    queryset = WorkOrderTask.objects.select_related("work_order", "completed_by").all()
    serializer_class = WorkOrderTaskSerializer
    permission_classes = [IsExecutionActor]
    filterset_fields = ["work_order", "is_completed"]

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        task = self.get_object()
        task.is_completed = not task.is_completed
        if task.is_completed:
            task.completed_by = request.user
            task.completed_at = timezone.now()
        else:
            task.completed_by = None
            task.completed_at = None
        task.save(update_fields=["is_completed", "completed_by", "completed_at"])
        return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)
