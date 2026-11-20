from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ComplianceRecordViewSet, InspectionViewSet

router = DefaultRouter()
router.register(r"records", ComplianceRecordViewSet, basename="compliance-record")
router.register(r"inspections", InspectionViewSet, basename="inspection")

urlpatterns = [
    path("", include(router.urls)),
]
