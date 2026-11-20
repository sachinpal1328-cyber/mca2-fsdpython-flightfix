from django.db.models import F
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.accounts.permissions import IsContractsManagerOrAdmin, IsTechnicianOrAbove
from .models import SparePart, StockMovement
from .serializers import SparePartSerializer, StockMovementSerializer


class SparePartViewSet(viewsets.ModelViewSet):
    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer
    permission_classes = [IsContractsManagerOrAdmin]
    filterset_fields = ["category", "warehouse_location"]
    search_fields = ["part_number", "name", "description", "supplier_name"]
    ordering_fields = ["part_number", "quantity", "unit_cost_inr", "created_at"]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        qs = self.get_queryset().filter(quantity__lte=F("min_stock_threshold"))
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related("part", "work_order", "performed_by").all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsTechnicianOrAbove]
    filterset_fields = ["part", "movement_type", "work_order"]
    search_fields = ["part__part_number", "part__name", "reference_note"]

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)
