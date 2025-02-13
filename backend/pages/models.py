from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser
from django.conf import settings


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('manager', 'Manager'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def is_manager(self):
        return self.role == 'manager'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Asset(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    total_quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(default=now, editable=False)


    def available_quantity(self):
        assigned = sum(a.assigned_quantity for a in self.assignments.all())
        return self.total_quantity - assigned

    def __str__(self):
        return f"{self.name} ({self.total_quantity} disponibili)"

class Location(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name



class Assignment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignments")
    asset = models.ForeignKey("Asset", on_delete=models.CASCADE, related_name="assignments")
    assigned_at = models.DateTimeField(default=now)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.asset.name} ({'Attiva' if self.is_active else 'Non attiva'})"



class Acquisition(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="acquisitions")
    quantity = models.PositiveIntegerField()  #in futuroo si dovrà tenere conto di una total_quantity e una available_quantity
    acquired_at = models.DateTimeField(default=now)
    is_active = models.BooleanField(default=True)  # Indica se l'asset è ancora in uso
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="acquisitions")

    def __str__(self):
        return f"{self.quantity} x {self.assignment.asset.name} - {self.assignment.user.username} @ {self.location.name if self.location else 'N/A'}"

class Report(models.Model):
    acquisition = models.ForeignKey("Acquisition", on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(default=now)

    def __str__(self):
        return f"Report: {self.title} - {self.acquisition.assignment.asset.name} ({self.acquisition.assignment.user.first_name})"