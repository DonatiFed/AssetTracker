from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Asset, Location, Assignment, Acquisition, Report
from django.db.models import Sum, Exists, OuterRef


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
            'fields': (
            'username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'password1', 'password2'),
        }),
    )


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'total_quantity', 'created_at', 'available_quantity')
    search_fields = ('name',)
    list_filter = ('created_at',)
    readonly_fields = ('available_quantity',)

    def available_quantity(self, obj):
        """Calcola la quantità disponibile in base alle acquisizioni attive."""
        acquired_quantity = Acquisition.objects.filter(
            assignment__asset=obj,
            is_active=True
        ).aggregate(total_acquired=Sum('quantity'))['total_acquired'] or 0

        return obj.total_quantity - acquired_quantity

    available_quantity.short_description = "Quantità Disponibile"


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'description')
    search_fields = ('name', 'address')


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'asset', 'is_active', 'assigned_at')
    list_filter = ('is_active', 'asset')
    search_fields = ('user__username', 'asset__name')
    ordering = ('-assigned_at',)
    actions = ['mark_as_inactive']

    def mark_as_inactive(self, request, queryset):
        """Segna gli assignments selezionati come inattivi (soft delete)."""
        queryset.update(is_active=False)

    mark_as_inactive.short_description = "Segna come inattivi"


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
