from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from store.views import (
    IndexView, 
    ProductDetailView, 
    SignupView, 
    LoginView, 
    CartView, 
    ProfileView, 
    TermsView, 
    PrivacyView
)

urlpatterns = [
    # رابط لوحة التحكم
    path('admin/', admin.site.urls),
    
    # كل روابط الـ API يتم توجيهها من هنا إلى ملف store/urls.py
    path('api/', include('store.urls')),

    # روابط صفحات الموقع (HTML)
    path('', IndexView.as_view(), name='index'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('terms/', TermsView.as_view(), name='terms'),
    path('privacy/', PrivacyView.as_view(), name='privacy'),

    # لعرض ملفات الصور المرفوعة في بيئة الإنتاج
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]