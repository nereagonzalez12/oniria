# Generated by Django 4.2.11 on 2024-04-04 17:16

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_profileimage_alter_user_profile_image'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('oniria_app', '0002_image'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Image',
        ),
        migrations.AddField(
            model_name='post',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
