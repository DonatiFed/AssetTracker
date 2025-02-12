from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Asset, Location, Assignment, Acquisition, Report,CustomUser
from .serializers import (
    AssetSerializer, LocationSerializer, AssignmentSerializer,
    AcquisitionSerializer, ReportSerializer, UserSerializer,CustomUserSerializer
)
from django.contrib.auth import get_user_model
from .permissions import IsManager, IsOwnerOrManager







class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_permissions(self):
        """
        Definisce i permessi in base al tipo di richiesta:
        - Solo i manager possono vedere la lista di tutti gli utenti
        - Gli utenti normali possono vedere solo il proprio profilo
        """
        if self.action == 'list':  # GET /users/
            permission_classes = [IsAuthenticated, IsManager]
        elif self.action == 'retrieve':  # GET /users/<id>/
            permission_classes = [IsAuthenticated, IsOwnerOrManager]
        else:  # PUT, PATCH, DELETE
            permission_classes = [IsAuthenticated, IsOwnerOrManager]

        return [permission() for permission in permission_classes]


# ✅ Viewset per la gestione utenti
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsManager]  # Solo i manager possono vedere e modificare utenti


# ✅ Viewset per gli asset
class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    def get_permissions(self):
        """Manager può gestire tutto, user può solo vedere gli asset assegnati."""
        if self.request.user.is_manager():
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsOwnerOrManager()]


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]  # Permettiamo a tutti di aggiungere location
        return [permissions.IsAuthenticated()]


# ✅ Viewset per le assegnazioni di asset
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        """Solo il manager può assegnare gli asset, gli user non modificano nulla."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManager()]
        return [permissions.IsAuthenticated()]


# ✅ Viewset per le acquisizioni di asset
class AcquisitionViewSet(viewsets.ModelViewSet):
    queryset = Acquisition.objects.all()
    serializer_class = AcquisitionSerializer

    def get_queryset(self):
        """Gli user vedono solo le proprie acquisizioni, i manager vedono tutto."""
        if self.request.user.is_manager():
            return Acquisition.objects.all()
        return Acquisition.objects.filter(assignment__user=self.request.user)

    def perform_create(self, serializer):
        """L’utente può acquisire solo asset assegnati e disponibili."""
        assignment = serializer.validated_data['assignment']
        quantity = serializer.validated_data['quantity']

        if assignment.user != self.request.user:
            return Response({"error": "Non puoi acquisire asset non assegnati a te."}, status=403)

        if quantity > assignment.asset.total_quantity:
            return Response({"error": "Non ci sono abbastanza asset disponibili."}, status=400)

        serializer.save()


# ✅ Viewset per i report
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_queryset(self):
        """Gli user vedono solo i loro report, i manager vedono tutti i report."""
        if self.request.user.is_manager():
            return Report.objects.all()
        return Report.objects.filter(acquisition__assignment__user=self.request.user)

    def perform_create(self, serializer):
        """Permettiamo solo agli utenti di creare report per le proprie acquisizioni."""
        acquisition = serializer.validated_data['acquisition']
        if acquisition.assignment.user != self.request.user:
            return Response({"error": "Non puoi creare un report per un'acquisizione che non è tua."}, status=403)
        serializer.save()



