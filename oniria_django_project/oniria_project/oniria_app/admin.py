from django.contrib import admin
from oniria_app.models import Category, PeopleInvolved, Post


# Register your models here.
admin.site.register(Post)
admin.site.register(Category)
admin.site.register(PeopleInvolved)
