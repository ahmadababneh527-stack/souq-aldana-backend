# في ملف store/models.py (النسخة النهائية مع إضافة نسخ المنتج)

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator
from django_countries.fields import CountryField
from django.urls import reverse

# --- 1. نموذج المستخدم --- (بدون تغيير)
class User(AbstractUser):
    GENDER_CHOICES = (('M', 'ذكر'), ('F', 'أنثى'))
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    country = CountryField(null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    phone_number = models.CharField(max_length=30, blank=True, null=True)
    def __str__(self):
        return self.username

# --- 2. نموذج القسم --- (بدون تغيير)
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
# ✨ التعديل الأول: حذفنا السعر من المنتج الرئيسي ✨
# في ملف store/models.py

# ... (باقي الـ imports كما هي)

# في ملف store/models.py

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    createdAt = models.DateTimeField(default=timezone.now)
    video_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="رابط فيديو المنتج (يوتيوب)")
    
    # --- حقول الكتب ---
    author = models.CharField("المؤلف", max_length=200, null=True, blank=True)
    publisher = models.CharField("الناشر", max_length=200, null=True, blank=True)
    publication_date = models.DateField("تاريخ النشر", null=True, blank=True)
    page_count = models.PositiveIntegerField("عدد الصفحات", null=True, blank=True)
    isbn = models.CharField("ISBN", max_length=20, null=True, blank=True)
    
    # ▼▼▼ هذا هو الحقل الجديد الذي أضفناه لرفع الملفات ▼▼▼
    book_file = models.FileField("ملف الكتاب (PDF, EPUB)", upload_to='books/', null=True, blank=True)
    # ▲▲▲ نهاية الحقل الجديد ▲▲▲

    def get_absolute_url(self):
        return reverse('product-detail', args=[str(self.id)])
    
    def __str__(self):
        return self.name

    def get_embed_url(self):
        if self.video_url and 'youtube.com/watch' in self.video_url:
            video_id = self.video_url.split('v=')[-1]
            return f'https://www.youtube.com/embed/{video_id}'
        return None
    
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
# ==================================================================


# --- 5. نموذج صور المنتج --- (بدون تغيير)
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')
    def __str__(self):
        return f"صورة للمنتج: {self.product.name}"

# --- 6. نموذج التقييمات --- (بدون تغيير)
class Review(models.Model):
    # ... الكود الحالي كما هو ...
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews')
    name = models.CharField(max_length=100)
    country = CountryField(blank=True, verbose_name="البلد")
    rating = models.IntegerField(default=5, validators=[MaxValueValidator(5), MinValueValidator(1)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"تقييم للمنتج {self.product.name} بواسطة {self.name}"

# --- 7. نماذج السلة ---
# ✨ التعديل الثاني: CartItem يشير الآن إلى ProductVariant ✨
class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    createdAt = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"سلة المستخدم: {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    # تم استبدال product بـ variant
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE) 
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.variant}"

# --- 8. نماذج الطلبات ---
# ✨ التعديل الثالث: OrderItem يشير الآن إلى ProductVariant ✨
class Order(models.Model):
    # ... الكود الحالي كما هو ...
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
    # تم استبدال product بـ variant
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True) 
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # هذا السعر يبقى هنا لتسجيل سعر الشراء

    def __str__(self):
        return f"{self.quantity} of {self.variant}"