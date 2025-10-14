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
    
    # --- This is the new field ---
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 
            'images', 'reviews', 'createdAt',
            'variants',
            'total_stock' # <-- The field name is added here
        ]

    def get_total_stock(self, product):
        """
        This function calculates the sum of stock from all product variants.
        """
        return sum(variant.stock for variant in product.variants.all())
    # --- End of the new additions ---


class UserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    country = serializers.StringRelatedField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'password', 'password2',
            'date_of_birth', 'gender', 'country', 'address', 
            'postal_code', 'phone_number'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')
        if password != password2:
            raise serializers.ValidationError({"password": "كلمتا المرور غير متطابقتين."})
        
        if User.objects.filter(email=data.get('email')).exists():
            raise serializers.ValidationError({"email": "هذا البريد الإلكتروني مسجل بالفعل."})
            
        return data

    def create(self, validated_data):
        validated_data.pop('password2') 
        user = User.objects.create_user(**validated_data)
        return user

class CartItemVariantSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name')
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

class CartItemSerializer(serializers.ModelSerializer):
    product = CartItemVariantSerializer(source='variant', read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']

    def get_total_price(self, cart_item):
        return cart_item.quantity * cart_item.variant.price

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'createdAt', 'items', 'grand_total']
    
    def get_grand_total(self, cart):
        return sum(item.quantity * item.variant.price for item in cart.items.all())