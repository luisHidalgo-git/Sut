from rest_framework import serializers
from .models import Post


class PostSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_type = serializers.CharField(source='user.user_type', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'user_email', 'user_name', 'user_type', 'content', 'image_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class CreatePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image_url']
