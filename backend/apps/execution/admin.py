from django.contrib import admin
from .models import MaintenanceExecution, PartUsage

admin.site.register(MaintenanceExecution)
admin.site.register(PartUsage)
