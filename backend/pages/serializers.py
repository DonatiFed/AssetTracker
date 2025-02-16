from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Asset, Location, Assignment, Acquisition, Report,CustomUser
from django.db.models import Sum
# Recupera il modello CustomUser

User = get_user_model()

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role']

# Serializer per la registrazione degli utenti
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'password']

    def create(self, validated_data):
        """Crea un nuovo utente con password cifrata"""
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),  # Default vuoto se non fornito
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', None),
            role=validated_data.get('role', 'user')  # Default a 'user' se non specificato
        )
        user.set_password(validated_data['password'])  # Hash della password
        user.save()
        return user


# Serializer per la registrazione degli utenti
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'role']

# Serializer per gli asset
class AssetSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'name', 'description', 'total_quantity', 'available_quantity', 'created_at']

    def get_available_quantity(self, obj):
        """Calcola la quantità disponibile sottraendo le acquisizioni attive dalla quantità totale."""
        acquired_quantity = Acquisition.objects.filter(assignment__asset=obj, is_active=True).aggregate(
            total_acquired=Sum('quantity')
        )['total_acquired'] or 0  # Se non ci sono acquisizioni attive, il valore è 0

        return obj.total_quantity - acquired_quantity


# Serializer per le location
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'description']


## Serializer per Assignment
class AssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")
    asset_name = serializers.ReadOnlyField(source="asset.name")
    assigned_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Assignment
        fields = ["id", "user", "user_name", "asset", "asset_name", "is_active", "assigned_at","removed_at"]

    def validate(self, data):
        """ Impedisce più assignment attivi per la stessa coppia user-asset. """
        user = data['user']
        asset = data['asset']
        if Assignment.objects.filter(user=user, asset=asset, is_active=True).exclude(
                id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("Esiste già un assignment attivo per questo utente e asset.")
        return data


## Serializer per Acquisition
class AcquisitionSerializer(serializers.ModelSerializer):
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all())
    location=serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())

    asset_name = serializers.CharField(source='assignment.asset.name', read_only=True)
    user_name = serializers.CharField(source='assignment.user.username', read_only=True)

    class Meta:
        model = Acquisition
        fields = ['id', 'assignment', 'asset_name', 'user_name', 'quantity', 'acquired_at', 'is_active', 'location','removed_at']

    def validate(self, data):
        """ Controlla la validità dell'acquisizione con LOG per debugging. """
        request = self.context.get('request')  # Otteniamo l'utente dalla richiesta
        assignment = data['assignment']
        quantity = data['quantity']
        # Usa il metodo get_available_quantity di AssetSerializer
        asset_serializer = AssetSerializer(assignment.asset)
        available = asset_serializer.get_available_quantity(assignment.asset)

        print(f"🔍 DEBUG: Validazione acquisizione per l'utente {request.user.username}")
        print(f"🔍 DEBUG: Asset assegnato a {assignment.user.username} - Asset: {assignment.asset.name}, Quantità richiesta: {quantity}")

        # 🔹 Se l'utente NON è un manager, può acquisire solo asset assegnati a lui
        if not request.user.is_manager and assignment.user != request.user:
            print(f"❌ ERRORE: {request.user.username} sta cercando di acquisire un asset non assegnato a lui!")
            raise serializers.ValidationError("Non puoi acquisire asset non assegnati a te.")

        # 🔹 Un utente non può avere più acquisizioni attive per lo stesso asset
        if Acquisition.objects.filter(assignment__user=assignment.user, assignment__asset=assignment.asset, is_active=True).exists():
            print(f"❌ ERRORE: {assignment.user.username} ha già un'acquisizione attiva per {assignment.asset.name}!")
            raise serializers.ValidationError("Hai già un'acquisizione attiva per questo asset.")

        # 🔹 Controllo la disponibilità degli asset rispetto a tutte le acquisizioni attive
        if quantity > available:
            raise serializers.ValidationError(f"Quantità non disponibile. Massimo disponibile: {available}.")

        print("✅ DEBUG: Acquisizione valida, procedo con il salvataggio.")
        return data


# Serializer per i report generati dagli utenti
class ReportSerializer(serializers.ModelSerializer):
    acquisition = AcquisitionSerializer(read_only=True)  # Mostra i dettagli dell'acquisizione

    class Meta:
        model = Report
        fields = ['id', 'acquisition', 'title', 'description', 'created_at']




