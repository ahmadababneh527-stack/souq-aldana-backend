# في ملف store/urls.py

from django.urls import path
from .views import IndexView, ProductDetailView, SignupView, LoginView, CartView, ProfileView

# هذا الملف يحتوي فقط على روابط صفحات الويب (HTML)
urlpatterns = [
    path('', IndexView.as_view(), name='index'),
    path('product/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
    path('profile/', ProfileView.as_view(), name='profile'),
]