from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import CompanyProfile
from .serializers import CompanyProfileSerializer


class CompanyProfileViewSet(viewsets.ModelViewSet):
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'company':
            return CompanyProfile.objects.filter(user=self.request.user)
        return CompanyProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
