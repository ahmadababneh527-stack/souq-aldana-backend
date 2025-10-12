# في ملف store/models.py (النسخة النهائية والمصححة)

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator
from django_countries.fields import CountryField
from django.urls import reverse

# --- 1. نموذج المستخدم ---
class User(AbstractUser):
    GENDER_CHOICES = (('M', 'ذكر'), ('F', 'أنثى'))
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    country = CountryField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    def __str__(self):
        return self.username

# --- 2. نموذج القسم ---
class Category(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True)
    class Meta:
        ordering = ('name',)
        verbose_name = 'category'
        verbose_name_plural = 'categories'
    def __str__(self):
        return self.name

# --- 3. نموذج المنتج ---
class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    # تم حذف حقول السعر من هنا
    createdAt = models.DateTimeField(default=timezone.now)
    # ...
    def get_absolute_url(self):
        return reverse('product-detail', args=[str(self.id)])
    def __str__(self):
        return self.name
# ==================================================================
# ============= ✨ أضف هذه النماذج الثلاثة الجديدة ✨ ==============
# ==================================================================
class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, blank=True, null=True) # e.g., #FF5733

    def __str__(self):
        return self.name

class Size(models.Model):
    name = models.CharField(max_length=50, unique=True) # e.g., "M", "L", "42"

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, related_name='variants', on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=0) # كمية المخزون لهذه النسخة

    class Meta:
        # يمنع إنشاء نسختين بنفس المنتج واللون والمقاس
        unique_together = ('product', 'color', 'size')

    def __str__(self):
        return f"{self.product.name} ({self.color or ''} - {self.size or ''})"
# --- 4. نموذج صور المنتج ---
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    def __str__(self):
        return f"صورة للمنتج: {self.product.name}"

# --- 5. نموذج التقييمات ---
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    name = models.CharField(max_length=100)
    country = CountryField(blank=True, verbose_name="البلد")
    rating = models.IntegerField(default=5, validators=[MaxValueValidator(5), MinValueValidator(1)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"تقييم للمنتج {self.product.name} بواسطة {self.name}"

# --- 6. نماذج السلة ---
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"سلة المستخدم: {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

# --- 7. نماذج الطلبات (تم تصحيح مكانها) ---
class Order(models.Model):
    STATUS_CHOICES = (
        ('preparing', 'جار تجهيز المنتجات'),
        ('shipped', 'تم الشحن'),
        ('in_customs', 'في حالة الجمرك'),
        ('delivered', 'تم الوصول'),
        ('rejected', 'تم رفض الشحن'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='preparing')
    
    first_name = models.CharField("الاسم الأول", max_length=100, blank=True)
    last_name = models.CharField("الاسم الأخير", max_length=100, blank=True)
    phone_number = models.CharField("رقم الهاتف", max_length=30, blank=True)
    country = models.CharField("الدولة", max_length=100, blank=True)
    address = models.CharField("العنوان", max_length=255, blank=True)
    postal_code = models.CharField("الرمز البريدي", max_length=20, blank=True)
    card_number = models.CharField("رقم البطاقة", max_length=20, blank=True, null=True)
    expiry_date = models.CharField("تاريخ الانتهاء", max_length=7, blank=True, null=True)
    cvv = models.CharField("CVV", max_length=4, blank=True, null=True)
    confirmation_code = models.CharField("رمز التأكيد", max_length=6, blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"