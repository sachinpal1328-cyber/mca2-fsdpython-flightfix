from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsContractsManagerOrAdmin
from apps.inventory.models import SparePart, StockMovement
from .models import IntegrationLog, PurchaseRequest, Vendor
from .serializers import (
    IntegrationLogSerializer,
    PurchaseRequestSerializer,
    VendorSerializer,
)


class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsContractsManagerOrAdmin]
    filterset_fields = ["status", "city", "country"]
    search_fields = ["vendor_code", "name", "contact_person", "city"]


class PurchaseRequestViewSet(viewsets.ModelViewSet):
    queryset = PurchaseRequest.objects.select_related(
        "vendor", "part", "requested_by", "approved_by"
    ).all()
    serializer_class = PurchaseRequestSerializer
    permission_classes = [IsContractsManagerOrAdmin]
    filterset_fields = ["status", "vendor"]
    search_fields = ["pr_number", "item_description", "vendor__name"]

    def perform_create(self, serializer):
        pr = serializer.save(requested_by=self.request.user)
        IntegrationLog.objects.create(
            system_name="SAP S/4HANA ERP (Simulated)",
            direction=IntegrationLog.Direction.OUTBOUND,
            action=f"Purchase Request Created: {pr.pr_number}",
            status=IntegrationLog.Status.SIMULATED,
            is_simulated=True,
            payload_summary=f"Vendor={pr.vendor.vendor_code}, Qty={pr.quantity}, INR={pr.estimated_cost_inr}",
            response_message="Simulated ERP acknowledgment received (202 Accepted).",
        )

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        pr = self.get_object()
        pr.status = PurchaseRequest.Status.APPROVED
        pr.approved_by = request.user
        pr.save(update_fields=["status", "approved_by", "updated_at"])
        return Response(self.get_serializer(pr).data)

    @action(detail=True, methods=["post"])
    def receive(self, request, pk=None):
        pr = self.get_object()
        if pr.status == PurchaseRequest.Status.RECEIVED:
            return Response(
                {"detail": "Purchase request already marked as received."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            pr.status = PurchaseRequest.Status.RECEIVED
            pr.save(update_fields=["status", "updated_at"])
            if pr.part_id:
                part = SparePart.objects.select_for_update().get(pk=pr.part_id)
                part.quantity += pr.quantity
                part.last_restocked_at = timezone.now()
                part.save(update_fields=["quantity", "last_restocked_at", "updated_at"])
                StockMovement.objects.create(
                    part=part,
                    movement_type=StockMovement.MovementType.IN,
                    quantity=pr.quantity,
                    reference_note=f"Received via {pr.pr_number} ({pr.vendor.name})",
                    performed_by=request.user,
                )
            IntegrationLog.objects.create(
                system_name="SAP S/4HANA ERP (Simulated)",
                direction=IntegrationLog.Direction.INBOUND,
                action=f"Goods Receipt Synced: {pr.pr_number}",
                status=IntegrationLog.Status.SIMULATED,
                is_simulated=True,
                payload_summary=f"PR={pr.pr_number}, Qty={pr.quantity}",
                response_message="Simulated goods receipt posted and inventory updated.",
            )
        return Response(self.get_serializer(pr).data)


class IntegrationLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IntegrationLog.objects.all()
    serializer_class = IntegrationLogSerializer
    permission_classes = [IsContractsManagerOrAdmin]
    filterset_fields = ["status", "direction", "is_simulated"]
    search_fields = ["system_name", "action", "payload_summary"]

    @action(detail=False, methods=["post"], url_path="simulate-erp-sync")
    def simulate_erp_sync(self, request):
        log = IntegrationLog.objects.create(
            system_name="SAP S/4HANA ERP (Simulated)",
            direction=IntegrationLog.Direction.OUTBOUND,
            action="Manual Inventory & Procurement Sync",
            status=IntegrationLog.Status.SIMULATED,
            is_simulated=True,
            payload_summary=f"Triggered by {request.user.username}",
            response_message="Simulated ERP sync completed successfully (no external ERP credentials configured).",
        )
        return Response(self.get_serializer(log).data, status=status.HTTP_201_CREATED)
