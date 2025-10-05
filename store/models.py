from django.db import models
from django.contrib.auth.models import AbstractUser

# نموذج المستخدم (يبقى كما هو)

class User(AbstractUser):
    # AbstractUser يحتوي بالفعل على:
    # username, first_name, last_name, email, password, etc.
    
    # الحقول الجديدة التي سنضيفها
    GENDER_CHOICES = (
        ('M', 'ذكر'),
        ('F', 'أنثى'),
    )
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    postal_code = models.CharField(max_length=20, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.username
    

# نموذج المنتج (تم تعديله)
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # --- تم حذف حقل الصورة القديم من هنا ---
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# --- نموذج جديد لتخزين الصور المتعددة ---
class ProductImage(models.Model):
    # كل صورة مرتبطة بمنتج معين
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/')

    def __str__(self):
        return f"صورة للمنتج: {self.product.name}"


# نماذج السلة (تبقى كما هي)
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