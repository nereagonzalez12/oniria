from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


def validate_not_future_date(value):
    if value > timezone.now().date():
        raise ValidationError(_("La fecha del sueño no puede ser futura"))

def validate_username(username):
    # username = request.GET.get('username', None)
    if User.objects.filter(username=username).exists():
        print('nombre de usuario existe')
    else:
        raise ValidationError(_("El nombre de usuario no existe"))
