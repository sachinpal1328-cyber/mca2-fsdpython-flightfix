from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model supporting Aviation MRO roles."""

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SAFETY_OFFICER = "SAFETY_OFFICER", "Safety Officer"
        CONTRACTS_MANAGER = "CONTRACTS_MANAGER", "Contracts Manager"
        FIELD_TECHNICIAN = "FIELD_TECHNICIAN", "Field Technician"

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=32,
        choices=Role.choices,
        default=Role.FIELD_TECHNICIAN,
        db_index=True,
    )
    employee_id = models.CharField(max_length=32, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, blank=True, default="MRO Operations")
    phone = models.CharField(max_length=20, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["role", "is_active"]),
        ]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
