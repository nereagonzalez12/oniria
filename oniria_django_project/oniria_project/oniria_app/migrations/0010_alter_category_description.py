# Generated by Django 4.2.11 on 2024-04-11 16:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oniria_app', '0009_remove_post_category_remove_post_people_involved_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='description',
            field=models.CharField(max_length=455),
        ),
    ]
