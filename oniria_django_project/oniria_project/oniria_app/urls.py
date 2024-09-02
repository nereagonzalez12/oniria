from django.urls import include, path
from oniria_app.api.views import CategoryViewSet, CommentViewSet, PeopleInvolvedViewSet, PostViewSet, give_like, remove_like, get_like_status_for_post
from rest_framework.routers import DefaultRouter


app_name = 'oniria_app'
router = DefaultRouter()
router.register(r'api/posts', PostViewSet)
router.register(r'api/categories', CategoryViewSet)
router.register(r'api/people-involved', PeopleInvolvedViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api/posts/public_posts/', PostViewSet.as_view({'get': 'public_posts'}), name='public-posts'),
    path('api/posts/friends_posts/', PostViewSet.as_view({'get': 'friends_posts'}), name='friends-posts'),
    path('api/posts/<int:post_id>/like/', give_like, name='give_like'),
    path('api/posts/<int:post_id>/unlike/', remove_like, name='remove_like'),
    path('api/posts/<int:post_id>/like_status/', get_like_status_for_post, name='get_like_status'),
    path('api/posts/liked_public_posts/', PostViewSet.as_view({'get': 'liked_public_posts'}), name='liked_public_posts'),
    path('api/posts/liked_friends_posts/', PostViewSet.as_view({'get': 'liked_friends_posts'}), name='liked_friends_posts'),
    path('api/categories/public_categories/', CategoryViewSet.as_view({'get': 'public_categories'}), name='public-categories'),    
    path('api/categories/public_categories/<int:pk>', CategoryViewSet.as_view({'get': 'get_public_category'}), name='public-category-detail'),
    path('api/posts/<int:post_id>/comments/', CommentViewSet.as_view({'get': 'list', 'post': 'create', }), name='post-comments'),
    path('api/comments/<int:pk>/', CommentViewSet.as_view({'delete': 'destroy'}), name='delete-comment'),
    
]
