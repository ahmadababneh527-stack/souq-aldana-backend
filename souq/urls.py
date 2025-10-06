# في ملف souq/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from store.views import IndexView, ProductDetailView, SignupView, LoginView, CartView, ProfileView, TermsView, PrivacyView # <-- أضف TermsView و PrivacyView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # أي طلب يبدأ بـ /api/ سيتم توجيهه لملف الروابط الخاص بالـ API
    path('api/', include('store.api_urls')), 
    
    # أي طلب آخر (لصفحات الويب) سيتم توجيهه لملف الروابط الخاص بالتطبيق
    path('', include('store.urls')), 
    path('terms/', TermsView.as_view(), name='terms'),
    path('privacy/', PrivacyView.as_view(), name='privacy'),
]

# هذا الكود لخدمة ملفات الصور أثناء التطوير وفي بيئة Render
if True:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)