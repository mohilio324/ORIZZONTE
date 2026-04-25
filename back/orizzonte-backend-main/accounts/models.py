"""
users/models.py

Custom user model that extends Django's AbstractUser.
Adds a `role` field for RBAC: boss / employee / client.

⚠️  MIGRATION STEPS (one-time, run in order):
    1. Add 'users' to INSTALLED_APPS
    2. Add AUTH_USER_MODEL = 'users.User' to settings.py
    3. Delete existing db.sqlite3 (first run only — no prod data yet)
    4. python manage.py makemigrations users
    5. python manage.py migrate
    6. python manage.py createsuperuser   ← then set role='boss' in admin
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BOSS     = 'boss',     'Boss'
        EMPLOYEE = 'employee', 'Employee'
        CLIENT   = 'client',  'Client'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CLIENT,   # safest default — least privilege
    )

    # Make email required and unique (signup already validates this,
    # but the DB constraint is the real safety net)
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    # ── Convenience properties used in permission classes ──────
    @property
    def is_boss(self):
        return self.role == self.Role.BOSS

    @property
    def is_employee(self):
        return self.role == self.Role.EMPLOYEE

    @property
    def is_client(self):
        return self.role == self.Role.CLIENT


# Create your models here.
