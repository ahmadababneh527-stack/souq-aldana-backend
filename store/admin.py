# في store/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Category, Product, ProductImage, Cart, CartItem, Review, OrderItem, Order

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
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product', 'quantity', 'price')
    extra = 0

# في ملف store/admin.py

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'first_name', 'phone_number', 'total_price', 'status', 'payment_method_box1', 'payment_method_box2', 'payment_confirmation_code', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ('status',)
    inlines = [OrderItemInline]

    # لعرض التفاصيل بشكل منظم داخل صفحة كل طلب
    readonly_fields = ('user', 'created_at', 'total_price')
    fieldsets = (
        ('معلومات الطلب الأساسية', {
            'fields': ('user', 'created_at', 'total_price', 'status')
        }),
        ('عنوان التوصيل', {
            'fields': ('first_name', 'last_name', 'phone_number', 'country', 'address', 'postal_code')
        }),
        ('معلومات الدفع (تجريبية)', {
            'fields': ('payment_method_box1', 'payment_method_box2', 'payment_confirmation_code')
        }),
    )

# --- تسجيل باقي النماذج ---
# لم نعد بحاجة لـ admin.site.register لأننا نستخدم @admin.register
# لكن يمكنك تسجيل النماذج البسيطة هكذا إذا أردت
admin.site.register(Cart)
admin.site.register(CartItem)