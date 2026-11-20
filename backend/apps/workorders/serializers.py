from rest_framework import serializers
from .models import WorkOrder, WorkOrderTask


class WorkOrderTaskSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = WorkOrderTask
        fields = [
            "id",
            "work_order",
            "title",
            "description",
            "is_completed",
            "order",
            "completed_by",
            "completed_by_name",
            "completed_at",
        ]
        read_only_fields = ["id", "completed_by", "completed_by_name", "completed_at"]

    def get_completed_by_name(self, obj):
        if obj.completed_by:
            return obj.completed_by.get_full_name() or obj.completed_by.username
        return None


class WorkOrderSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.CharField(source="aircraft.registration", read_only=True)
    assigned_technician_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    tasks = WorkOrderTaskSerializer(many=True, read_only=True)
    task_count = serializers.IntegerField(source="tasks.count", read_only=True)

    class Meta:
        model = WorkOrder
        fields = [
            "id",
            "wo_number",
            "title",
            "aircraft",
            "aircraft_registration",
            "maintenance_plan",
            "priority",
            "status",
            "assigned_technician",
            "assigned_technician_name",
            "created_by",
            "created_by_name",
            "due_date",
            "completed_at",
            "description",
            "tasks",
            "task_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "wo_number",
            "created_by",
            "created_by_name",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def get_assigned_technician_name(self, obj):
        if obj.assigned_technician:
            return obj.assigned_technician.get_full_name() or obj.assigned_technician.username
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
