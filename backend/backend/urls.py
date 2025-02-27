
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponse
from django.conf import settings
from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('pages.urls')),  # Include tutte le API definite in pages/urls.py
    path('api-auth/', include('rest_framework.urls')),  # Per il login/logout di DRF
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Gestisci tutte le richieste sconosciute e rimanda a React
    re_path(r'^(?:.*)/?$', TemplateView.as_view(template_name="index.html")),

]

