from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from .models import Owner, Asset, Ownership, Location, Report
from .serializers import OwnerSerializer, AssetSerializer, OwnershipSerializer, LocationSerializer, ReportSerializer

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

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer


