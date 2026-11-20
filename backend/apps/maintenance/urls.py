from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MaintenancePlanViewSet

router = DefaultRouter()
router.register(r"plans", MaintenancePlanViewSet, basename="maintenance-plan")

urlpatterns = [
    path("", include(router.urls)),
]
