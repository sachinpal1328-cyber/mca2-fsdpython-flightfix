from rest_framework import serializers
from .models import Aircraft, Equipment


class EquipmentSerializer(serializers.ModelSerializer):
    aircraft_registration = serializers.CharField(source="aircraft.registration", read_only=True)

    class Meta:
        model = Equipment
        fields = [
            "id",
            "aircraft",
            "aircraft_registration",
            "name",
            "part_number",
            "serial_number",
            "category",
            "status",
            "installed_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "aircraft_registration"]


class AircraftSerializer(serializers.ModelSerializer):
    equipment_count = serializers.IntegerField(source="equipment.count", read_only=True)

    class Meta:
        model = Aircraft
        fields = [
            "id",
            "registration",
            "model_name",
            "manufacturer",
            "serial_number",
            "aircraft_type",
            "status",
            "flight_hours",
            "base_location",
            "last_inspection_date",
            "next_due_date",
            "notes",
            "equipment_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "equipment_count"]
