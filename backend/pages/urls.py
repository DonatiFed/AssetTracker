from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OwnerViewSet, AssetViewSet, OwnershipViewSet  # ✅ Importa i ViewSet

# ✅ Creiamo il router
router = DefaultRouter()
router.register(r'owners', OwnerViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'ownerships', OwnershipViewSet)

urlpatterns = [
    path('', include(router.urls)),  # ✅ Adesso il router è incluso
]