from django.db import models
# 1. استيراد النموذج الأساسي للمستخدم من Django
from django.contrib.auth.models import AbstractUser

# نموذج المنتج (يبقى كما هو)
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    imageUrl = models.CharField(max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 2. هذا هو التعديل: نستبدل نموذج المستخدم القديم بهذا النموذج الجديد
class User(AbstractUser):
    # لا نحتاج لتعريف أي حقول هنا لأن AbstractUser يوفرها (username, password, email, etc.)
    pass

# نماذج السلة (تبقى كما هي وترتبط بنموذج User الجديد تلقائيًا)
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
        return f"{self.quantity} x {self.product.name} في سلة {self.cart.user.username}"