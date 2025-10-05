# في ملف store/api_urls.py (الملف الجديد)

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, UserViewSet, CartViewSet, CartItemViewSet,
    LoginAPIView, AddToCartAPIView, ProfileAPIView , ReviewViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
router.register(r'reviews', ReviewViewSet, basename='review') # <-- أضف هذا السطر


# هذا الملف يحتوي فقط على روابط الـ API
urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='api-add-to-cart'),
    path('profile/', ProfileAPIView.as_view(), name='api-profile'),
]