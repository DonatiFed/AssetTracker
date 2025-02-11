from rest_framework import serializers
from .models import Owner, Asset, Ownership,Location,Report

class OwnerSerializer(serializers.ModelSerializer):
    owned_assets_count = serializers.SerializerMethodField()

    class Meta:
        model = Owner
        fields = ['id', 'first_name', 'last_name', 'phone_number', 'email', 'owned_assets_count']  # Aggiunto email

    def get_owned_assets_count(self, obj):
        return obj.ownership_set.count()  # Conta quanti asset possiede il proprietario


class AssetSerializer(serializers.ModelSerializer):
    available_quantity = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'name', 'description', 'quantity', 'available_quantity']

    def get_available_quantity(self, obj):
        assigned = sum(obj.ownership_set.values_list('quantity', flat=True))
        return obj.quantity - assigned  # Restituisce quanti asset sono ancora assegnabili


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class OwnershipSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.first_name', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)

    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    owner = serializers.PrimaryKeyRelatedField(queryset=Owner.objects.all())
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all(), allow_null=True, required=False)


    class Meta:
        model = Ownership
        fields = ['id', 'owner_name', 'asset_name', 'location_name', 'asset', 'owner', 'location', 'date_acquired', 'quantity']

class ReportSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='ownership.owner.first_name', read_only=True)
    asset_name = serializers.CharField(source='ownership.asset.name', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'ownership', 'owner_name', 'asset_name', 'title', 'description', 'created_at']



