from rest_framework import serializers
from .models import Product, User, Cart, CartItem, ProductImage, Review

# --- serializer جديد للصور ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# --- ProductSerializer محدّث ---
# --- ProductSerializer محدّث ---
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        # أضفنا الحقول الجديدة هنا
        fields = [
            'id', 'name', 'description', 'price', 
            'original_price', 'offer_end_date', # <-- الحقول الجديدة
            'images', 'createdAt'
        ]

# --- باقي الـ serializers تبقى كما هي ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 'date_of_birth', 'gender',
            'country', 'address', 'postal_code', 'phone_number'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items']


        # في ملف store/serializers.py

# ... (استيرادات وباقي الكلاسات تبقى كما هي)

class ReviewSerializer(serializers.ModelSerializer):
    # لجلب اسم المستخدم بدلًا من رقمه فقط
    user = serializers.StringRelatedField(read_only=True) 

    class Meta:
        model = Review
        fields = ['id', 'user', 'name', 'country', 'rating', 'comment', 'created_at', 'product']
        # product سنجعله حقل للكتابة فقط عند إنشاء تقييم جديد
        extra_kwargs = {
            'product': {'write_only': True}
        }



        # ... (الكود الموجود مسبقًا)

# --- serializer جديد للتقييمات ---
class ReviewSerializer(serializers.ModelSerializer):
    # سنعرض اسم المستخدم فقط بدلاً من كل معلوماته
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'name', 'country', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at'] # هذه الحقول لا يمكن للمستخدم إدخالها مباشرة