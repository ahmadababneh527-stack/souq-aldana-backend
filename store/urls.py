from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

from .views import (
    ProductViewSet, 
    UserViewSet, 
    LoginAPIView, 
    CartViewSet, 
    AddToCartAPIView, 
    CartItemViewSet, 
    ProfileAPIView,
     CountryListView ,
     category_products,
    ReviewListCreateAPIView
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-items', CartItemViewSet, basename='cart-item')

urlpatterns = [
    # 🎯 نضع الروابط المحددة أولاً
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('cart/add/', AddToCartAPIView.as_view(), name='add-to-cart'),
    path('profile/', ProfileAPIView.as_view(), name='api-profile'),
    path('products/<int:product_id>/reviews/', ReviewListCreateAPIView.as_view(), name='product-reviews'),
    path('countries/', CountryListView.as_view(), name='country-list'),
    path('category/<slug:slug>/', category_products, name='category_products'),
    path('search/', views.search_results, name='search_results'),
    
    # 🎯 ثم نضع الروابط العامة للـ router في النهاية
    path('', include(router.urls)),
]