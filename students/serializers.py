from rest_framework import serializers
from .models import User, StudentProfile
from companies.models import CompanyProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'user_type', 'phone', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    university = serializers.CharField(required=False, write_only=True)
    career = serializers.CharField(required=False, write_only=True)
    semester = serializers.IntegerField(required=False, write_only=True)
    graduation_year = serializers.IntegerField(required=False, write_only=True)

    company_name = serializers.CharField(required=False, write_only=True)
    industry = serializers.CharField(required=False, write_only=True)
    description = serializers.CharField(required=False, write_only=True)
    address = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'user_type', 'phone', 'university', 'career', 'semester', 'graduation_year',
            'company_name', 'industry', 'description', 'address'
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        return value.lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})

        user_type = data.get('user_type')

        if user_type == 'student':
            required_fields = ['university', 'career', 'semester', 'graduation_year']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                raise serializers.ValidationError({
                    "student_profile": f"Los campos {', '.join(missing_fields)} son requeridos para estudiantes"
                })

        elif user_type == 'company':
            required_fields = ['company_name', 'industry', 'description', 'address']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                raise serializers.ValidationError({
                    "company_profile": f"Los campos {', '.join(missing_fields)} son requeridos para empresas"
                })

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user_type = validated_data.get('user_type')

        student_data = {
            'university': validated_data.pop('university', None),
            'career': validated_data.pop('career', None),
            'semester': validated_data.pop('semester', None),
            'graduation_year': validated_data.pop('graduation_year', None),
        }

        company_data = {
            'company_name': validated_data.pop('company_name', None),
            'industry': validated_data.pop('industry', None),
            'description': validated_data.pop('description', None),
            'address': validated_data.pop('address', None),
        }

        user = User.objects.create_user(**validated_data)

        if user_type == 'student' and all(student_data.values()):
            StudentProfile.objects.create(user=user, **student_data)

        elif user_type == 'company' and all(company_data.values()):
            CompanyProfile.objects.create(user=user, **company_data)

        return user
