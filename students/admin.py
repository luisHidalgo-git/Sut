from django.contrib import admin
from .models import User, StudentProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'user_type', 'is_active', 'date_joined']
    list_filter = ['user_type', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'university', 'career', 'semester']
    list_filter = ['university', 'career']
    search_fields = ['user__email', 'university', 'career']
