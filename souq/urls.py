from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static  # استيراد الدالة المساعدة لخدمة الملفات
from store.views import IndexView, ProductDetailView, SignupView, LoginView, CartView

# هذه هي المسارات الأساسية لتطبيقك
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
    path('', IndexView.as_view(), name='index'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
]

# --- الجزء الأهم ---
# هذا السطر يضيف مسارًا لخدمة ملفات الوسائط (الصور)
# Django سيقوم تلقائيًا بتفعيل هذا المسار فقط عندما يكون DEBUG = True (في بيئة التطوير المحلية)
# لكن لكي تعمل على Render، نحتاج لإضافتها بشكل دائم
if True: # أبقيناها True لتعمل على Render بشكل مباشر
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)