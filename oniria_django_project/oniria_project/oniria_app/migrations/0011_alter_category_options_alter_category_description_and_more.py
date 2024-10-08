# Generated by Django 4.2.11 on 2024-04-22 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oniria_app', '0010_alter_category_description'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['-is_default'], 'verbose_name_plural': 'Categories'},
        ),
        migrations.AlterField(
            model_name='category',
            name='description',
            field=models.CharField(blank=True, max_length=455, null=True),
        ),
        migrations.AlterField(
            model_name='category',
            name='name',
            field=models.CharField(max_length=30),
        ),
    ]
