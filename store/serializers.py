# في ملف store/serializers.py

from rest_framework import serializers
from .models import Product, User, Cart, CartItem, ProductImage, Review

# --- Serializer للصور (يبقى كما هو) ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# --- Serializer للتقييمات (نسخة محسّنة وموحدة) ---
class ReviewSerializer(serializers.ModelSerializer):
    # نعرض اسم المستخدم فقط بدلًا من كل معلوماته لتجنب استعلامات إضافية
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']


# --- ProductSerializer (محدّث ليكسر الحلقة) ---
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    # سنقوم بإضافة التقييمات هنا ليتم عرضها مع المنتج
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 
            'original_price', 'offer_end_date', 
            'images', 'reviews', 'createdAt'  # أضفنا reviews هنا
        ]

# --- باقي الـ Serializers تبقى كما هي ---
# (UserSerializer, CartItemSerializer, CartSerializer)
# ...ضع باقي الكود الخاص بهم هنا...