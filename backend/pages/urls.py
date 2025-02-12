from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet, AssetViewSet, AssignmentViewSet, AcquisitionViewSet,
    ReportViewSet, LocationViewSet
)

router = DefaultRouter()

# Le API accessibili ai manager
router.register(r'users', CustomUserViewSet)  # Solo per i manager
router.register(r'assets', AssetViewSet)  # Manager può modificare
router.register(r'assignments', AssignmentViewSet)  # Manager assegna asset
router.register(r'acquisitions', AcquisitionViewSet)  # User può acquisire/rilasciare asset
router.register(r'reports', ReportViewSet)  # User può scrivere report
router.register(r'locations', LocationViewSet)  # Manager può aggiungere/modificare luoghi, user li vede

urlpatterns = [
    path('api/', include(router.urls)),
]