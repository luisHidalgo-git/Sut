from rest_framework import serializers
from .models import CompanyProfile
from students.serializers import UserSerializer


class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']
