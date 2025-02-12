from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Asset, Location, Assignment, Acquisition, Report,CustomUser

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
    class Meta:
        model = Asset
        fields = ['id', 'name', 'description', 'total_quantity', 'created_at', 'updated_at']

# Serializer per le location
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'description']


class AssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")
    asset_name = serializers.ReadOnlyField(source="asset.name")

    class Meta:
        model = Assignment
        fields = ["id", "user", "user_name", "asset", "asset_name", "assigned_quantity", "assigned_at"]

# Serializer per le acquisizioni di asset dagli utenti
class AcquisitionSerializer(serializers.ModelSerializer):
    assignment = AssignmentSerializer(read_only=True)  # Mostra i dettagli dell'assegnazione
    location = serializers.StringRelatedField()  # Mostra il nome della location

    class Meta:
        model = Acquisition
        fields = ['id', 'assignment', 'quantity', 'acquired_at', 'is_active', 'location']

# Serializer per i report generati dagli utenti
class ReportSerializer(serializers.ModelSerializer):
    acquisition = AcquisitionSerializer(read_only=True)  # Mostra i dettagli dell'acquisizione

    class Meta:
        model = Report
        fields = ['id', 'acquisition', 'title', 'description', 'created_at']




