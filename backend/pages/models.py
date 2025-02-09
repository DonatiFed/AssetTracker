from django.db import models

class Owner(models.Model):  # Tabella Proprietari
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, unique=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Asset(models.Model):  # Tabella Asset
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Ownership(models.Model):  # Storico proprietà e quantità
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)  # Se l'Asset viene cancellato, cancelliamo anche la proprietà
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)  # Se il Proprietario viene cancellato, cancelliamo il record
    date_acquired = models.DateField()
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.owner} owns {self.quantity} x {self.asset.name} since {self.date_acquired}"
