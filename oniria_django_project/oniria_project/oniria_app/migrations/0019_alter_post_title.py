# Generated by Django 4.2.11 on 2024-06-11 16:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oniria_app', '0018_comment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='title',
            field=models.CharField(max_length=60, verbose_name='Título'),
        ),
    ]
