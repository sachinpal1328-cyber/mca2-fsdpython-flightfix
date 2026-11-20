from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import SparePart, StockMovement


class SparePartSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)
    total_value_inr = serializers.SerializerMethodField()

    class Meta:
        model = SparePart
        fields = [
            "id",
            "part_number",
            "name",
            "description",
            "category",
            "quantity",
            "min_stock_threshold",
            "warehouse_location",
            "supplier_name",
            "unit_cost_inr",
            "total_value_inr",
            "is_low_stock",
            "last_restocked_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_low_stock", "total_value_inr", "created_at", "updated_at"]

    def get_total_value_inr(self, obj):
        return float(obj.quantity * obj.unit_cost_inr)


class StockMovementSerializer(serializers.ModelSerializer):
    part_number = serializers.CharField(source="part.part_number", read_only=True)
    part_name = serializers.CharField(source="part.name", read_only=True)
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StockMovement
        fields = [
            "id",
            "part",
            "part_number",
            "part_name",
            "movement_type",
            "quantity",
            "reference_note",
            "work_order",
            "performed_by",
            "performed_by_name",
            "created_at",
        ]
        read_only_fields = ["id", "performed_by", "performed_by_name", "created_at"]

    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return None

    def create(self, validated_data):
        part = validated_data["part"]
        movement_type = validated_data["movement_type"]
        qty = validated_data["quantity"]

        with transaction.atomic():
            part = SparePart.objects.select_for_update().get(pk=part.pk)
            if movement_type == StockMovement.MovementType.IN:
                part.quantity += qty
                part.last_restocked_at = timezone.now()
            elif movement_type == StockMovement.MovementType.OUT:
                if part.quantity < qty:
                    raise serializers.ValidationError(
                        {"quantity": f"Insufficient stock. Available: {part.quantity}, requested: {qty}."}
                    )
                part.quantity -= qty
            elif movement_type == StockMovement.MovementType.ADJUSTMENT:
                part.quantity = qty
            part.save(update_fields=["quantity", "last_restocked_at", "updated_at"])
            return super().create(validated_data)
