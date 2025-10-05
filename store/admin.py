# في ملف store/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, ProductImage, Cart, CartItem

# هذا الكود يجعل عرض المستخدمين في لوحة التحكم أفضل
# ويضيف الحقول المخصصة التي أنشأناها
class CustomUserAdmin(UserAdmin):
    # يمكنك إضافة الحقول المخصصة هنا لتظهر في لوحة التحكم
    # مثال:
    # fieldsets = UserAdmin.fieldsets + (
    #     ('بيانات إضافية', {'fields': ('country', 'phone_number')}),
    # )
    pass

# إنشاء كلاس لعرض صور المنتج بشكل مضمن مع المنتج
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1 # عدد حقول الصور الجديدة التي تظهر

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ('name', 'price', 'createdAt')
    search_fields = ('name',)

# تسجيل كل الموديلات لتظهر في لوحة التحكم
admin.site.register(User, CustomUserAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)