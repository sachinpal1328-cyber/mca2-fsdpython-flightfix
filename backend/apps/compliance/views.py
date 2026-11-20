from rest_framework import viewsets
from apps.accounts.permissions import IsSafetyOfficerOrAdmin
from .models import ComplianceRecord, Inspection
from .serializers import ComplianceRecordSerializer, InspectionSerializer


class ComplianceRecordViewSet(viewsets.ModelViewSet):
    queryset = ComplianceRecord.objects.select_related("aircraft", "last_audited_by").all()
    serializer_class = ComplianceRecordSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["category", "status", "aircraft"]
    search_fields = ["title", "regulation_code", "notes", "aircraft__registration"]
    ordering_fields = ["expiry_date", "issue_date", "status", "created_at"]

    def perform_create(self, serializer):
        serializer.save(last_audited_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(last_audited_by=self.request.user)


class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.select_related(
        "compliance_record", "aircraft", "inspector"
    ).all()
    serializer_class = InspectionSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["compliance_record", "aircraft", "result"]
    search_fields = ["findings", "corrective_action", "aircraft__registration"]

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)
