from django.contrib import admin
from .models import JobPosting, JobApplication


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'job_type', 'status', 'created_at']
    list_filter = ['job_type', 'status', 'created_at']
    search_fields = ['title', 'company__company_name', 'location']


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'job', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['student__user__email', 'job__title']
