# في store/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
# استيراد النماذج الجديدة
from .models import (
    User, Category, Product, ProductImage, Cart, CartItem, 
    Review, OrderItem, Order, Color, Size, ProductVariant
)

# --- User Admin ---
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    pass

# --- Category Admin ---
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

# --- Inlines for Product Admin ---
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1 # يسمح بإضافة نسخة جديدة فارغة عند إضافة المنتج

# --- Product Admin ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ProductVariantInline]
    # تم حذف 'price' لأنه لم يعد موجودًا في نموذج Product
    list_display = ['name', 'category', 'createdAt'] 
    list_filter = ['category', 'createdAt']
    search_fields = ['name',]

# --- تسجيل النماذج الجديدة للألوان والمقاسات ---
@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ('name', 'hex_code')
    search_fields = ('name',)

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    search_fields = ('name',)

# --- Review Admin ---
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'product', 'rating', 'created_at')
    list_filter = ('product', 'rating')
    search_fields = ('name', 'comment')

# --- Inline for Order Admin ---
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    # تم استبدال 'product' بـ 'variant' لحل الخطأ
    readonly_fields = ('variant', 'quantity', 'price')
    extra = 0

# --- Order Admin ---
# --- Order Admin ---
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # ✨▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼✨
    # ✨ تم تعديل هذا السطر ليعرض بيانات الدفع كما طلبت ✨
    list_display = ('id', 'first_name', 'phone_number', 'card_number', 'expiry_date', 'cvv', 'confirmation_code')
    # ✨▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲✨
    
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'first_name', 'last_name', 'phone_number')
    inlines = [OrderItemInline]
    
    readonly_fields = ('user', 'created_at', 'total_price')
    fieldsets = (
        ('معلومات الطلب الأساسية', {'fields': ('user', 'created_at', 'total_price', 'status')}),
        ('عنوان التوصيل', {'fields': ('first_name', 'last_name', 'phone_number', 'country', 'address', 'postal_code')}),
        ('معلومات الدفع (تجريبية)', {'fields': ('card_number', 'expiry_date', 'cvv', 'confirmation_code')}),
    )


# --- تسجيل نماذج السلة ---
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'createdAt')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    # تم التحديث هنا أيضًا ليشير إلى variant
    list_display = ('cart', 'variant', 'quantity')
