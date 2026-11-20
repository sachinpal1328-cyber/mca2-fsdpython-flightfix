from django.contrib import admin
from .models import IntegrationLog, PurchaseRequest, Vendor

admin.site.register(Vendor)
admin.site.register(PurchaseRequest)
admin.site.register(IntegrationLog)
