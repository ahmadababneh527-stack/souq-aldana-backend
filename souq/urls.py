from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render

# قمنا بتحديث قائمة الاستيراد لتشمل كل الدوال التي نحتاجها بأسمائها مباشرة
from store.views import (
    IndexView, 
    ProductDetailView, 
    SignupView, 
    LoginView, 
    CartView, 
    ProfileView, 
    TermsView, 
    PrivacyView,
    track_order_view,
    create_order_view,
    checkout_shipping, 
    checkout_payment, 
    checkout_confirm,
    order_success,
    category_products,
    search_results,
    active_users_view # <-- تأكدنا من وجودها
)

urlpatterns = [
    # رابط لوحة التحكم
    path('admin/active-users/', active_users_view, name='active_users'), # <-- أضفنا الرابط الجديد هنا
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
    path('track-order/', track_order_view, name='track_order'),
    
    # روابط الأقسام والبحث
    path('category/<slug:slug>/', category_products, name='category_products'),
    path('api/search/', search_results, name='search_results'),

    # روابط عملية إتمام الشراء
    path('checkout/start/', create_order_view, name='create_order'),
    path('checkout/shipping/<int:order_id>/', checkout_shipping, name='checkout_shipping'),
    path('checkout/payment/<int:order_id>/', checkout_payment, name='checkout_payment'),
    path('checkout/confirm/<int:order_id>/', checkout_confirm, name='checkout_confirm'),
    path('order-success/', order_success, name='order_success'),
]

# الكود يضاف هنا، بعد انتهاء القائمة
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)