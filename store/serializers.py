# في ملف store/serializers.py

from rest_framework import serializers
# ✨ 1. استيراد النماذج الجديدة ✨
from .models import (
    Product, User, Cart, CartItem, ProductImage, Review,
    Color, Size, ProductVariant
)

# --- Serializer للصور --- (بدون تغيير)
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# --- Serializer للتقييمات --- (بدون تغيير)
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

# ==================================================================
# ============= ✨ 2. إضافة Serializers جديدة للخيارات ==============
# ==================================================================
class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['name', 'hex_code']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['name']

class ProductVariantSerializer(serializers.ModelSerializer):
    # عرض تفاصيل اللون والمقاس بدلًا من مجرد ID
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'size', 'price', 'original_price', 'stock']
# ==================================================================


# --- ProductSerializer (محدّث ليعرض النسخ المتاحة) ---
# ✨ 3. تعديل ProductSerializer ✨
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    # إضافة سطر لجلب كل النسخ المرتبطة بالمنتج
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 
            # تم حذف السعر من هنا
            'images', 'reviews', 'createdAt',
            'variants' # إضافة النسخ إلى قائمة الحقول
        ]

# --- UserSerializer --- (بدون تغيير)
class UserSerializer(serializers.ModelSerializer):
    country = serializers.StringRelatedField()
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'date_of_birth', 'gender', 'country', 'address', 
            'postal_code', 'phone_number'
        ]

    def create(self, validated_data):
        password = self.initial_data.get('password')
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

# --- CartItemSerializer (محدّث ليشير إلى نسخة المنتج) ---
# ✨ 4. تعديل CartItemSerializer ✨
class CartItemSerializer(serializers.ModelSerializer):
    # تم تغيير product إلى variant
    variant = ProductVariantSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'variant', 'quantity']

# --- CartSerializer --- (بدون تغيير)
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items']