from rest_framework import serializers
# 1. قم باستيراد أداة تشفير كلمة المرور
from django.contrib.auth.hashers import make_password
from .models import Product, User, Cart, CartItem

# ... (ProductSerializer يبقى كما هو)
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        # قمنا بتحديد الحقول وتغيير imageUrl إلى image
        fields = ['id', 'name', 'description', 'price', 'image', 'createdAt']

# هذا هو الكود الذي سنقوم بتعديله
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # نحدد الحقول التي نريدها من نموذج المستخدم الجديد
        fields = ['id', 'username', 'email', 'password'] 
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # الآن نستخدم دالة create_user الرسمية التي تقوم بالتشفير تلقائيًا
        user = User.objects.create_user(**validated_data)
        return user

# ... (الكود الموجود مسبقًا لـ ProductSerializer و UserSerializer)

class CartItemSerializer(serializers.ModelSerializer):
    # سنقوم بعرض تفاصيل المنتج كاملة داخل عنصر السلة
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    # items هو الاسم الذي حددناه في related_name في نموذج CartItem
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items']