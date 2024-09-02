from django.core.validators import EmailValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.fields import empty

from oniria_project.users.models import User



class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            EmailValidator(),
            UniqueValidator(
                queryset=User.objects.all(),
                message="El correo electrónico ya pertenece a una cuenta",
            ),
        ]
    )
    
    bio = serializers.CharField(
        max_length=250,
        allow_blank=True,
        required=False,
        error_messages={
            'max_length': 'La biografía no puede tener más de 250 caracteres',
        }
    )
    
    first_name = serializers.CharField(
        max_length=50,
        allow_blank=True,
        required=False,
        error_messages={
            'max_length': 'El nombre no puede tener más de 50 caracteres',
        }
    )
    
    last_name = serializers.CharField(
        max_length=50,
        allow_blank=True,
        required=False,
        error_messages={
            'max_length': 'El apellido no puede tener más de 50 caracteres',
        }
    )
        
    username = serializers.CharField(
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="Este nombre de usuario no está disponible",
            ),
        ]
    )
    
    date_joined = serializers.DateTimeField(format="%d/%m/%y %H:%M:%S", required=False)
    birthday = serializers.DateField(
        format="%d/%m/%y", required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "password",
            "username",
            "first_name",
            "last_name",
            "date_joined",
            "bio",
            "birthday",
            "location",
            "profile_image"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def update(self, instance, validated_data):
        profile_image = validated_data.get('profile_image', None)
        if profile_image:
            # Deleting the old image is handled by the pre_save signal
            instance.profile_image = profile_image
        return super().update(instance, validated_data)