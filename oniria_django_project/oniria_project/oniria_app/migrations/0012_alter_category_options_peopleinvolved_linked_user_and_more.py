# Generated by Django 4.2.11 on 2024-05-06 16:28

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('oniria_app', '0011_alter_category_options_alter_category_description_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['-is_default', 'name'], 'verbose_name_plural': 'Categories'},
        ),
        migrations.AddField(
            model_name='peopleinvolved',
            name='linked_user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='linked_people', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='peopleinvolved',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_owner', to=settings.AUTH_USER_MODEL),
        ),
    ]
