
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import login
from django.http import JsonResponse



def health_check(request):
    return JsonResponse({"status": "ok"})

# View di test per verificare che Django sia online
def home(request):
    return HttpResponse("Django è online su Render! 🚀")
urlpatterns = [
    path("", home, name="home"),
    path('admin/', admin.site.urls),
    path('api/', include('pages.urls')),  # Include tutte le API definite in pages/urls.py
    path('api-auth/', include('rest_framework.urls')),  # Per il login/logout di DRF
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/health/", health_check),

]
