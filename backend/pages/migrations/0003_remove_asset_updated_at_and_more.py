# Generated by Django 5.1.6 on 2025-02-13 11:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0002_remove_assignment_manager_assignment_is_active'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='asset',
            name='updated_at',
        ),
        migrations.RemoveField(
            model_name='assignment',
            name='assigned_quantity',
        ),
    ]
