from django.db import models
from django.utils.translation import gettext as _
from django.utils import timezone

from oniria_project.oniria_app.validators import validate_not_future_date
from oniria_project.users.models import User


# PERSONAS INVOLUCRADAS
class PeopleInvolved(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='user_owner')
    linked_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_people')

    def __str__(self):
        return self.name

    class Meta:
        app_label = "oniria_app"
        ordering = ["name"]
        verbose_name_plural = "People Involved"


# CATEGORÍA
class Category(models.Model):
    name = models.CharField(max_length=30)
    description = models.CharField(max_length=455, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        app_label = "oniria_app"
        ordering = [
            "-is_default",
            "name",
        ]  # Ordenar primero por is_default, luego por nombre
        verbose_name_plural = "Categories"


# POSTS
class Post(models.Model):
    privacy_choices = [
        ("public", "Público"),
        ("private", "Privado"),
        ("friends", "Solo amigos"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ManyToManyField(Category, blank=True)
    people_involved = models.ManyToManyField(PeopleInvolved, blank=True)
    title = models.CharField(_("Título"), max_length=60)
    content = models.TextField(_("Contenido"))
    dream_date = models.DateField(
        _("Fecha del Sueño"), validators=[validate_not_future_date]
    )
    post_date = models.DateTimeField(_("Fecha de Publicación"), auto_now_add=True)
    public_date = models.DateTimeField(_("Fecha de Publicación Pública"), null=True, blank=True)
    privacy = models.CharField(
        _("Privacidad"), choices=privacy_choices, default="private", max_length=10
    )

    def save(self, *args, **kwargs):
        if self.privacy == 'public' or self.privacy == 'friends' and self.public_date is None:
            self.public_date = timezone.now()
        elif self.privacy == 'private' and self.public_date is not None:
            self.public_date = None
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.title} [{self.post_date}]"

    class Meta:
        app_label = "oniria_app"
        ordering = ["-post_date"]  # Orden descendente


# LIKES
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']  # Un usuario solo puede dar like una vez a una publicación
        
        
# COMMENTS
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE) # El comentario pertenece a un post
    user = models.ForeignKey(User, on_delete=models.CASCADE) # El usuario que realizó el comentario
    content = models.TextField() # Contenido del comentario
    created_at = models.DateTimeField(auto_now_add=True) # Fecha de creación del comentario

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"