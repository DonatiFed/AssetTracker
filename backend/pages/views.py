from rest_framework import viewsets, permissions,status,generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes,action
from django.db.models import Sum,Exists,OuterRef,Prefetch

from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from .models import Asset, Location, Assignment, Acquisition, Report,CustomUser
from .serializers import (
    AssetSerializer, LocationSerializer, AssignmentSerializer,
    AcquisitionSerializer, ReportSerializer, UserSerializer,CustomUserSerializer,RegisterSerializer
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user
    serializer = CustomUserSerializer(user)
    return Response(serializer.data)



User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """API per la registrazione di un nuovo utente"""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # ⬅ Rimuove il requisito di autenticazione

    def create(self, request, *args, **kwargs):
        """Gestisce la registrazione e restituisce un messaggio di successo"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Viewset per la gestione utenti
class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsManager]  # Solo i manager possono vedere e modificare utenti


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_manager:
            return Asset.objects.all()
        return Asset.objects.filter(assignments__user=user, assignments__is_active=True).distinct()

    @action(detail=False, methods=['get'], url_path='user')
    def user_assets(self, request):
        user_assets = Asset.objects.filter(assignments__user=request.user, assignments__is_active=True).distinct()
        for asset in user_assets:
            acquired = \
            Acquisition.objects.filter(assignment__asset=asset, is_active=True).aggregate(total=Sum('quantity'))[
                'total'] or 0
            asset.available_quantity = asset.total_quantity - acquired
        serializer = self.get_serializer(user_assets, many=True)
        return Response(serializer.data)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]  # Permettiamo a tutti di aggiungere location
        return [permissions.IsAuthenticated()]


# ✅ Viewset per le assegnazioni di asset
# Viewset per le assignments
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_manager:
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user, is_active=True)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        assignment = self.get_object()
        assignment.is_active = False
        assignment.save()
        return Response(AssignmentSerializer(assignment).data)



# ✅ Viewset per le acquisizioni di asset
class AcquisitionViewSet(viewsets.ModelViewSet):
    queryset = Acquisition.objects.select_related('assignment__asset').all()
    serializer_class = AcquisitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """User vede solo le proprie acquisizioni attive, Manager vede tutte."""
        if self.request.user.is_manager():
            return Acquisition.objects.select_related('assignment__asset')
        return Acquisition.objects.select_related('assignment__asset').filter(
            assignment__user=self.request.user,
            is_active=True
        )

    def perform_create(self, serializer):
        """Permette solo acquisizioni sugli asset assegnati."""
        assignment = serializer.validated_data['assignment']
        if assignment.user != self.request.user:
            return Response({"error": "Non puoi acquisire asset non assegnati a te."}, status=403)
        if Acquisition.objects.filter(assignment=assignment, is_active=True).exists():
            return Response({"error": "Hai già un'acquisizione attiva per questo asset."}, status=400)
        serializer.save()

    def update(self, request, *args, **kwargs):
        """Permette la modifica solo della quantità per acquisizioni proprie attive."""
        instance = self.get_object()
        if instance.assignment.user != request.user or not instance.is_active:
            return Response({"error": "Non puoi modificare questa acquisizione."}, status=403)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """Permette di disattivare un'acquisizione."""
        acquisition = self.get_object()
        acquisition.is_active = False
        acquisition.save()
        return Response(AcquisitionSerializer(acquisition).data)


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



