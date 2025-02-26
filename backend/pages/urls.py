from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet, AssetViewSet, AssignmentViewSet, AcquisitionViewSet,
    ReportViewSet, LocationViewSet, get_current_user, RegisterView
)
from django.http import JsonResponse, HttpResponse

router = DefaultRouter()

# Le API accessibili ai manager e agli utenti
router.register(r'users', CustomUserViewSet)  # Manager gestisce utenti
router.register(r'assets', AssetViewSet)  # Manager può modificare
router.register(r'assignments', AssignmentViewSet)  # Manager assegna asset
router.register(r'acquisitions', AcquisitionViewSet)  # Utente acquisisce/rilascia asset
router.register(r'reports', ReportViewSet)  # Utente scrive report
router.register(r'locations', LocationViewSet)  # Manager modifica luoghi, utenti li vedono

def home(request):
    return HttpResponse("Django è online su Render? 🚀")
def health_check(request):
    return JsonResponse({"status": "ok"})



urlpatterns = [
    path("", home, name="home"),  # Pagina di test
    path("api/", include(router.urls)),  # ✅ Registra tutte le API del backend
    path("api/register/", RegisterView.as_view(), name="register"),
    path("users/me/", get_current_user, name="get_current_user"),
    path("health/", health_check),  # Health check per verificare il backend
]