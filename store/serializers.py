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

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', # <-- تم حذف كلمة المرور
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'country', 'address', 'postal_code', 'phone_number'
        ]
        # ملاحظة: لم نعد بحاجة لـ extra_kwargs هنا لأنه لا يوجد حقل password
        # لكن يمكن إبقاؤه إذا كنت تستخدم هذا السيريالايزر لإنشاء مستخدمين أيضًا
        extra_kwargs = {'password': {'write_only': True}}

    # دالة لإنشاء مستخدم جديد مع تشفير كلمة المرور
    def create(self, validated_data):
        password = self.initial_data.get('password')
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
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