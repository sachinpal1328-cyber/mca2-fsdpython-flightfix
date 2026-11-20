from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from apps.inventory.models import SparePart


class Vendor(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        PENDING = "PENDING", "Pending Onboarding"

    vendor_code = models.CharField(max_length=32, unique=True, db_index=True)
    name = models.CharField(max_length=150)
    contact_person = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=25, blank=True, default="")
    city = models.CharField(max_length=80, default="Bengaluru")
    country = models.CharField(max_length=80, default="India")
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )
    rating = models.PositiveSmallIntegerField(
        default=4, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.vendor_code} — {self.name}"


class PurchaseRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        APPROVED = "APPROVED", "Approved"
        ORDERED = "ORDERED", "Ordered (PO Issued)"
        RECEIVED = "RECEIVED", "Received in Inventory"
        REJECTED = "REJECTED", "Rejected"

    pr_number = models.CharField(max_length=32, unique=True, blank=True, db_index=True)
    vendor = models.ForeignKey(
        Vendor, on_delete=models.PROTECT, related_name="purchase_requests"
    )
    part = models.ForeignKey(
        SparePart,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="purchase_requests",
    )
    item_description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    estimated_cost_inr = models.DecimalField(
        max_digits=14, decimal_places=2, default=0.00, validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.SUBMITTED, db_index=True
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="requested_purchases",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_purchases",
    )
    expected_delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.pr_number:
            year = timezone.now().year
            last = PurchaseRequest.objects.filter(pr_number__startswith=f"PR-{year}-").order_by("-id").first()
            seq = 1
            if last and last.pr_number:
                try:
                    seq = int(last.pr_number.split("-")[-1]) + 1
                except ValueError:
                    seq = PurchaseRequest.objects.count() + 1
            self.pr_number = f"PR-{year}-{seq:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pr_number} — {self.item_description}"


class IntegrationLog(models.Model):
    class Direction(models.TextChoices):
        OUTBOUND = "OUTBOUND", "Outbound"
        INBOUND = "INBOUND", "Inbound"

    class Status(models.TextChoices):
        SIMULATED = "SIMULATED", "Simulated Success"
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    system_name = models.CharField(max_length=100, default="SAP S/4HANA ERP (Simulated)")
    direction = models.CharField(
        max_length=16, choices=Direction.choices, default=Direction.OUTBOUND
    )
    action = models.CharField(max_length=120)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.SIMULATED, db_index=True
    )
    is_simulated = models.BooleanField(default=True)
    payload_summary = models.TextField(blank=True, default="")
    response_message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.status}] {self.system_name}: {self.action}"
