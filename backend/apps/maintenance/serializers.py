from rest_framework import serializers
from .models import MaintenancePlan


class MaintenancePlanSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.CharField(source="aircraft.registration", read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = MaintenancePlan
        fields = [
            "id",
            "title",
            "aircraft",
            "aircraft_registration",
            "maintenance_type",
            "frequency_days",
            "frequency_hours",
            "scheduled_date",
            "due_date",
            "status",
            "assigned_to",
            "assigned_to_name",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "aircraft_registration", "assigned_to_name"]

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None

    def validate(self, attrs):
        scheduled = attrs.get("scheduled_date", getattr(self.instance, "scheduled_date", None))
        due = attrs.get("due_date", getattr(self.instance, "due_date", None))
        if scheduled and due and due < scheduled:
            raise serializers.ValidationError({"due_date": "Due date cannot be earlier than scheduled date."})
        return attrs
