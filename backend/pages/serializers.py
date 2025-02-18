from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Asset, Location, Assignment, Acquisition, Report, CustomUser
from django.db.models import Sum
from django.contrib.auth.models import User

# recupero il modello CustomUser
User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='phone_number')  # devo aggiungere il campo phone

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'role']


# Serializer per la registrazione degli utenti(in Register.js)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'password']

    def create(self, validated_data):
        # si crea un nuovo utente con la password immessa
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),  # di default è vuoto
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', '-'),
            role='user'

        )
        user.set_password(validated_data['password'])  # hash della pw
        user.save()
        return user


# Serializer per la creazione degli utenti (in Users.js)
class UserSerializer(serializers.ModelSerializer):
    is_manager = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'phone', 'is_manager']

    def create(self, validated_data):
        is_manager = validated_data.pop('is_manager', False)
        user = User.objects.create_user(**validated_data)
        user.is_manager = is_manager
        user.save()
        return user

    def update(self, instance, validated_data):
        is_manager = validated_data.pop('is_manager', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if is_manager is not None:
            instance.is_manager = is_manager
        instance.save()
        return instance


# Serializer per gli asset
class AssetSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'name', 'description', 'total_quantity', 'available_quantity', 'created_at']

    def get_available_quantity(self, obj):
        acquired_quantity = Acquisition.objects.filter(assignment__asset=obj, is_active=True).aggregate(
            # si sottraggono le acquisizioni attive alla quantità totale
            total_acquired=Sum('quantity')
        )['total_acquired'] or 0  # se non ci sono acquisizioni attive si sottrae 0

        return obj.total_quantity - acquired_quantity


# Serializer per le location
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'address', 'description']


# Serializer per Assignment
class AssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source="user.username")
    asset_name = serializers.ReadOnlyField(source="asset.name")
    assigned_at = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Assignment
        fields = ["id", "user", "user_name", "asset", "asset_name", "is_active", "assigned_at", "removed_at"]

    def validate(self, data):
        user = data['user']
        asset = data['asset']
        if Assignment.objects.filter(user=user, asset=asset, is_active=True).exclude(
                id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError(
                "Esiste già un assignment attivo per questo utente e asset.")  # si impedisce molteplice assegnamento per coppia user-asset
        return data


# Serializer per Acquisition
class AcquisitionSerializer(serializers.ModelSerializer):
    assignment = serializers.PrimaryKeyRelatedField(queryset=Assignment.objects.all())
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())

    asset_name = serializers.CharField(source='assignment.asset.name', read_only=True)
    user_name = serializers.CharField(source='assignment.user.username', read_only=True)

    class Meta:
        model = Acquisition
        fields = ['id', 'assignment', 'asset_name', 'user_name', 'quantity', 'acquired_at', 'is_active', 'location',
                  'removed_at']

    def validate(self, data):
        request = self.context.get('request')
        assignment = data['assignment']
        quantity = data['quantity']
        asset_serializer = AssetSerializer(assignment.asset)
        available = asset_serializer.get_available_quantity(assignment.asset)

        if not request.user.is_manager and assignment.user != request.user:  # Se l'utente NON è un manager, può acquisire solo asset assegnati a lui
            raise serializers.ValidationError("Non puoi acquisire asset non assegnati a te.")

        if Acquisition.objects.filter(assignment__user=assignment.user, assignment__asset=assignment.asset,
                                      is_active=True).exists():  # Un utente non può avere più acquisizioni attive per lo stesso asset(al massimo modifica la quantità)
            raise serializers.ValidationError("Hai già un'acquisizione attiva per questo asset.")

        if quantity > available:  # controllo la disponibilità degli asset rispetto a tutte le acquisizioni attive
            raise serializers.ValidationError(f"Quantità non disponibile. Massimo disponibile: {available}.")

        return data


# Serializer per i report generati dagli utenti
class ReportSerializer(serializers.ModelSerializer):
    acquisition = serializers.PrimaryKeyRelatedField(queryset=Acquisition.objects.all())

    class Meta:
        model = Report
        fields = ['id', 'acquisition', 'title', 'description', 'created_at']
