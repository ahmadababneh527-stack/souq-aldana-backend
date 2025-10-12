# في ملف store/serializers.py

from rest_framework import serializers
from .models import Product, User, Cart, CartItem, ProductImage, Review

# --- Serializer للصور ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# --- Serializer للتقييمات (نسخة محسّنة وموحدة) ---
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

# --- ProductSerializer (محدّث ليكسر الحلقة ويضيف التقييمات) ---
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 
            'original_price', 'offer_end_date', 
            'images', 'reviews', 'createdAt'
        ]

# في ملف store/serializers.py

class UserSerializer(serializers.ModelSerializer):
    # ==================================================================
    # ✨ أضف هذا السطر الجديد لحل مشكلة الدولة ✨
    # ==================================================================
    # هذا السطر يخبر السيريالايزر بأن يعامل حقل "الدولة" كنص عادي
    country = serializers.StringRelatedField()
    # ==================== نهاية السطر الجديد ====================

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email',
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'country', # سيبقى الحقل هنا
            'address', 'postal_code', 'phone_number'
        ]

    # دالة لإنشاء مستخدم جديد مع تشفير كلمة المرور
    def create(self, validated_data):
        password = self.initial_data.get('password')
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
# --- CartItemSerializer (تمت إعادته) ---
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

# --- CartSerializer (تمت إعادته) ---
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items']