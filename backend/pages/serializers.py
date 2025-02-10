from rest_framework import serializers
from .models import Owner, Asset, Ownership

class OwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Owner
        fields = '__all__'

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class OwnershipSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.first_name', read_only=True)
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all())
    owner = serializers.PrimaryKeyRelatedField(queryset=Owner.objects.all())

    class Meta:
        model = Ownership
        fields = ['id', 'owner_name', 'asset_name', 'asset', 'owner', 'date_acquired', 'quantity']

