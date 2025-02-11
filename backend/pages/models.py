from django.db import models

class Owner(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15, unique=True)
    email = models.EmailField(blank=True, null=True, default="-")  # Nuovo campo email non obbligatorio

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    def get_owned_assets_count(self):
        return self.ownership_set.count()  # Conta quanti oggetti possiede il proprietario

class Asset(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=1)  # Nuovo campo quantità

    def __str__(self):
        return self.name

class Location(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Ownership(models.Model):  # Storico proprietà e quantità
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE)  # Se l'Asset viene cancellato, cancelliamo anche la proprietà
    owner = models.ForeignKey(Owner, on_delete=models.CASCADE)  # Se il Proprietario viene cancellato, cancelliamo il record
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)  # Se una location viene cancellata, i record Ownership non vengono cancellati, ma la location sarà NULL
    date_acquired = models.DateField()
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        loc = f" at {self.location}" if self.location else ""
        return f"{self.owner} owns {self.quantity} x {self.asset.name}{loc} since {self.date_acquired}"

class Report(models.Model):
    ownership = models.ForeignKey(Ownership, on_delete=models.CASCADE)  # Collegato direttamente all'Ownership
    title = models.CharField(max_length=200)  # Titolo del report
    description = models.TextField(blank=True, null=True)  # Dettagli
    created_at = models.DateTimeField(auto_now_add=True)  # Data creazione

    def __str__(self):
        return f"Report: {self.title} ({self.ownership.owner} - {self.ownership.asset})"