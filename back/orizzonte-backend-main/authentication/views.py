
"""
Authentication views for the Orizzonte demenagement API.
 
All responses are JSON only — no templates, no render().
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
 
 
# ─────────────────────────────────────────────────────────────
#  Serializers (kept here to keep the file self-contained;
#  move to serializers.py if your project grows)
# ─────────────────────────────────────────────────────────────
 
class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )
    email = serializers.EmailField(required=True)
 
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
 
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value.lower()
 
    def create(self, validated_data):
        # create_user() hashes the password automatically — never plain text
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
 
 
class UserResponseSerializer(serializers.ModelSerializer):
    """Safe serializer — never exposes password or internal fields."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
 
 
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)
 
    def validate_refresh(self, value):
        try:
            token = RefreshToken(value)
            token.check_blacklist()
        except Exception:
            raise serializers.ValidationError(
                "This token is invalid or has already been blacklisted."
            )
        self._token = token
        return value
 
    def save(self, **kwargs):
        self._token.blacklist()
 
 
# ─────────────────────────────────────────────────────────────
#  Views
# ─────────────────────────────────────────────────────────────
 
class SignUpView(APIView):
    """
    POST /api/signup/
 
    Register a new user. Email is required and must be unique.
 
    Request body:
        { "username": "...", "email": "...", "password": "..." }
 
    Success → 201:
        { "message": "Account created successfully.", "user": { ... } }
 
    Failure → 400:
        { "message": "Registration failed.", "errors": { ... } }
    """
    permission_classes = [AllowAny]  # Public — no token required
 
    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
 
        if not serializer.is_valid():
            return Response(
                {
                    "message": "Registration failed. Please check the errors below.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        user = serializer.save()
 
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserResponseSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )
 
 
class LoginView(TokenObtainPairView):
    """
    POST /api/token/
 
    Authenticate and receive JWT tokens.
 
    Request body:
        { "username": "...", "password": "..." }
 
    Success → 200:
        { "access": "<jwt>", "refresh": "<jwt>" }
    """
    permission_classes = [AllowAny]
    # TokenObtainPairView handles all logic — nothing to override
 
 
class LogoutView(APIView):
    """
    POST /api/logout/
 
    Blacklist the provided refresh token. After this call the token
    cannot be used to obtain a new access token.
 
    Header:  Authorization: Bearer <access_token>
    Body:    { "refresh": "<refresh_token>" }
 
    Success → 200:
        { "message": "Logged out successfully." }
    """
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
 
        if not serializer.is_valid():
            return Response(
                {
                    "message": "Logout failed.",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
 
        serializer.save()
 
        return Response(
            {"message": "Logged out successfully. Token has been invalidated."},
            status=status.HTTP_200_OK,
        )
 
 
class ProfileView(APIView):
    """
    GET /api/profile/
 
    Return the authenticated user's safe profile data.
 
    Header: Authorization: Bearer <access_token>
 
    Success → 200:
        { "id": 1, "username": "...", "email": "...", "date_joined": "..." }
    """
    permission_classes = [IsAuthenticated]
 
    def get(self, request):
        return Response(
            UserResponseSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )