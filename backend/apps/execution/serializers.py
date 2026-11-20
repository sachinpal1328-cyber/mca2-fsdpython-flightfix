from django.db import transaction
from rest_framework import serializers
from apps.inventory.models import SparePart, StockMovement
from .models import MaintenanceExecution, PartUsage


class PartUsageSerializer(serializers.ModelSerializer):
    part_number = serializers.CharField(source="part.part_number", read_only=True)
    part_name = serializers.CharField(source="part.name", read_only=True)
    logged_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PartUsage
        fields = [
            "id",
            "execution",
            "part",
            "part_number",
            "part_name",
            "quantity_used",
            "logged_by",
            "logged_by_name",
            "logged_at",
        ]
        read_only_fields = ["id", "logged_by", "logged_by_name", "logged_at"]

    def get_logged_by_name(self, obj):
        if obj.logged_by:
            return obj.logged_by.get_full_name() or obj.logged_by.username
        return None

    def create(self, validated_data):
        part = validated_data["part"]
        qty = validated_data["quantity_used"]
        execution = validated_data["execution"]

        with transaction.atomic():
            locked_part = SparePart.objects.select_for_update().get(pk=part.pk)
            if locked_part.quantity < qty:
                raise serializers.ValidationError(
                    {"quantity_used": f"Insufficient stock for {locked_part.part_number}. Available: {locked_part.quantity}."}
                )
            locked_part.quantity -= qty
            locked_part.save(update_fields=["quantity", "updated_at"])

            StockMovement.objects.create(
                part=locked_part,
                movement_type=StockMovement.MovementType.OUT,
                quantity=qty,
                reference_note=f"Consumed in {execution.work_order.wo_number}",
                work_order=execution.work_order,
                performed_by=validated_data.get("logged_by"),
            )
            return super().create(validated_data)


class MaintenanceExecutionSerializer(serializers.ModelSerializer):
    wo_number = serializers.CharField(source="work_order.wo_number", read_only=True)
    work_order_title = serializers.CharField(source="work_order.title", read_only=True)
    aircraft_registration = serializers.CharField(
        source="work_order.aircraft.registration", read_only=True
    )
    technician_name = serializers.SerializerMethodField()
    parts_used = PartUsageSerializer(many=True, read_only=True)

    class Meta:
        model = MaintenanceExecution
        fields = [
            "id",
            "work_order",
            "wo_number",
            "work_order_title",
            "aircraft_registration",
            "technician",
            "technician_name",
            "started_at",
            "completed_at",
            "status",
            "hours_logged",
            "checklist_completed",
            "notes",
            "parts_used",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_technician_name(self, obj):
        if obj.technician:
            return obj.technician.get_full_name() or obj.technician.username
        return None
