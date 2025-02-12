from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Asset, Location, Assignment, Acquisition, Report

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'role')  # Usa 'role' invece di 'is_manager'
    list_filter = ('role',)
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone_number')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'password1', 'password2'),
        }),
    )

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_quantity', 'created_at', 'updated_at')
    search_fields = ('name',)
    list_filter = ('created_at', 'updated_at')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'description')
    search_fields = ('name', 'address')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'manager', 'asset', 'assigned_quantity', 'assigned_at')
    search_fields = ('user__username', 'manager__username', 'asset__name')
    list_filter = ('assigned_at',)

@admin.register(Acquisition)
class AcquisitionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'quantity', 'location', 'acquired_at', 'is_active')
    search_fields = ('assignment__user__username', 'assignment__asset__name')
    list_filter = ('acquired_at', 'is_active')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'acquisition', 'created_at')
    search_fields = ('title', 'acquisition__assignment__user__username')
    list_filter = ('created_at',)





