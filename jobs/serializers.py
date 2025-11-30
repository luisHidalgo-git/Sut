from rest_framework import serializers
from .models import JobPosting, JobApplication
from companies.serializers import CompanyProfileSerializer
from students.serializers import StudentProfileSerializer


class JobPostingSerializer(serializers.ModelSerializer):
    company = CompanyProfileSerializer(read_only=True)
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_applications_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    student = StudentProfileSerializer(read_only=True)
    job = JobPostingSerializer(read_only=True)
    job_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['id', 'applied_at', 'updated_at']

    def validate(self, data):
        request = self.context.get('request')
        if request and hasattr(request.user, 'student_profile'):
            job_id = data.get('job_id')
            if JobApplication.objects.filter(
                student=request.user.student_profile,
                job_id=job_id
            ).exists():
                raise serializers.ValidationError("You have already applied to this job")
        return data
