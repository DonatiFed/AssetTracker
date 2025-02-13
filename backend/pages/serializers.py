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

    class Meta:
        model = Assignment
        fields = ["id", "user", "user_name", "asset", "asset_name", "is_active", "assigned_at"]

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
        fields = ['id', 'assignment', 'asset_name', 'user_name', 'quantity', 'acquired_at', 'is_active', 'location']

    def create(self, validated_data):
        print("Creazione acquisizione con dati:", validated_data)  # DEBUG
        acquisition = Acquisition.objects.create(**validated_data)
        acquisition.save()  # FORZA IL SALVATAGGIO
        return acquisition

    def validate(self, data):
        """ Impedisce più acquisition attive per lo stesso assignment e controlla la quantità disponibile."""
        assignment = data['assignment']
        quantity = data['quantity']

        if Acquisition.objects.filter(
            assignment=assignment,
            is_active=True
        ).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("Esiste già un'acquisition attiva per questo assignment.")

        acquired_total = Acquisition.objects.filter(
            assignment=assignment, is_active=True
        ).aggregate(total_acquired=Sum('quantity'))['total_acquired'] or 0

        available = assignment.asset.total_quantity - acquired_total
        if quantity > available:
            raise serializers.ValidationError(f"Quantità non disponibile. Massimo disponibile: {available}.")

        return data


# Serializer per i report generati dagli utenti
class ReportSerializer(serializers.ModelSerializer):
    acquisition = AcquisitionSerializer(read_only=True)  # Mostra i dettagli dell'acquisizione

    class Meta:
        model = Report
        fields = ['id', 'acquisition', 'title', 'description', 'created_at']




