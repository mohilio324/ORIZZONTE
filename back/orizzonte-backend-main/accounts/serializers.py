"""
users/serializers.py

All serializers for the users app.
The existing authentication/ serializers (LogoutSerializer etc.) are untouched.
"""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


# ─────────────────────────────────────────────────────────────
#  Signup — clients only
# ─────────────────────────────────────────────────────────────

class ClientSignUpSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/signup/
    Role is hard-coded to 'client' — the user cannot choose it.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        read_only_fields = ('id',)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.CLIENT,   # ← enforced by backend, not by user input
        )


# ─────────────────────────────────────────────────────────────
#  Employee creation — boss only
# ─────────────────────────────────────────────────────────────

class CreateEmployeeSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/users/employees/
    Only fields the boss provides: username + password.
    Role is hard-coded to 'employee'.
    Email is optional for internal staff.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'},
    )
    email = serializers.EmailField(required=False, default='')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        read_only_fields = ('id',)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )
        return value

    def create(self, validated_data):
        email = validated_data.get('email', '')
        return User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
            role=User.Role.EMPLOYEE,   # ← always employee, never overrideable
        )


# ─────────────────────────────────────────────────────────────
#  Safe user response (no password, no sensitive fields)
# ─────────────────────────────────────────────────────────────

class UserResponseSerializer(serializers.ModelSerializer):
    """Read-only safe representation returned in all API responses."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'date_joined')
        read_only_fields = fields


class EmployeeListSerializer(serializers.ModelSerializer):
    """Compact employee list for boss dashboard."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
        read_only_fields = fields


# ─────────────────────────────────────────────────────────────
#  Custom JWT token — embeds role in the login response
# ─────────────────────────────────────────────────────────────

class RoleAwareTokenSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT's default serializer so that POST /api/token/
    returns role + user info alongside the JWT tokens.

    Response shape:
        {
            "id": 1,
            "username": "john",
            "email": "john@example.com",
            "role": "employee",
            "access": "<jwt>",
            "refresh": "<jwt>"
        }
    """

    def validate(self, attrs):
        # Run the standard JWT validation (checks credentials, etc.)
        data = super().validate(attrs)

        # Append user identity + role to the token response
        data['id']       = self.user.id
        data['username'] = self.user.username
        data['email']    = self.user.email
        data['role']     = self.user.role

        return data
