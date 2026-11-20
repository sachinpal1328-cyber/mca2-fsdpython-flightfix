from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from apps.inventory.models import SparePart
from apps.workorders.models import WorkOrder


class MaintenanceExecution(models.Model):
    class Status(models.TextChoices):
        STARTED = "STARTED", "In Progress"
        PAUSED = "PAUSED", "Paused"
        COMPLETED = "COMPLETED", "Completed"

    work_order = models.ForeignKey(
        WorkOrder, on_delete=models.CASCADE, related_name="executions"
    )
    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="maintenance_executions",
    )
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.STARTED, db_index=True
    )
    hours_logged = models.DecimalField(
        max_digits=6, decimal_places=2, default=0.00, validators=[MinValueValidator(0)]
    )
    checklist_completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"Execution #{self.id} for {self.work_order.wo_number}"


class PartUsage(models.Model):
    execution = models.ForeignKey(
        MaintenanceExecution, on_delete=models.CASCADE, related_name="parts_used"
    )
    part = models.ForeignKey(
        SparePart, on_delete=models.PROTECT, related_name="execution_usages"
    )
    quantity_used = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    logged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="logged_part_usages",
    )
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"{self.quantity_used} x {self.part.part_number} (Exec #{self.execution_id})"
