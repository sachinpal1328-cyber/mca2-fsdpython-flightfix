from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import WorkOrderTaskViewSet, WorkOrderViewSet

router = DefaultRouter()
router.register(r"orders", WorkOrderViewSet, basename="workorder")
router.register(r"tasks", WorkOrderTaskViewSet, basename="workorder-task")

urlpatterns = [
    path("", include(router.urls)),
]
