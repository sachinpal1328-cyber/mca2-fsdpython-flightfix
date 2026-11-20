from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AircraftViewSet, EquipmentViewSet

router = DefaultRouter()
router.register(r"aircraft", AircraftViewSet, basename="aircraft")
router.register(r"equipment", EquipmentViewSet, basename="equipment")

urlpatterns = [
    path("", include(router.urls)),
]
