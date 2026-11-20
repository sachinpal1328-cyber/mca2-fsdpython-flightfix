from django.conf import settings
from django.db import models
from apps.aircraft.models import Aircraft


class ComplianceRecord(models.Model):
    class Category(models.TextChoices):
        DGCA_CAR = "DGCA_CAR", "DGCA CAR Reference"
        FAA_AD = "FAA_AD", "Airworthiness Directive"
        EASA_SB = "EASA_SB", "Service Bulletin"
        INTERNAL_SAFETY = "INTERNAL_SAFETY", "Internal Safety Audit"
        ENVIRONMENTAL = "ENVIRONMENTAL", "Environmental & Hazmat"

    class Status(models.TextChoices):
        COMPLIANT = "COMPLIANT", "Compliant"
        PENDING = "PENDING", "Pending Review"
        EXPIRING_SOON = "EXPIRING_SOON", "Expiring Soon"
        EXPIRED = "EXPIRED", "Expired"
        NON_COMPLIANT = "NON_COMPLIANT", "Non-Compliant"

    title = models.CharField(max_length=200)
    regulation_code = models.CharField(max_length=64, db_index=True)
    category = models.CharField(
        max_length=24, choices=Category.choices, default=Category.INTERNAL_SAFETY
    )
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="compliance_records",
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True, db_index=True)
    last_audited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audited_compliance_records",
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["expiry_date", "-created_at"]

    def __str__(self):
        return f"{self.regulation_code} — {self.title}"


class Inspection(models.Model):
    class Result(models.TextChoices):
        PASS = "PASS", "Pass"
        FAIL = "FAIL", "Fail"
        CONDITIONAL = "CONDITIONAL", "Conditional Pass"

    compliance_record = models.ForeignKey(
        ComplianceRecord,
        on_delete=models.CASCADE,
        related_name="inspections",
    )
    aircraft = models.ForeignKey(
        Aircraft, on_delete=models.CASCADE, related_name="inspections"
    )
    inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="conducted_inspections",
    )
    inspection_date = models.DateField()
    result = models.CharField(max_length=16, choices=Result.choices, default=Result.PASS)
    findings = models.TextField(blank=True, default="")
    corrective_action = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-inspection_date", "-created_at"]

    def __str__(self):
        return f"Inspection {self.aircraft.registration} ({self.result})"
