"""
Serializers for the authentication app.
Handles validation and transformation of user data for the API.
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


class SignUpSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    - Enforces email as required
    - Validates password strength using Django's built-in validators
    - Hashes password securely before saving
    """
    password = serializers.CharField(
        write_only=True,          # Never expose password in responses
        required=True,
        validators=[validate_password],  # Runs all AUTH_PASSWORD_VALIDATORS
        style={'input_type': 'password'},
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        read_only_fields = ('id',)

    def validate_email(self, value):
        """Ensure email is unique across all users."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        """Ensure username is unique (case-insensitive check)."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def create(self, validated_data):
        """
        Create user using Django's create_user() which:
        - Hashes the password automatically via set_password()
        - Never stores plain-text passwords
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class UserResponseSerializer(serializers.ModelSerializer):
    """
    Safe serializer for returning user data in responses.
    Deliberately excludes sensitive fields (password, etc.).
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
        read_only_fields = fields


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout endpoint.
    Expects the refresh token to be blacklisted.
    """
    refresh = serializers.CharField(
        required=True,
        help_text="The refresh token to invalidate.",
    )

    def validate_refresh(self, value):
        """
        Validate that the provided string is a real, non-blacklisted refresh token.
        Raises a 400 error with a clear message if token is invalid or already used.
        """
        try:
            token = RefreshToken(value)
            # Check it's not already blacklisted (simplejwt raises if it is)
            token.check_blacklist()
        except Exception:
            raise serializers.ValidationError(
                "This token is invalid or has already been blacklisted."
            )
        self._token = token
        return value

    def save(self, **kwargs):
        """Blacklist the validated refresh token."""
        self._token.blacklist()
