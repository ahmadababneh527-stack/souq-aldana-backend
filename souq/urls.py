from django.contrib import admin
from django.urls import path, include

# استيراد كل الـ Views الخاصة بصفحات الـ HTML
from store.views import IndexView, ProductDetailView, SignupView, LoginView, CartView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # روابط الـ API (كل ما يبدأ بـ /api/ يتم توجيهه إلى store.urls)
    path('api/', include('store.urls')),

    # روابط صفحات الـ HTML
    path('', IndexView.as_view(), name='index'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
]