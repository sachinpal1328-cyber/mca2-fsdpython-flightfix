from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import IntegrationLogViewSet, PurchaseRequestViewSet, VendorViewSet

router = DefaultRouter()
router.register(r"vendors", VendorViewSet, basename="vendor")
router.register(r"purchase-requests", PurchaseRequestViewSet, basename="purchase-request")
router.register(r"logs", IntegrationLogViewSet, basename="integration-log")

urlpatterns = [
    path("", include(router.urls)),
]
