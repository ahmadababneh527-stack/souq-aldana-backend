# في ملف store/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, ProductImage, Cart, CartItem, Review # <-- أضف Review هنا
from .models import Product, Category, User  # <-- تأكد من إضافة Category هنا

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



# في ملف store/admin.py


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)} # <-- هذه الميزة الرائعة تملأ حقل الـ slug تلقائيًا عند كتابة الاسم

# تأكد من أن ProductAdmin موجود أيضًا
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'createdAt'] # <-- أضفنا category هنا
    list_filter = ['category', 'createdAt']





# ... (الكود السابق يبقى كما هو)

# كلاس لعرض التقييمات بشكل أفضل
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'rating', 'created_at')
    list_filter = ('product', 'rating')
    search_fields = ('name', 'comment')

# تسجيل الموديلات
# ... (admin.site.register السابقة تبقى كما هي)



# تسجيل كل الموديلات لتظهر في لوحة التحكم
admin.site.register(User, CustomUserAdmin)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Review, ReviewAdmin) # <-- أضف هذا السطر
