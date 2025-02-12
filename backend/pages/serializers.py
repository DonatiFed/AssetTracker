from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Asset, Location, Assignment, Acquisition, Report,CustomUser

# Recupera il modello CustomUser



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role']

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

# Serializer per le assegnazioni degli asset agli utenti
class AssignmentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Mostra il nome utente invece dell'ID
    manager = serializers.StringRelatedField()
    asset = serializers.StringRelatedField()

    class Meta:
        model = Assignment
        fields = ['id', 'user', 'manager', 'asset', 'assigned_quantity', 'assigned_at']

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




