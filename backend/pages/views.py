from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from django.db.models import Sum, Exists, OuterRef, Prefetch
from django.utils.timezone import now

from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from .models import Asset, Location, Assignment, Acquisition, Report, CustomUser
from .serializers import (
    AssetSerializer, LocationSerializer, AssignmentSerializer,
    AcquisitionSerializer, ReportSerializer, UserSerializer, CustomUserSerializer, RegisterSerializer
)
from django.contrib.auth import get_user_model
from .permissions import IsManager, IsOwnerOrManager
from rest_framework_simplejwt.tokens import RefreshToken


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer

    def get_permissions(self):
        if self.action == 'list':  # GET /users/
            permission_classes = [IsAuthenticated,
                                  IsManager]  # solo i manager possono vedere tutti gli utenti,mentre gli user possono vedere solo il proprio profilo
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


class RegisterView(generics.CreateAPIView):  # api per registrazione di un nuovo utente
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # anche chi non ha autenticazione si deve poter registrare(anzi solo loro)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # si genera token per utente registrato
            refresh = RefreshToken.for_user(user)

            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "access": str(refresh.access_token),  # Token di accesso
                "refresh": str(refresh),  # Token di refresh
                "role": user.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.user.is_manager():
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def create(self, serializer):
        if not self.request.user.is_manager():
            return Response({"error": "Non hai i permessi per creare un utente"}, status=403)
        serializer.save()

    def update(self, serializer):
        if not self.request.user.is_manager():
            return Response({"error": "Non hai i permessi per modificare questo utente"}, status=403)
        serializer.save()


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
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if self.request.user.is_authenticated and self.request.user.is_manager():
                return [permissions.IsAuthenticated()]
            else:
                self.permission_denied(self.request, message="Solo i manager possono modificare le location.")
        return [permissions.IsAuthenticated()]


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.none()  # evita che Django usi un queryset globale
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_manager = user.is_manager if isinstance(user.is_manager,
                                                   bool) else user.is_manager()  # si controlla che is_manager sia definito

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


class AcquisitionViewSet(viewsets.ModelViewSet):
    queryset = Acquisition.objects.select_related('assignment__asset').all()
    serializer_class = AcquisitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_manager():
            return Acquisition.objects.select_related('assignment__asset')
        return Acquisition.objects.select_related('assignment__asset').filter(
            assignment__user=self.request.user
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        acquisition = serializer.save()
        serializer.save()
        return Response(AcquisitionSerializer(acquisition).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):  # si modifica solo la quantità
        instance = self.get_object()

        if not request.user.is_manager and (instance.assignment.user != request.user or not instance.is_active):
            return Response({"error": "Non puoi modificare questa acquisizione."}, status=status.HTTP_403_FORBIDDEN)

        new_quantity = request.data.get("quantity")
        if new_quantity is None:
            return Response({"error": "Il campo 'quantity' è richiesto."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_quantity = int(new_quantity)
        except ValueError:
            return Response({"error": "La quantità deve essere un numero intero valido."},
                            status=status.HTTP_400_BAD_REQUEST)

        asset_serializer = AssetSerializer(instance.assignment.asset)
        available_quantity = asset_serializer.get_available_quantity(instance.assignment.asset)

        if new_quantity > available_quantity + instance.quantity:
            return Response({
                "error": f"Quantità non disponibile. Massimo disponibile: {available_quantity + instance.quantity}."},
                status=status.HTTP_400_BAD_REQUEST)

        instance.quantity = new_quantity
        instance.save()

        return Response(AcquisitionSerializer(instance).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        acquisition = self.get_object()
        acquisition.is_active = False
        acquisition.removed_at = now()
        acquisition.save()
        return Response(AcquisitionSerializer(acquisition).data)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.none()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_manager():
            return Report.objects.all()
        return Report.objects.filter(acquisition__assignment__user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['created_at'] = now()

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        acquisition = serializer.validated_data['acquisition']

        if not request.user.is_manager and acquisition.assignment.user != request.user:
            return Response({"error": "Non puoi creare un report per un'acquisizione che non è tua."}, status=403)

        if Report.objects.filter(acquisition=acquisition).exists():
            return Response({"error": "Esiste già un report per questa acquisizione."}, status=400)

        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
