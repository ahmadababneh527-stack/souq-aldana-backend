from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    UserViewSet,
    CartViewSet,
    CartItemViewSet,
    LoginAPIView,
    AddToCartAPIView,
    ProfileAPIView
)

# إنشاء الراوتر الذي سيقوم بتوليد الروابط للـ ViewSets تلقائيًا
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')

# قائمة الروابط للتطبيق
urlpatterns = [
    # إضافة الروابط التي تم توليدها بواسطة الراوتر
    path('', include(router.urls)),
    
    # إضافة روابط الـ APIViews العادية يدويًا
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='api-add-to-cart'),
    path('profile/', ProfileAPIView.as_view(), name='api-profile'),
]