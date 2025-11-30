from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyProfileViewSet

router = DefaultRouter()
router.register(r'profiles', CompanyProfileViewSet, basename='company-profile')

urlpatterns = [
    path('', include(router.urls)),
]
