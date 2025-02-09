from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Owner, Asset, Ownership
from .serializers import OwnerSerializer, AssetSerializer, OwnershipSerializer

def homePageView(request):
    return HttpResponse("<h1>Hello, this is the home page!</h1>") #string of html code
# Create your views here.

class OwnerViewSet(viewsets.ModelViewSet):
    queryset = Owner.objects.all()
    serializer_class = OwnerSerializer

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

class OwnershipViewSet(viewsets.ModelViewSet):
    queryset = Ownership.objects.all()
    serializer_class = OwnershipSerializer
