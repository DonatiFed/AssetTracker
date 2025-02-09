from django.urls import path,include
from rest_framework.routers import DefaultRouter
from .views import homePageView,OwnerViewSet, AssetViewSet, OwnershipViewSet  # Import views from the same folder

router = DefaultRouter()
router.register(r'owners', OwnerViewSet)
router.register(r'assets', AssetViewSet)
router.register(r'ownerships', OwnershipViewSet)
urlpatterns = [
    path('api/', include(router.urls)),
]