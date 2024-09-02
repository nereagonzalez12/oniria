from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.views import APIView
from users.api.serializers import UserSerializer
from rest_framework import permissions, status, viewsets, filters
from rest_framework.decorators import action
from oniria_project.permissions import IsOwnerOrReadOnly
from friendship.models import Follow
from friendship.models import Friend, Follow, FriendshipRequest
from oniria_project.users.models import User
from django.contrib.auth import logout
from friendship.exceptions import AlreadyExistsError
from django.core.cache import cache

@permission_classes([AllowAny])
class LoginView(APIView):
    def post(self, request):
        try:
            user = get_object_or_404(User, username=request.data["username"])
            if not user.check_password(request.data["password"]):
                return Response(
                    {"detail": "Usuario o contraseña incorrectos"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token, created = Token.objects.get_or_create(user=user)
            serializer = UserSerializer(instance=user)
            return Response({"token": token.key, "user": serializer.data})
        except Exception as e:
            print(e)
            return Response(
                {"detail": "Usuario o contraseña incorrectos"},
                status=status.HTTP_400_BAD_REQUEST,
            )

@permission_classes([AllowAny])
class SignupView(APIView):
    def post(self, request):
        try:
            serializer = UserSerializer(data=request.data)
            print('Datos recibidos:', request.data)  # Imprimir los datos recibidos para depuración

            if serializer.is_valid():
                user = serializer.save()
                user.set_password(request.data["password"])
                user.save()
                token = Token.objects.create(user=user)
                return Response({"token": token.key, "user": serializer.data})
            else:
                print('Errores del serializador:', serializer.errors)  # Imprimir errores del serializador para depuración
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print('Excepción:', e)
            return Response(
                {"detail": "Ha ocurrido un error"},
                status=status.HTTP_400_BAD_REQUEST,
            )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Cerrar sesión del usuario
        logout(request)
        return Response({"detail": "Sesión cerrada exitosamente."}, status=status.HTTP_200_OK)

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(instance=user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrReadOnly, permissions.IsAuthenticated]
    
    
    def get_object(self):
        # Ensure that the user can only edit their own information
        obj = get_object_or_404(User, id=self.request.user.id)
        self.check_object_permissions(self.request, obj)
        return obj

    def partial_update(self, request, pk=None):
        user = self.get_object()
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'], url_path='upload-profile-image')
    def upload_profile_image(self, request, pk=None):
        user = self.get_object()
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Disable other actions
    def list(self, request):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def create(self, request):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(["GET"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def test_token(request):
    return Response({"has entrado {}!".format(request.user.username)})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    user = get_object_or_404(User, id=user_id)
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile_image(request, pk):
    # Recuperar el objeto de usuario
    user = User.objects.get(pk=pk)
    
    # Verificar si el usuario tiene una imagen de perfil
    if user.profile_image:
        # Construir la URL completa de la imagen de perfil
        # profile_image_url = request.build_absolute_uri(user.profile_image.url)
        profile_image_url = user.profile_image.url
        return JsonResponse({'profile_image_url': profile_image_url})
    else:
        return JsonResponse({'error': 'El usuario no tiene una imagen de perfil'}, status=200)


# Lógica de solicitudes de amistad ++++++++++++++++++++++++++++++++
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@api_view(["POST"])
def send_friend_request(request, pk):
    user_to_request = get_object_or_404(User, pk=pk)
    try:
        Friend.objects.add_friend(
            request.user,
            user_to_request,
            message='Hola! Quiero ser tu amigo.'
        )
        cache.clear()
        return JsonResponse({'status': 'Solicitud de amistad enviada'})
    except AlreadyExistsError:
        return JsonResponse({'status': 'error', 'detail': 'Ya hay una solicitud de amistad entre vosotros'}, status=status.HTTP_400_BAD_REQUEST)

@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@api_view(["POST"])
def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendshipRequest, id=request_id)
    if friend_request.to_user == request.user:
        friend_request.accept()
        cache.clear()
        return JsonResponse({'status': 'Solicitud de amistad aceptada'})
    else:
        return JsonResponse({'status': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
  
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
@api_view(["POST"])
def reject_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendshipRequest, id=request_id)
    if friend_request.to_user == request.user:
        friend_request.reject()
        friend_request.delete()
        cache.clear()
        return JsonResponse({'status': 'Solicitud de amistad rechazada'})
    else:
        return JsonResponse({'status': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def followers_view(request, pk):
    user = get_object_or_404(User, pk=pk)
    Friend.refresh_from_db
    followers = Friend.objects.friends(user)
    serializer = UserSerializer(followers, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def following_view(request, pk):
    user = get_object_or_404(User, pk=pk)
    following = Friend.objects.friends(user)
    serializer = UserSerializer(following, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_friend_requests(request):
    user = request.user
    friend_requests = FriendshipRequest.objects.filter(to_user=user)
    data = []
    for request in friend_requests:
        data.append({
            'id': request.id,
            'from_user': request.from_user.pk,
            'message': request.message,
        })
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_sent_friend_requests(request):
    user = request.user
    sent_friend_requests = FriendshipRequest.objects.filter(from_user=user)
    data = []
    for request in sent_friend_requests:
        data.append({
            'id': request.id,
            'to_user': request.to_user.pk,
            'message': request.message,
        })
    return Response(data, status=status.HTTP_200_OK)

# método que reciba el id de un usuario y determine si ya se le ha enviado una solicitud de amistad
@api_view(["GET"])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def has_sent_friend_request(request, user_id):
    from_user = request.user
    to_user = get_object_or_404(User, id=user_id)
    friend_request_exists = FriendshipRequest.objects.filter(from_user=from_user, to_user=to_user).exists()
    return Response({"has_sent_request": friend_request_exists}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_friend(request, user_id):
    user_to_remove = get_object_or_404(User, id=user_id)
    user = request.user
    
    try:
        Friend.objects.remove_friend(user, user_to_remove)
        cache.clear()
        return Response({'status': 'Amistad eliminada'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'status': 'Error al eliminar la amistad', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)