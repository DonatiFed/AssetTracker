
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import login
from django.http import JsonResponse, HttpResponse



urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('pages.urls')),  # Include tutte le API definite in pages/urls.py
    path('api-auth/', include('rest_framework.urls')),  # Per il login/logout di DRF
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

]
