from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from .models import User, StudentProfile
from .serializers import UserSerializer, StudentProfileSerializer, UserRegistrationSerializer


class AuthViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'], permission_classes=[AllowAny], authentication_classes=[])
    def register(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Hacer login automático después del registro
            login(request, user)
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], authentication_classes=[])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(request, username=email.lower(), password=password)
        if user:
            if not user.is_active:
                return Response(
                    {'error': 'Esta cuenta ha sido desactivada'},
                    status=status.HTTP_403_FORBIDDEN
                )
            login(request, user)
            return Response({
                'message': 'Inicio de sesión exitoso',
                'user': UserSerializer(user).data
            })
        return Response(
            {'error': 'Credenciales inválidas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            logout(request)
            return Response({'message': 'Sesión cerrada exitosamente'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': 'Error al cerrar sesión'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class StudentProfileViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type == 'student':
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
