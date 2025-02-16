from rest_framework import viewsets, permissions,status,generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.decorators import api_view, permission_classes,action
from django.db.models import Sum,Exists,OuterRef,Prefetch
from django.utils.timezone import now

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
    queryset = Assignment.objects.none()  # 🔹 Evita che Django usi un queryset globale
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        print(f"DEBUG: Utente {user.username} - is_manager: {getattr(user, 'is_manager', 'Non definito')}")  # Log utile

        # Controlla se is_manager è un metodo o un campo
        is_manager = user.is_manager if isinstance(user.is_manager, bool) else user.is_manager()

        print(f"DEBUG: is_manager valutato come {is_manager}")  # Controllo finale

        if is_manager:
            return Assignment.objects.all()
        return Assignment.objects.filter(user=user, is_active=True)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        assignment = self.get_object()
        assignment.is_active = False
        assignment.removed_at = now()
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
            assignment__user=self.request.user
        )

    def create(self, request, *args, **kwargs):
        """Gestisce la creazione dell'acquisizione, delegando tutti i controlli al serializer."""
        print("✅ Richiesta ricevuta: CREAZIONE ACQUISIZIONE")  # DEBUG

        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ ERRORE: Dati non validi", serializer.errors)  # DEBUG
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        acquisition = serializer.save()
        serializer.save()
        print(f"✅ Acquisizione salvata! ID: {acquisition.id}")  # DEBUG


        return Response(AcquisitionSerializer(acquisition).data, status=status.HTTP_201_CREATED)


    def update(self, request, *args, **kwargs):
        """Permette la modifica solo della quantità per acquisizioni proprie attive."""
        instance = self.get_object()

        # Se non è un manager, controlliamo che l'utente sia il proprietario
        if not request.user.is_manager and (instance.assignment.user != request.user or not instance.is_active):
            return Response({"error": "Non puoi modificare questa acquisizione."}, status=status.HTTP_403_FORBIDDEN)

        # Controlla che il campo 'quantity' sia presente nella richiesta
        new_quantity = request.data.get("quantity")
        if new_quantity is None:
            return Response({"error": "Il campo 'quantity' è richiesto."}, status=status.HTTP_400_BAD_REQUEST)

        # Converte in numero e verifica validità
        try:
            new_quantity = int(new_quantity)
        except ValueError:
            return Response({"error": "La quantità deve essere un numero intero valido."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Calcola la quantità disponibile usando AssetSerializer
        asset_serializer = AssetSerializer(instance.assignment.asset)
        available_quantity = asset_serializer.get_available_quantity(instance.assignment.asset)

        # Considera l'acquisizione corrente, sottraendo la vecchia quantità
        if new_quantity > available_quantity + instance.quantity:
            return Response({
                                "error": f"Quantità non disponibile. Massimo disponibile: {available_quantity + instance.quantity}."},
                            status=status.HTTP_400_BAD_REQUEST)

        instance.quantity = new_quantity
        instance.save()

        return Response(AcquisitionSerializer(instance).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        """Permette di disattivare un'acquisizione."""
        acquisition = self.get_object()
        acquisition.is_active = False
        acquisition.removed_at = now()
        acquisition.save()
        return Response(AcquisitionSerializer(acquisition).data)


# ✅ Viewset per i report
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.none()
    serializer_class = ReportSerializer

    def get_queryset(self):
        """Gli user vedono solo i loro report, i manager vedono tutti i report."""
        if self.request.user.is_manager():
            return Report.objects.all()
        return Report.objects.filter(acquisition__assignment__user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['created_at'] = now()  # Aggiunge la data di creazione

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        acquisition = serializer.validated_data['acquisition']

        # Controllo se l'utente ha diritto
        if not request.user.is_manager and acquisition.assignment.user != request.user:
            return Response({"error": "Non puoi creare un report per un'acquisizione che non è tua."}, status=403)

        # Controllo se esiste già un report per questa acquisition
        if Report.objects.filter(acquisition=acquisition).exists():
            return Response({"error": "Esiste già un report per questa acquisizione."}, status=400)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)





