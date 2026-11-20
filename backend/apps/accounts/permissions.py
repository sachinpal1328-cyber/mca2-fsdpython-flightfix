from rest_framework.permissions import BasePermission, SAFE_METHODS


class RolePermission(BasePermission):
    """Base permission checking user.role against allowed_roles."""

    allowed_roles = ()
    read_only_roles = ()

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated or not user.is_active:
            return False
        if user.role == "ADMIN" or user.is_superuser:
            return True
        if request.method in SAFE_METHODS and user.role in self.read_only_roles:
            return True
        return user.role in self.allowed_roles


class IsAdminRole(RolePermission):
    allowed_roles = ("ADMIN",)


class IsSafetyOfficerOrAdmin(RolePermission):
    allowed_roles = ("ADMIN", "SAFETY_OFFICER")
    read_only_roles = ("CONTRACTS_MANAGER", "FIELD_TECHNICIAN")


class IsContractsManagerOrAdmin(RolePermission):
    allowed_roles = ("ADMIN", "CONTRACTS_MANAGER")
    read_only_roles = ("SAFETY_OFFICER", "FIELD_TECHNICIAN")


class IsTechnicianOrAbove(RolePermission):
    allowed_roles = ("ADMIN", "SAFETY_OFFICER", "CONTRACTS_MANAGER", "FIELD_TECHNICIAN")


class IsExecutionActor(RolePermission):
    """Field Technicians, Safety Officers, and Admins can record execution."""
    allowed_roles = ("ADMIN", "SAFETY_OFFICER", "FIELD_TECHNICIAN")
    read_only_roles = ("CONTRACTS_MANAGER",)
