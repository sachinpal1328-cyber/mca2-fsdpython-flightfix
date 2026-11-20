from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MaintenanceExecutionViewSet, PartUsageViewSet

router = DefaultRouter()
router.register(r"logs", MaintenanceExecutionViewSet, basename="execution-log")
router.register(r"parts-used", PartUsageViewSet, basename="part-usage")

urlpatterns = [
    path("", include(router.urls)),
]
