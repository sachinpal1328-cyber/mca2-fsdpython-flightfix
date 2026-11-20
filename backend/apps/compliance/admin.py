from django.contrib import admin
from .models import ComplianceRecord, Inspection

admin.site.register(ComplianceRecord)
admin.site.register(Inspection)
