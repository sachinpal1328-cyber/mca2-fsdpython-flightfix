"""
Root URL configuration for FlightFix MRO API.
"""
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def health_check(request):
    """Health endpoint for Render and monitoring."""
    db_ok = True
    db_engine = connection.vendor
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:
        db_ok = False
    status_code = 200 if db_ok else 503
    return JsonResponse(
        {
            "status": "healthy" if db_ok else "degraded",
            "service": "FlightFix MRO API",
            "version": "1.0.0",
            "database": db_engine,
            "database_connected": db_ok,
        },
        status=status_code,
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health-check"),
    # OpenAPI / Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    # Domain API routes
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/", include("apps.aircraft.urls")),
    path("api/maintenance/", include("apps.maintenance.urls")),
    path("api/workorders/", include("apps.workorders.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/execution/", include("apps.execution.urls")),
    path("api/compliance/", include("apps.compliance.urls")),
    path("api/supply-chain/", include("apps.integrations.urls")),
    path("api/analytics/", include("apps.analytics.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
]
