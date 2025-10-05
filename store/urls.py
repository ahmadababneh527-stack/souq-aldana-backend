from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    UserViewSet,
    CartViewSet,
    CartItemViewSet,
    LoginAPIView,
    AddToCartAPIView,
    ProfileAPIView,
    IndexView,
    ProductDetailView
)

# 1. إعداد الراوتر الخاص بالـ API
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cartitem')

# 2. قائمة الروابط الرئيسية للتطبيق
urlpatterns = [
    # ==================================
    # أولًا: روابط صفحات الويب (HTML)
    # ==================================
    path('', IndexView.as_view(), name='index'),
    path('product/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # ========================================================
    # ثانيًا: كل روابط الـ API مجمعة تحت مسار /api/
    # ========================================================
    path('api/', include([
        path('', include(router.urls)),
        path('login/', LoginAPIView.as_view(), name='api-login'),
        path('add-to-cart/', AddToCartAPIView.as_view(), name='api-add-to-cart'),
        path('profile/', ProfileAPIView.as_view(), name='api-profile'),
    ])),
]