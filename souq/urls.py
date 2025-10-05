from django.contrib import admin
from django.urls import path, include
# استورد الـ Views الجديدة
from store.views import IndexView, ProductDetailView, SignupView, LoginView, CartView # <-- أضف CartView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # روابط الـ API (تبقى كما هي)
    path('api/', include('store.urls')),
    path('login/', LoginView.as_view(), name='login'),
    # روابط صفحات الـ HTML الجديدة
    path('', IndexView.as_view(), name='index'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('cart/', CartView.as_view(), name='cart'),
]