from rest_framework import serializers
from .models import ComplianceRecord, Inspection


class InspectionSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.CharField(source="aircraft.registration", read_only=True)
    compliance_title = serializers.CharField(source="compliance_record.title", read_only=True)
    inspector_name = serializers.SerializerMethodField()

    class Meta:
        model = Inspection
        fields = [
            "id",
            "compliance_record",
            "compliance_title",
            "aircraft",
            "aircraft_registration",
            "inspector",
            "inspector_name",
            "inspection_date",
            "result",
            "findings",
            "corrective_action",
            "created_at",
        ]
        read_only_fields = ["id", "inspector", "inspector_name", "created_at"]

    def get_inspector_name(self, obj):
        if obj.inspector:
            return obj.inspector.get_full_name() or obj.inspector.username
        return None


class ComplianceRecordSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.CharField(
        source="aircraft.registration", read_only=True, default="Fleet-Wide"
    )
    last_audited_by_name = serializers.SerializerMethodField()
    inspection_count = serializers.IntegerField(source="inspections.count", read_only=True)

    class Meta:
        model = ComplianceRecord
        fields = [
            "id",
            "title",
            "regulation_code",
            "category",
            "aircraft",
            "aircraft_registration",
            "status",
            "issue_date",
            "expiry_date",
            "last_audited_by",
            "last_audited_by_name",
            "notes",
            "inspection_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "last_audited_by", "last_audited_by_name", "created_at", "updated_at"]

    def get_last_audited_by_name(self, obj):
        if obj.last_audited_by:
            return obj.last_audited_by.get_full_name() or obj.last_audited_by.username
        return None
