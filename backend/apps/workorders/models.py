from django.conf import settings
from django.db import models
from django.utils import timezone
from apps.aircraft.models import Aircraft
from apps.maintenance.models import MaintenancePlan


class WorkOrder(models.Model):
    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        CRITICAL = "CRITICAL", "Critical / AOG"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        ON_HOLD = "ON_HOLD", "On Hold"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    wo_number = models.CharField(max_length=32, unique=True, blank=True, db_index=True)
    title = models.CharField(max_length=200)
    aircraft = models.ForeignKey(
        Aircraft, on_delete=models.CASCADE, related_name="work_orders"
    )
    maintenance_plan = models.ForeignKey(
        MaintenancePlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="work_orders",
    )
    priority = models.CharField(
        max_length=16, choices=Priority.choices, default=Priority.MEDIUM, db_index=True
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.OPEN, db_index=True
    )
    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_work_orders",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_work_orders",
    )
    due_date = models.DateField(db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "priority", "due_date"]),
        ]

    def save(self, *args, **kwargs):
        if not self.wo_number:
            year = timezone.now().year
            last = WorkOrder.objects.filter(wo_number__startswith=f"WO-{year}-").order_by("-id").first()
            seq = 1
            if last and last.wo_number:
                try:
                    seq = int(last.wo_number.split("-")[-1]) + 1
                except ValueError:
                    seq = WorkOrder.objects.count() + 1
            self.wo_number = f"WO-{year}-{seq:04d}"
        if self.status == self.Status.COMPLETED and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.wo_number}: {self.title}"


class WorkOrderTask(models.Model):
    work_order = models.ForeignKey(
        WorkOrder, on_delete=models.CASCADE, related_name="tasks"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_wo_tasks",
    )
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.work_order.wo_number} — {self.title}"
