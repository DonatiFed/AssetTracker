# Generated by Django 5.1.6 on 2025-02-16 02:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0003_remove_asset_updated_at_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignment',
            name='assigned_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
