from rest_framework import serializers
from .models import IntegrationLog, PurchaseRequest, Vendor


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            "id",
            "vendor_code",
            "name",
            "contact_person",
            "email",
            "phone",
            "city",
            "country",
            "status",
            "rating",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class PurchaseRequestSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    part_number = serializers.CharField(source="part.part_number", read_only=True, default=None)
    requested_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseRequest
        fields = [
            "id",
            "pr_number",
            "vendor",
            "vendor_name",
            "part",
            "part_number",
            "item_description",
            "quantity",
            "estimated_cost_inr",
            "status",
            "requested_by",
            "requested_by_name",
            "approved_by",
            "expected_delivery_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "pr_number",
            "requested_by",
            "requested_by_name",
            "approved_by",
            "created_at",
            "updated_at",
        ]

    def get_requested_by_name(self, obj):
        if obj.requested_by:
            return obj.requested_by.get_full_name() or obj.requested_by.username
        return None


class IntegrationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = IntegrationLog
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
