# store/serializers.py

from rest_framework import serializers
from .models import (
    Product, User, Cart, CartItem, ProductImage, Review,
    Color, Size, ProductVariant
)

# --- Serializers الأساسية (تبقى كما هي) ---
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ['name', 'hex_code']

class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ['name']

class ProductVariantSerializer(serializers.ModelSerializer):
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)
    class Meta:
        model = ProductVariant
        fields = ['id', 'color', 'size', 'price', 'original_price', 'stock']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 
            'images', 'reviews', 'createdAt',
            'variants'
        ]

# In store/serializers.py

class UserSerializer(serializers.ModelSerializer):
    # 1. Add a password confirmation field that is write-only
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    country = serializers.StringRelatedField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'password2', # Add the new password fields
            'date_of_birth', 'gender', 'country', 'address', 
            'postal_code', 'phone_number'
        ]
        # 2. Make the main password field write-only as well
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        """
        3. Check that the two password fields match.
        """
        password = data.get('password')
        password2 = data.get('password2')
        if password != password2:
            raise serializers.ValidationError({"password": "كلمتا المرور غير متطابقتين."})
        
        # You can add more validation here, e.g., for email uniqueness if needed
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({"email": "هذا البريد الإلكتروني مسجل بالفعل."})
            
        return data

    def create(self, validated_data):
        """
        4. Use the proper create_user method to handle password hashing.
        """
        # We don't need password2 to create the user, so we remove it
        validated_data.pop('password2') 
        
        # create_user handles hashing automatically
        user = User.objects.create_user(**validated_data)
        return user

# Serializer جديد ومخصص لعرض بيانات المنتج والنسخة معًا داخل السلة
class CartItemVariantSerializer(serializers.ModelSerializer):
    """
    هذا الـ serializer يدمج معلومات المنتج (الاسم والصورة)
    مع معلومات نسخة المنتج (السعر، اللون، المقاس) في كائن واحد.
    """
    # جلب الاسم من المنتج الأب
    name = serializers.CharField(source='product.name')
    # جلب الصورة الأولى للمنتج الأب
    image = serializers.SerializerMethodField()
    color = ColorSerializer(read_only=True)
    size = SizeSerializer(read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'price', 'color', 'size', 'image']

    def get_image(self, variant):
        request = self.context.get('request')
        first_image = variant.product.images.first()
        if first_image and request:
            return request.build_absolute_uri(first_image.image.url)
        return None


# تعديل CartItemSerializer ليستخدم الـ serializer الجديد
class CartItemSerializer(serializers.ModelSerializer):
    # أبقينا على اسم الحقل "product" لأن JavaScript يتوقعه بهذا الاسم
    # ولكننا نخبره أن مصدر البيانات هو حقل "variant"
    product = CartItemVariantSerializer(source='variant', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']

    def get_total_price(self, cart_item):
        # حساب السعر الإجمالي للعنصر (الكمية * سعر نسخة المنتج)
        return cart_item.quantity * cart_item.variant.price

# تعديل CartSerializer ليحسب السعر الإجمالي للسلة
class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items', 'grand_total']
    
    def get_grand_total(self, cart):
        # حساب السعر الإجمالي لكل العناصر في السلة
        return sum(item.quantity * item.variant.price for item in cart.items.all())