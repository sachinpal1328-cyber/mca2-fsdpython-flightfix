from django.core.validators import MinValueValidator
from django.db import models


class Aircraft(models.Model):
    class Status(models.TextChoices):
        OPERATIONAL = "OPERATIONAL", "Operational"
        IN_MAINTENANCE = "IN_MAINTENANCE", "In Maintenance"
        GROUNDED = "GROUNDED", "Grounded"
        AOG = "AOG", "Aircraft on Ground (AOG)"

    class AircraftType(models.TextChoices):
        COMMERCIAL = "COMMERCIAL", "Commercial Jet"
        DEFENSE = "DEFENSE", "Defense / Tactical"
        CARGO = "CARGO", "Cargo Transport"
        HELICOPTER = "HELICOPTER", "Rotorcraft / Helicopter"

    registration = models.CharField(max_length=20, unique=True, db_index=True)
    model_name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=64, unique=True)
    aircraft_type = models.CharField(
        max_length=20, choices=AircraftType.choices, default=AircraftType.COMMERCIAL
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPERATIONAL, db_index=True
    )
    flight_hours = models.DecimalField(
        max_digits=10, decimal_places=1, default=0.0, validators=[MinValueValidator(0)]
    )
    base_location = models.CharField(max_length=100, default="IGI Airport, New Delhi (VIDP)")
    last_inspection_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["registration"]
        verbose_name_plural = "Aircraft"
        indexes = [
            models.Index(fields=["status", "next_due_date"]),
        ]

    def __str__(self):
        return f"{self.registration} — {self.manufacturer} {self.model_name}"


class Equipment(models.Model):
    class Category(models.TextChoices):
        AVIONICS = "AVIONICS", "Avionics"
        PROPULSION = "PROPULSION", "Propulsion / Engine"
        LANDING_GEAR = "LANDING_GEAR", "Landing Gear"
        HYDRAULICS = "HYDRAULICS", "Hydraulics"
        ELECTRICAL = "ELECTRICAL", "Electrical"
        SAFETY = "SAFETY", "Safety & Emergency"

    class Status(models.TextChoices):
        SERVICEABLE = "SERVICEABLE", "Serviceable"
        NEEDS_INSPECTION = "NEEDS_INSPECTION", "Needs Inspection"
        UNSERVICEABLE = "UNSERVICEABLE", "Unserviceable"
        REPLACED = "REPLACED", "Replaced"

    aircraft = models.ForeignKey(
        Aircraft, on_delete=models.CASCADE, related_name="equipment"
    )
    name = models.CharField(max_length=120)
    part_number = models.CharField(max_length=64, db_index=True)
    serial_number = models.CharField(max_length=64, unique=True)
    category = models.CharField(
        max_length=24, choices=Category.choices, default=Category.AVIONICS
    )
    status = models.CharField(
        max_length=24, choices=Status.choices, default=Status.SERVICEABLE, db_index=True
    )
    installed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["aircraft__registration", "name"]

    def __str__(self):
        return f"{self.name} ({self.serial_number}) on {self.aircraft.registration}"
