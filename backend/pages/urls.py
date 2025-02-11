from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OwnerViewSet, AssetViewSet, OwnershipViewSet,LocationViewSet,ReportViewSet

# ✅ Creiamo il router
router = DefaultRouter()
router.register(r'owners', OwnerViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'ownerships', OwnershipViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'reports', ReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]