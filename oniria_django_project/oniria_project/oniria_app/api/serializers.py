from oniria_app.models import Category, PeopleInvolved, Post, Like, Comment
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from oniria_project.users.models import User



# CATEGORY SERIALIZER
class CategorySerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        default=serializers.CurrentUserDefault(), read_only=True
    )

    class Meta:
        model = Category
        fields = ["id", "name", "description", "user", "is_default"]
        read_only_fields = ["user"]


# PEOPLEINVOLVED SERIALIZER
class PeopleInvolvedSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        default=serializers.CurrentUserDefault(), read_only=True
    )
    linked_username = serializers.CharField(required=False)
    

    class Meta:
        model = PeopleInvolved
        fields = ["id", "name", "user", "linked_user", "linked_username"]
        read_only_fields = ["user"]

    def validate_linked_username(self, value):
        print(value)
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("El nombre de usuario no existe.")
        return value
    
    def validate(self, data):
        user = self.context['request'].user
        linked_username = data.get('linked_username')
        # Verificar si linked_user no es None y si ya existe una persona involucrada vinculada al mismo usuario propietario
        if linked_username and PeopleInvolved.objects.filter(user=user, linked_user__username=linked_username).exists():
            raise serializers.ValidationError("Ya existe un intruso vinculado a este usuario.")
        
        return data

    def create(self, validated_data):
        linked_username = validated_data.pop('linked_username', None)
        if linked_username:
            validated_data['linked_user'] = User.objects.get(username=linked_username)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        linked_username = validated_data.pop('linked_username', None)
        if linked_username:
            validated_data['linked_user'] = User.objects.get(username=linked_username)
        return super().update(instance, validated_data)

# POST SERIALIZER
class PostSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        default=serializers.CurrentUserDefault(), read_only=True
    )
    
    title = serializers.CharField()

    class Meta:
        model = Post
        fields = [
            "id",
            "user",
            "category",
            "people_involved",
            "title",
            "content",
            "post_date",
            "dream_date",
            "public_date",
            "privacy",
        ]
        read_only_fields = ["user"]
    
    # def validate_title(self, value):
    #     user = self.context['request'].user
    #     if Post.objects.filter(user=user, title=value).exists():
    #         raise serializers.ValidationError("Ya tienes un sueño con ese título")
    #     return value

# LIKES SERIALIZER
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
        
# COMMENT SERIALIZER
class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'post']
        
    def create(self, validated_data):
        return Comment.objects.create(**validated_data)