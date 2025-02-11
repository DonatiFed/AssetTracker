from django.contrib import admin
from .models import Owner, Asset, Ownership,Location,Report

admin.site.register(Owner)
admin.site.register(Asset)
admin.site.register(Ownership)
admin.site.register(Location)
admin.site.register(Report)
