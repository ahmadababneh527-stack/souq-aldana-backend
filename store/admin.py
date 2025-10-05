from django.contrib import admin
from .models import Product, User # 1. نستورد النماذج التي أنشأناها

# 2. نسجل النماذج هنا لتظهر في لوحة التحكم
admin.site.register(Product)
admin.site.register(User)


