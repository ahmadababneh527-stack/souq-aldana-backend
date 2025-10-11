from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
# لم نعد بحاجة إلى serve أو re_path
# from django.views.static import serve
from store.views import (
    IndexView, 
    ProductDetailView, 
    SignupView, 
    LoginView, 
    CartView, 
    ProfileView, 
    TermsView, 
    track_order_view, 
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
     path('track-order/', track_order_view, name='track_order'),
]

# الكود يضاف هنا، بعد انتهاء القائمة
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)