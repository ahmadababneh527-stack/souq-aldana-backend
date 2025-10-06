from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, 
    UserViewSet, 
    LoginAPIView, 
    CartViewSet, 
    AddToCartAPIView, 
    CartItemViewSet, 
    ProfileAPIView,
    ReviewListCreateAPIView # <-- هذا هو الاسم الصحيح
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='add-to-cart'),
    path('profile/', ProfileAPIView.as_view(), name='api-profile'),
    path('products/<int:product_id>/reviews/', ReviewListCreateAPIView.as_view(), name='product-reviews'),
]