from rest_framework import viewsets, permissions,status,generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes,action
from django.db.models import Sum

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
        """Restituisce tutti gli asset per i manager e solo gli assegnati per gli utenti normali."""
        if self.request.user.is_manager():
            return Asset.objects.all()
        else:
            user_assignments = Assignment.objects.filter(user=self.request.user)
            return Asset.objects.filter(assignments__in=user_assignments).distinct()

    @action(detail=False, methods=['get'], url_path='user')
    def user_assets(self, request):
        """ Restituisce solo gli asset assegnati all'utente autenticato, con la quantità disponibile. """
        user_assignments = Assignment.objects.filter(user=request.user)
        user_assets = Asset.objects.filter(assignments__in=user_assignments).distinct()

        # Calcola la quantità disponibile per ogni asset
        for asset in user_assets:
            asset.available_quantity = asset.total_quantity - sum(
                Acquisition.objects.filter(assignment__asset=asset, is_active=True).values_list("quantity", flat=True)
            )

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
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user_id = request.data.get("user")
        asset_id = request.data.get("asset")
        assigned_quantity = int(request.data.get("assigned_quantity", 0))

        # Verifica se l'utente e l'asset esistono
        try:
            user = CustomUser.objects.get(id=user_id)
            asset = Asset.objects.get(id=asset_id)
        except (CustomUser.DoesNotExist, Asset.DoesNotExist):
            return Response({"error": "Utente o asset non valido"}, status=400)

        # Controlla se esiste già un'assegnazione per questo asset a questo user
        existing_assignment = Assignment.objects.filter(user=user, asset=asset).exists()
        if existing_assignment:
            return Response({"error": "Questo asset è già stato assegnato all'utente"}, status=400)

        # Controlla che la quantità assegnata non superi il totale dell'asset
        if assigned_quantity > asset.total_quantity:
            return Response({"error": "Quantità assegnata superiore al totale disponibile"}, status=400)

        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_quantity = int(request.data.get("assigned_quantity", instance.assigned_quantity))

        # Verifica che la nuova quantità assegnata non superi il totale degli asset
        if new_quantity > instance.asset.total_quantity:
            return Response({"error": "Quantità assegnata superiore al totale disponibile"}, status=400)

        instance.assigned_quantity = new_quantity
        instance.save()
        return Response(AssignmentSerializer(instance).data)

    @action(detail=True, methods=["DELETE"])
    def remove(self, request, pk=None):
        assignment = self.get_object()
        assignment.delete()
        return Response({"message": "Assegnazione rimossa con successo"}, status=204)



# ✅ Viewset per le acquisizioni di asset
class AcquisitionViewSet(viewsets.ModelViewSet):
    queryset = Acquisition.objects.all()
    serializer_class = AcquisitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """User vede solo le proprie acquisizioni, Manager vede tutto."""
        if self.request.user.is_manager():
            return Acquisition.objects.all()
        return Acquisition.objects.filter(assignment__user=self.request.user)

    def perform_create(self, serializer):
        """L’utente può acquisire solo asset assegnati e disponibili."""
        assignment = serializer.validated_data['assignment']
        quantity = serializer.validated_data['quantity']

        # Controlla se l'utente sta acquisendo un asset che gli è stato assegnato
        if assignment.user != self.request.user:
            return Response({"error": "Non puoi acquisire asset non assegnati a te."}, status=403)

        # Controlla se ha già un'acquisizione per questo asset
        if Acquisition.objects.filter(assignment=assignment).exists():
            return Response({"error": "Hai già un'acquisizione attiva per questo asset."}, status=400)

        # Salva l'acquisizione
        acquisition = serializer.save()

        # Registra la transazione in History
        History.objects.create(
            user=self.request.user,
            asset=assignment.asset,
            action="Acquisition",
            date=acquisition.acquisition_date,
            location=acquisition.location
        )

    def update(self, request, *args, **kwargs):
        """Permette agli user di modificare solo la quantità di un'acquisizione esistente."""
        instance = self.get_object()
        if instance.assignment.user != request.user:
            return Response({"error": "Non puoi modificare un'acquisizione non tua."}, status=403)

        new_quantity = request.data.get("quantity", instance.quantity)

        # Controlla che la quantità non superi gli asset disponibili
        if new_quantity > instance.assignment.asset.total_quantity:
            return Response({"error": "Quantità assegnata superiore al totale disponibile."}, status=400)

        instance.quantity = new_quantity
        instance.save()
        return Response(AcquisitionSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        """Permette agli user di eliminare solo le proprie acquisizioni."""
        instance = self.get_object()
        if instance.assignment.user != request.user:
            return Response({"error": "Non puoi eliminare un'acquisizione non tua."}, status=403)

        instance.delete()
        return Response({"message": "Acquisizione rimossa con successo"}, status=204)



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



