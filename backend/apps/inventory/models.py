from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.workorders.models import WorkOrder


class SparePart(models.Model):
    class Category(models.TextChoices):
        AVIONICS = "AVIONICS", "Avionics"
        ENGINE = "ENGINE", "Engine & Propulsion"
        AIRFRAME = "AIRFRAME", "Airframe & Structural"
        HYDRAULICS = "HYDRAULICS", "Hydraulics & Landing Gear"
        ELECTRICAL = "ELECTRICAL", "Electrical"
        CONSUMABLES = "CONSUMABLES", "Consumables & Seals"

    part_number = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default="")
    category = models.CharField(
        max_length=24, choices=Category.choices, default=Category.AIRFRAME
    )
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    min_stock_threshold = models.PositiveIntegerField(default=5)
    warehouse_location = models.CharField(max_length=120, default="Delhi Hangar Store A1")
    supplier_name = models.CharField(max_length=150, blank=True, default="")
    unit_cost_inr = models.DecimalField(
        max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)]
    )
    last_restocked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["part_number"]
        indexes = [
            models.Index(fields=["category", "quantity"]),
        ]

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_stock_threshold

    def __str__(self):
        return f"{self.part_number} — {self.name} (Qty: {self.quantity})"


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        IN = "IN", "Stock In (Restock)"
        OUT = "OUT", "Stock Out (Issued)"
        ADJUSTMENT = "ADJUSTMENT", "Inventory Adjustment"

    part = models.ForeignKey(
        SparePart, on_delete=models.CASCADE, related_name="movements"
    )
    movement_type = models.CharField(max_length=16, choices=MovementType.choices)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    reference_note = models.CharField(max_length=255, blank=True, default="")
    work_order = models.ForeignKey(
        WorkOrder,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} {self.quantity} x {self.part.part_number}"
