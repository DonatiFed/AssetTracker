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
    asset_name = serializers.ReadOnlyField(source='asset.name')
    owner_name = serializers.ReadOnlyField(source='owner.first_name')

    class Meta:
        model = Ownership
        fields = '__all__'
