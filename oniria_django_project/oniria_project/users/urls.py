from django.urls import path, re_path
from users.api.views import UserViewSet, remove_friend, get_profile_image, send_friend_request, accept_friend_request, reject_friend_request, get_friend_requests
from rest_framework.routers import DefaultRouter
from users.api import views

app_name = "users"
router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    re_path("api/login", views.LoginView.as_view(), name="login"),
    re_path("api/signup", views.SignupView.as_view(), name="signup"),
    re_path("api/logout", views.LogoutView.as_view(), name="logout"),
    re_path("api/user-info", views.UserInfoView.as_view(), name="user-info"),
    re_path("test-token", views.test_token),
    path('api/users/<int:user_id>/', views.get_user_by_id, name='get_user_by_id'),
    path('api/users/<int:pk>/followers/', views.followers_view, name='followers_view'),
    path('api/users/<int:pk>/following/', views.following_view, name='following_view'),
    path('api/users/<int:pk>/upload-profile-image/', views.UserViewSet.as_view({'patch': 'upload_profile_image'}), name='user-upload-profile-image'),
    path('api/users/<int:pk>/profile-image/', get_profile_image, name='get_profile_image'),
    path('api/users/send_friend_request/<int:pk>/', send_friend_request, name='send_friend_request'),
    path('api/users/accept_friend_request/<int:request_id>/', accept_friend_request, name='accept_friend_request'),
    path('api/users/reject_friend_request/<int:request_id>/', reject_friend_request, name='reject_friend_request'),
    path('api/users/friend_requests/', get_friend_requests, name='get_friend_requests'), 
    path('api/users/sent_friend_requests/', views.get_sent_friend_requests, name='sent_friend_requests'),
    path('api/users/has_sent_friend_request/<int:user_id>/', views.has_sent_friend_request, name='has_sent_friend_request'),
    path('api/users/remove_friend/<int:user_id>/', remove_friend, name='remove_friend'),

] + router.urls
