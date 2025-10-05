from django.db import models
from django.contrib.auth.models import AbstractUser

# نموذج المستخدم المطور
class User(AbstractUser):
    pass

# نموذج المنتج المحدث ليقبل رفع الصور
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # --- هذا هو السطر الذي تم تعديله ---
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

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