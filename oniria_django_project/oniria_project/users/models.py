from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from friendship.models import Friend, Follow, Block
from django.db.models.signals import pre_save
from django.dispatch import receiver

def upload_path(instance, filename):
    return '/'.join(['profile-image', str(instance.username), filename])

# USUARIO
class User(AbstractUser):
    """
    Modelo de usuario predeterminado para Oniria
    """

    # Campos básicos de usuario proporcionados por AbstractUser
    email = models.EmailField(_("email address"), unique=True)
    date_joined = models.DateTimeField(_("date joined"), default=now, editable=False)

    # Campos adicionales específicos del perfil
    first_name = models.CharField(_("first name"), blank=True, max_length=50)
    last_name = models.CharField(_("last name"), blank=True, max_length=50)
    bio = models.TextField(_("bio"), blank=True, null=True, max_length=250)
    birthday = models.DateField(blank=True, null=True)
    location = models.CharField(_("location"), max_length=100, blank=True)
    profile_image = models.ImageField(blank=True, null=True, upload_to=upload_path)


    class Meta:
        app_label = "users"

    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})
    
    def get_followers(self):
        return Follow.objects.followers(self)

    def get_following(self):
        return Follow.objects.following(self)
    

@receiver(pre_save, sender=User)
def delete_old_profile_image(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_image = User.objects.get(pk=instance.pk).profile_image
        except User.DoesNotExist:
            return
        if old_image and old_image != instance.profile_image:
            old_image.delete(save=False)