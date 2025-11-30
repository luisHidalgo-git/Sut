from django.contrib import admin
from .models import CompanyProfile


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'industry', 'is_verified']
    list_filter = ['industry', 'is_verified']
    search_fields = ['company_name', 'user__email']
