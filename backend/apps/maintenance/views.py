from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsSafetyOfficerOrAdmin
from .models import MaintenancePlan
from .serializers import MaintenancePlanSerializer


class MaintenancePlanViewSet(viewsets.ModelViewSet):
    queryset = MaintenancePlan.objects.select_related("aircraft", "assigned_to").all()
    serializer_class = MaintenancePlanSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["aircraft", "maintenance_type", "status", "assigned_to"]
    search_fields = ["title", "description", "aircraft__registration"]
    ordering_fields = ["scheduled_date", "due_date", "status", "created_at"]

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        plan = self.get_object()
        plan.status = MaintenancePlan.Status.ARCHIVED
        plan.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(plan).data)
