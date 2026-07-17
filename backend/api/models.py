from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model.

    We keep Django's built-in `username` field (needed by AbstractUser /
    the admin) but make `email` unique and use it as the field people
    actually log in with. Password hashing is handled entirely by
    Django's auth system (PBKDF2 by default) — we never touch raw
    passwords ourselves; see UserSerializer.create() which calls
    `set_password()` instead of saving the plaintext value.
    """

    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
