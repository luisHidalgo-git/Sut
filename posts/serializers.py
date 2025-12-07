from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    image_url = serializers.SerializerMethodField()
    user_profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'user_email', 'user_name', 'user_type', 'content', 'image_url', 'user_profile_picture_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_user_profile_picture_url(self, obj):
        request = self.context.get('request')
        profile_picture = None

        if obj.user.user_type == 'student' and hasattr(obj.user, 'student_profile'):
            profile_picture = obj.user.student_profile.profile_picture
        elif obj.user.user_type == 'company' and hasattr(obj.user, 'company_profile'):
            profile_picture = obj.user.company_profile.profile_picture

        if profile_picture:
            if request:
                return request.build_absolute_uri(profile_picture.url)
            return profile_picture.url
        return None


class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image']
