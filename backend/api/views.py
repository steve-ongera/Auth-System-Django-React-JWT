from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint. Creates a user with a securely hashed password
    and returns the new profile (no tokens — the user logs in next).
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {"user": UserSerializer(user).data, "message": "Account created. Please log in."},
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends the default JWT serializer to also return the user's profile."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/  { "email": "...", "password": "..." }
    Public endpoint. On success returns { access, refresh, user }.
    Simplejwt verifies the password with check_password() under the hood —
    constant-time comparison against the stored PBKDF2 hash.
    """

    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    """
    POST /api/auth/logout/  { "refresh": "<refresh token>" }
    Protected endpoint. Blacklists the refresh token so it can no longer
    be used to mint new access tokens (requires the token_blacklist app;
    see README for the one-line settings addition if you enable it).
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (KeyError, TokenError):
            return Response(
                {"detail": "A valid 'refresh' token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
    """
    GET/PATCH /api/auth/me/
    Protected route — this is the one that proves the JWT auth chain
    works end to end. DRF's JWTAuthentication class reads the
    `Authorization: Bearer <access>` header, verifies the signature +
    expiry, and attaches request.user before this view ever runs.
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
