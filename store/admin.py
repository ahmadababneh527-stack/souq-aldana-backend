from django.contrib import admin
from .models import Product, User, Cart, CartItem, ProductImage

# هذا الكلاس سيسمح لنا بإضافة الصور مباشرة من صفحة المنتج
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1 # عدد حقول الصور الفارغة التي ستظهر افتراضيًا

# هذا الكلاس سيقوم بدمج نموذج المنتج مع الصور المرتبطة به
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]

# تسجيل النماذج
admin.site.register(Product, ProductAdmin) # نسجل المنتج باستخدام الكلاس الجديد
admin.site.register(User)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(ProductImage)