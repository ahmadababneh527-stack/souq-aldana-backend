# في store/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Product, ProductImage, Cart, CartItem, Review

# --- User Admin ---
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # يمكنك إضافة حقولك المخصصة هنا في المستقبل
    pass

# --- Category Admin ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

# --- Product Admin (النسخة المدمجة والصحيحة) ---
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]
    list_display = ['name', 'price', 'category', 'createdAt'] # <-- دمجنا كل الحقول المطلوبة
    list_filter = ['category', 'createdAt']
    search_fields = ['name',]

# --- Review Admin ---
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'rating', 'created_at')
    list_filter = ('product', 'rating')
    search_fields = ('name', 'comment')

# --- تسجيل باقي النماذج ---
# لم نعد بحاجة لـ admin.site.register لأننا نستخدم @admin.register
# لكن يمكنك تسجيل النماذج البسيطة هكذا إذا أردت
admin.site.register(Cart)
admin.site.register(CartItem)