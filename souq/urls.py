from django.contrib import admin
from django.urls import path, include
# استيرادات جديدة
from django.conf import settings
from django.conf.urls.static import static
from store.views import IndexView, ProductDetailView, SignupView, LoginView, CartView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
    path('', IndexView.as_view(), name='index'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('cart/', CartView.as_view(), name='cart'),
]

# سطر جديد لإضافة روابط الوسائط في وضع التطوير
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)