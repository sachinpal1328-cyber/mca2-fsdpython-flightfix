from django.contrib import admin
from .models import WorkOrder, WorkOrderTask

admin.site.register(WorkOrder)
admin.site.register(WorkOrderTask)
