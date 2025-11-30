from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import JobPosting, JobApplication
from .serializers import JobPostingSerializer, JobApplicationSerializer


class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.filter(status='active')
    serializer_class = JobPostingSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = JobPosting.objects.all()

        if self.request.user.is_authenticated and self.request.user.user_type == 'company':
            return queryset.filter(company__user=self.request.user)

        return queryset.filter(status='active')

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'company_profile'):
            serializer.save(company=self.request.user.company_profile)
        else:
            raise PermissionError("Only companies can create job postings")

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        job = self.get_object()
        if request.user.user_type != 'company' or job.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        applications = job.applications.all()
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return JobApplication.objects.filter(student__user=self.request.user)
        elif self.request.user.user_type == 'company':
            return JobApplication.objects.filter(job__company__user=self.request.user)
        return JobApplication.objects.all()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'student_profile'):
            job_id = self.request.data.get('job_id')
            job = JobPosting.objects.get(id=job_id)
            serializer.save(student=self.request.user.student_profile, job=job)
        else:
            raise PermissionError("Only students can apply to jobs")

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        application = self.get_object()
        if request.user.user_type != 'company' or application.job.company.user != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if new_status in dict(JobApplication.STATUS_CHOICES):
            application.status = new_status
            application.save()
            return Response(JobApplicationSerializer(application).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
