from django.contrib import admin
from .models import Owner, Asset, Ownership

admin.site.register(Owner)
admin.site.register(Asset)
admin.site.register(Ownership)
