from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from apps.aircraft.models import Aircraft


class MaintenancePlan(models.Model):
    class MaintenanceType(models.TextChoices):
        A_CHECK = "A_CHECK", "A-Check (Line / Minor)"
        B_CHECK = "B_CHECK", "B-Check (Intermediate)"
        C_CHECK = "C_CHECK", "C-Check (Heavy Structural)"
        D_CHECK = "D_CHECK", "D-Check (Major Overhaul)"
        LINE = "LINE", "Line Maintenance"
        UNSCHEDULED = "UNSCHEDULED", "Unscheduled / AOG"

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        OVERDUE = "OVERDUE", "Overdue"
        ARCHIVED = "ARCHIVED", "Archived"

    title = models.CharField(max_length=200)
    aircraft = models.ForeignKey(
        Aircraft, on_delete=models.CASCADE, related_name="maintenance_plans"
    )
    maintenance_type = models.CharField(
        max_length=20, choices=MaintenanceType.choices, default=MaintenanceType.A_CHECK
    )
    frequency_days = models.PositiveIntegerField(
        default=90, validators=[MinValueValidator(1)]
    )
    frequency_hours = models.PositiveIntegerField(default=500)
    scheduled_date = models.DateField(db_index=True)
    due_date = models.DateField(db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED, db_index=True
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_maintenance_plans",
    )
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date", "-created_at"]
        indexes = [
            models.Index(fields=["status", "due_date"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.aircraft.registration})"
