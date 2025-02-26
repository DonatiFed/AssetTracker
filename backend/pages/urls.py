from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet, AssetViewSet, AssignmentViewSet, AcquisitionViewSet,
    ReportViewSet, LocationViewSet, get_current_user, RegisterView
)
from django.http import HttpResponse


router = DefaultRouter()

# Le API accessibili ai manager
router.register(r'users', CustomUserViewSet)  # Solo per i manager
router.register(r'assets', AssetViewSet)  # Manager può modificare
router.register(r'assignments', AssignmentViewSet)  # Manager assegna asset
router.register(r'acquisitions', AcquisitionViewSet)  # User può acquisire/rilasciare asset
router.register(r'reports', ReportViewSet)  # User può scrivere report
router.register(r'locations', LocationViewSet)  # Manager può aggiungere/modificare luoghi, user li vede

def home(request):
    return HttpResponse("Django è online su Render! 🚀")
urlpatterns = [
    path("", home, name="home"),  # ✅ AGGIUNGI LA ROOT
    path("api/", include(router.urls)),  # ✅ API REST
    path("api/register/", RegisterView.as_view(), name="register"),
    path("users/me/", get_current_user, name="get_current_user"),
]
