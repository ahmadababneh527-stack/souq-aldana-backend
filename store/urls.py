from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, UserViewSet, LoginAPIView, CartViewSet, AddToCartAPIView, CartItemViewSet # <-- أضف CartItemViewSet

# 1. إنشاء Router
router = DefaultRouter()

# 2. تسجيل الـ ViewSets مع الـ Router
router.register(r'products', ProductViewSet)
router.register(r'users', UserViewSet)
router.register(r'cart', CartViewSet, basename='cart') #
# 3. تحديد الـ urlpatterns
# الـ Router سيقوم بإنشاء الروابط تلقائياً
urlpatterns = [
    path('', include(router.urls)),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='add-to-cart'),
    router.register(r'cart-items', CartItemViewSet, basename='cart-item')
]