from rest_framework import permissions

class IsManager(permissions.BasePermission):
    """
    Permette l'accesso solo ai manager.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'


class IsOwnerOrManager(permissions.BasePermission):
    """
    Permette agli utenti di vedere solo i propri dati, mentre i manager vedono tutto.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (obj == request.user or request.user.role == 'manager')
