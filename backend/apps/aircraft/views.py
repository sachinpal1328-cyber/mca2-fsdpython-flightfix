from rest_framework import viewsets
from apps.accounts.permissions import IsSafetyOfficerOrAdmin
from .models import Aircraft, Equipment
from .serializers import AircraftSerializer, EquipmentSerializer


class AircraftViewSet(viewsets.ModelViewSet):
    queryset = Aircraft.objects.all()
    serializer_class = AircraftSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["status", "aircraft_type", "manufacturer"]
    search_fields = ["registration", "model_name", "manufacturer", "serial_number", "base_location"]
    ordering_fields = ["registration", "flight_hours", "next_due_date", "created_at"]


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related("aircraft").all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsSafetyOfficerOrAdmin]
    filterset_fields = ["aircraft", "category", "status"]
    search_fields = ["name", "part_number", "serial_number", "aircraft__registration"]
    ordering_fields = ["name", "installed_date", "status", "created_at"]
