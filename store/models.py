# في store/models.py

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

# --- 2. نموذج القسم (تم نقله إلى هنا) ---
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
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    offer_end_date = models.DateTimeField(null=True, blank=True)
    createdAt = models.DateTimeField(default=timezone.now)
    
    def get_absolute_url(self):
        return reverse('product-detail', args=[str(self.id)])
    
    def __str__(self):
        return self.name

# --- 4. نموذج صور المنتج (تم حذف حقل category) ---
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
    

    # في نهاية ملف store/models.py

# في ملف store/models.py

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

    # --- الحقول الجديدة ---
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=255, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    payment_method_box1 = models.CharField(max_length=50, blank=True, null=True)
    payment_method_box2 = models.CharField(max_length=50, blank=True, null=True)
    payment_confirmation_code = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"