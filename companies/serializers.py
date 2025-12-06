from rest_framework import serializers
from .models import CompanyProfile
from students.serializers import UserSerializer


class CompanyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = CompanyProfile
        fields = '__all__'
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None
