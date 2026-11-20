from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Category(models.TextChoices):
        MAINTENANCE = "MAINTENANCE", "Maintenance"
        WORKORDER = "WORKORDER", "Work Order"
        INVENTORY = "INVENTORY", "Inventory"
        COMPLIANCE = "COMPLIANCE", "Compliance"
        SYSTEM = "SYSTEM", "System"

    class Severity(models.TextChoices):
        INFO = "INFO", "Info"
        WARNING = "WARNING", "Warning"
        CRITICAL = "CRITICAL", "Critical"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
        help_text="Null means broadcast to all authenticated users.",
    )
    title = models.CharField(max_length=160)
    message = models.TextField()
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.SYSTEM
    )
    severity = models.CharField(
        max_length=16, choices=Severity.choices, default=Severity.INFO
    )
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.title}"
