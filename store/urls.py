from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, UserViewSet, LoginAPIView, CartViewSet, AddToCartAPIView, CartItemViewSet

# 1. إنشاء Router
router = DefaultRouter()

# 2. تسجيل كل الـ ViewSets مع الـ Router هنا
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
# تم نقل هذا السطر إلى هنا
router.register(r'cart-items', CartItemViewSet, basename='cart-item') 

# 3. تحديد الـ urlpatterns
urlpatterns = [
    # هذا السطر يقوم بتضمين كل الروابط التي أنشأها الـ Router تلقائيًا
    path('', include(router.urls)), 
    
    # هذه هي الروابط الإضافية التي لا يتم إنشاؤها عبر الـ Router
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('add-to-cart/', AddToCartAPIView.as_view(), name='add-to-cart'),
]