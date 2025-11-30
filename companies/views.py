from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import CompanyProfile
from .serializers import CompanyProfileSerializer


class CompanyProfileViewSet(viewsets.ModelViewSet):
    queryset = CompanyProfile.objects.all()
    serializer_class = CompanyProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        if self.request.user.user_type == 'company':
            return CompanyProfile.objects.filter(user=self.request.user)
        return CompanyProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """Obtener el perfil de la empresa autenticada"""
        try:
            profile = CompanyProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except CompanyProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_my_profile(self, request):
        """Actualizar el perfil de la empresa autenticada (incluye foto)"""
        try:
            profile = CompanyProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except CompanyProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

