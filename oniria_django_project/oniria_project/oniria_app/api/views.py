from datetime import date
from rest_framework.decorators import action
import rest_framework
from django.db.models import Q
from oniria_app.api.serializers import (
    CategorySerializer,
    PeopleInvolvedSerializer,
    PostSerializer,
    LikeSerializer, 
    CommentSerializer
)
from oniria_app.models import Category, PeopleInvolved, Post, Like, Comment
from rest_framework import permissions, status, viewsets, filters
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from friendship.models import Friend, Follow, FriendshipRequest
from oniria_project.oniria_app.permissions import IsOwnerOrReadOnly
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

class PostViewSet(viewsets.ModelViewSet):
    """
    Este ViewSet proporciona automáticamente `listar`, `crear`, `recuperar`,
    acciones de `actualizar` y `destruir`.
    """

    serializer_class = PostSerializer
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    queryset = Post.objects.all()
    basename = "post"

    # Filtros
    filterset_fields = ["category", "people_involved"]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Devuelve solo los posts del usuario autenticado
        return Post.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        if 'search' in request.query_params:
            search_text = request.query_params['search']
            queryset = queryset.filter(Q(title__icontains=search_text) | Q(content__icontains=search_text))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Si se cambia la privacidad a privada, anula la fecha de publicación
        if 'privacy' in request.data and request.data['privacy'] == 'private':
            instance.public_date = None

        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def filter_by_categories(self, request):
        if 'categories' in request.query_params:
            category_ids = request.query_params['categories'].split(',')

            # Filtrar los posts del usuario actual que contienen todas las categorías seleccionadas
            queryset = Post.objects.filter(user=self.request.user)
            for category_id in category_ids:
                queryset = queryset.filter(category__id=category_id)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"message": "No categories provided"}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=False, methods=['get'])
    def filter_by_people_involved(self, request):
        if 'people-involved' in request.query_params:
            people_ids = request.query_params['people-involved'].split(',')

            # Filtrar los posts del usuario actual que contienen todas las personas involucradas seleccionadas
            queryset = Post.objects.filter(user=self.request.user)
            for people_id in people_ids:
                queryset = queryset.filter(people_involved__id=people_id)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        else:
            return Response({"message": "No people provided"}, status=status.HTTP_400_BAD_REQUEST)

    # filtro de post por categoría públicos
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_posts(self, request):
        queryset = Post.objects.filter(privacy='public').order_by('-public_date')
        
        if 'search' in request.query_params:
            search_text = request.query_params['search']
            queryset = queryset.filter(Q(title__icontains=search_text) | Q(content__icontains=search_text), privacy='public').order_by('-public_date')
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    @action(detail=True, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def public_post(self, request, pk=None):
        post = self.get_object()

        # Verifica si el usuario es propietario del post
        if post.user != request.user:
            return Response({"detail": "No tienes permiso para publicar este post"}, status=status.HTTP_403_FORBIDDEN)

        # Verifica si el post ya está publicado
        if post.privacy == 'public':
            return Response({"detail": "El post ya está publicado"}, status=status.HTTP_400_BAD_REQUEST)

        # Actualiza la privacidad a 'public' y la fecha de publicación
        post.privacy = 'public'
        post.public_date = timezone.now()
        post.save()

        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    # filtro de post por categoría amigos
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def friends_posts(self, request):
        friends = Friend.objects.friends(request.user)
        queryset = Post.objects.filter(user__in=friends, privacy='friends').order_by('-public_date')
        
        if 'search' in request.query_params:
            search_text = request.query_params['search']
            queryset = queryset.filter(Q(title__icontains=search_text) | Q(content__icontains=search_text), privacy='friends').order_by('-public_date')
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put'], permission_classes=[permissions.IsAuthenticated])
    def friends_post(self, request, pk=None):
        post = self.get_object()
        if post.user != request.user:
            return Response({"detail": "No tienes permiso para publicar este post"}, status=status.HTTP_403_FORBIDDEN)
        if post.privacy == 'friends':
            return Response({"detail": "El post ya está publicado"}, status=status.HTTP_400_BAD_REQUEST)
        post.privacy = 'friends'
        post.public_date = timezone.now()
        post.save()
        serializer = self.get_serializer(post)
        return Response(serializer.data)
    
    # filtro de post públicos por likes
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def liked_public_posts(self, request):
        # Filter public posts
        queryset = Post.objects.filter(privacy='public').order_by('-public_date')

        # Filter posts that the current user has liked
        liked_posts_ids = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
        queryset = queryset.filter(id__in=liked_posts_ids)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    # filtro de post de amigos por likes
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def liked_friends_posts(self, request):
        # Filter friends posts
        queryset = Post.objects.filter(privacy='friends').order_by('-public_date')

        # Filter posts that the current user has liked
        liked_posts_ids = Like.objects.filter(user=request.user).values_list('post_id', flat=True)
        queryset = queryset.filter(id__in=liked_posts_ids)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Este ViewSet proporciona automáticamente `listar`, `crear`, `recuperar`,
    acciones de `actualizar` y `destruir`.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    queryset = (
        Category.objects.all()
    )  # Esto es solo para evitar el error, será sobrescrito en get_queryset
    basename = "category"  # Establecer el nombre base

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            if self.request.user.is_superuser:
                # Si el usuario es superusuario, tiene permiso para modificar cualquier categoría
                return [rest_framework.permissions.AllowAny()]
            else:
                # Si no es superusuario, solo puede modificar categorías personalizadas
                return [IsNonDefaultCategoryOwner()]
        else:
            # Los usuarios normales pueden acceder a todas las categorías
            return [rest_framework.permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        user = self.request.user
        queryset = Category.objects.filter(Q(user=user) | Q(is_default=True))
        return queryset

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public_categories(self, request):
        queryset = Category.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def get_public_category(self, request, pk=None):
        try:
            category = self.get_object()
            serializer = self.get_serializer(category)
            return Response(serializer.data)
        except Category.DoesNotExist:
            return Response({"detail": "La categoría no existe"}, status=status.HTTP_404_NOT_FOUND)

    


class IsNonDefaultCategoryOwner(rest_framework.permissions.BasePermission):
    """
    Permite el acceso solo a los propietarios de categorías que no son por defecto.
    """

    def has_object_permission(self, request, view, obj):
        # Solo el propietario de la categoría personalizada puede realizar acciones
        return not obj.is_default or obj.user == request.user


class PeopleInvolvedViewSet(viewsets.ModelViewSet):
    """
    Este ViewSet proporciona automáticamente `listar`, `crear`, `recuperar`,
    acciones de `actualizar` y `destruir`.
    """

    queryset = PeopleInvolved.objects.all()
    serializer_class = PeopleInvolvedSerializer
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    queryset = (
        PeopleInvolved.objects.all()
    )  # Esto es solo para evitar el error, será sobrescrito en get_queryset
    basename = "people_involved"  # Establecer el nombre base

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_queryset(self):
        return PeopleInvolved.objects.filter(user=self.request.user)

# DAR LIKES
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def give_like(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "La publicación no existe"}, status=status.HTTP_404_NOT_FOUND)
    
    # Verificar si la privacidad de la publicación permite dar like
    if post.privacy not in ['public', 'friends']:
        return Response({"error": "No se puede dar like a esta publicación debido a su privacidad"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Crear el like
    like_data = {'post': post_id, 'user': request.user.id}  # Suponiendo que tienes un sistema de autenticación configurado
    like_serializer = LikeSerializer(data=like_data)
    if like_serializer.is_valid():
        like_serializer.save()
        return Response(like_serializer.data, status=status.HTTP_201_CREATED)
    return Response(like_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# QUITAR LIKES
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_like(request, post_id):
    user = request.user
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        like = Like.objects.get(user=user, post=post)
        like.delete()
        return Response({'message': 'Like removed successfully'}, status=status.HTTP_204_NO_CONTENT)
    except Like.DoesNotExist:
        return Response({'error': 'Like not found'}, status=status.HTTP_404_NOT_FOUND)
    
# ESTADO DEL LIKE DE UN POST
# CONTADOR DE LIKES
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_like_status_for_post(request, post_id):
    try:
        user = request.user
        post_id = int(post_id)
        like_status = Like.objects.filter(user=user, post_id=post_id).exists()
        like_count = Like.objects.filter(post_id=post_id).count()
        response_data = {
            'post_id': post_id,
            'liked': like_status,
            'like_count': like_count
        }
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsOwnerOrReadOnly, IsAuthenticated ]

    def list(self, request, post_id=None):
        queryset = self.get_queryset().filter(post=post_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, post_id=None):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post_id=post_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.check_object_permissions(request, instance)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)