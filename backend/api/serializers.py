from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Safe, read-only representation of a user (never exposes the password hash)."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "created_at"]
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles signup. `password` is write_only so it never round-trips back
    to the client, and it's validated against Django's password validators
    (min length, not too common, not all-numeric, etc.) before being hashed.
    """

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        # set_password() runs the password through Django's PBKDF2 hasher —
        # the raw password is never stored or logged.
        user.set_password(password)
        user.save()
        return user
