from django.shortcuts import render
from django.views.generic import TemplateView, DetailView # <--- قم بإضافة DetailView هنا
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password

from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly

# استيراد كل النماذج التي تحتاجها
from .models import Product, User, Cart, CartItem, Review # <-- أضف Review هنا

# استيراد كل المترجمات التي تحتاجها
from .serializers import ProductSerializer, UserSerializer, CartSerializer, CartItemSerializer, ReviewSerializer # <-- أضف ReviewSerializer هنا


# ProductViewSet سيتعامل مع كل الطلبات الخاصة بالمنتجات
class ProductViewSet(viewsets.ModelViewSet):
    # queryset = Product.objects.all() # <- السطر القديم
    
    # ▼▼▼ السطر الجديد والمُحسّن ▼▼▼
    # هذا السطر يجلب كل المنتجات مع الصور المرتبطة بها في طلب واحد فقط
    # ملاحظة: استبدل 'images' بالاسم الصحيح للعلاقة العكسية للصور في موديل المنتج لديك
    queryset = Product.objects.prefetch_related('images') 
    
    serializer_class = ProductSerializer

# UserViewSet سيتعامل مع كل الطلبات الخاصة بالمستخدمين
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer




# هذا الكلاس سيعرض الصفحة الرئيسية
class IndexView(TemplateView):
    template_name = 'index.html'

# هذا الكلاس سيعرض صفحة تفاصيل المنتج
class ProductDetailView(DetailView):
    model = Product                # <-- نخبره أننا نتعامل مع موديل المنتج
    template_name = 'product.html' # <-- هذا هو اسم ملف القالب
    context_object_name = 'product'  # <-- هذا ه


    # ... (الكود الموجود مسبقًا)

class SignupView(TemplateView):
    template_name = 'signup.html'

    # ... (الكود الموجود مسبقًا)

class LoginView(TemplateView):
    template_name = 'login.html'


class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'اسم المستخدم وكلمة المرور مطلوبان.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user:
            # **هذا هو التعديل**
            # نرجع الآن بيانات إضافية مع رسالة النجاح
            return Response({
                'message': 'تم تسجيل الدخول بنجاح.',
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'بيانات الاعتماد غير صالحة.'}, status=status.HTTP_400_BAD_REQUEST)


# أضف هذا الكلاس الجديد
class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    # هذه هي الأهم: لا يمكن لأحد الوصول إلى هذا الـ API إلا إذا كان مسجل دخوله
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # نعرض فقط السلة الخاصة بالمستخدم الذي قام بتسجيل الدخول
        return self.queryset.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'معرف المنتج مطلوب.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'المنتج غير موجود.'}, status=status.HTTP_404_NOT_FOUND)

        # ابحث عن المنتج في السلة، أو قم بإنشائه
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        
        if not created:
            # إذا كان المنتج موجودًا بالفعل، قم بزيادة الكمية
            cart_item.quantity += quantity
        else:
            # إذا كان منتجًا جديدًا، اضبط الكمية
            cart_item.quantity = quantity
        
        cart_item.save()
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToCartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({'error': 'معرف المنتج مطلوب.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'المنتج غير موجود.'}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity
        
        cart_item.save()

        # ▼▼▼ هذا هو التعديل الأهم ▼▼▼
        # بدلاً من إرجاع رسالة، نقوم بإرجاع بيانات السلة المحدثة
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ... (الكود الموجود مسبقًا)
class CartView(TemplateView):
    template_name = 'cart.html'


    # ... (الكود الموجود مسبقًا)

# أضف هذا الكلاس الجديد في نهاية الملف
class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    # دالة مهمة جدًا للأمان: تأكد من أن المستخدم يمكنه فقط حذف العناصر من سلته الخاصة
    def get_queryset(self):
        return self.queryset.filter(cart__user=self.request.user)
    


    # ... (الكود الموجود مسبقًا)

# هذا الـ API سيجلب بيانات المستخدم المسجل دخوله فقط
class ProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # هذه الدالة لجلب البيانات (تبقى كما هي)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    # ▼▼▼ أضف هذه الدالة الجديدة ▼▼▼
    # هذه الدالة لتحديث البيانات
    def patch(self, request):
        """
        تسمح للمستخدم بتحديث بياناته.
        partial=True تعني أن المستخدم يستطيع إرسال الحقول التي يريد تغييرها فقط.
        """
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# هذا الـ View سيعرض صفحة HTML الخاصة بالملف الشخصي
class ProfileView(TemplateView):
    template_name = 'profile.html'



    # في ملف store/views.py

# ... (باقي الاستيرادات)

# ▼▼▼ أضف هذا الكلاس الجديد ▼▼▼
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
    # يمكن لأي شخص رؤية التقييمات، لكن فقط المستخدم المسجل يمكنه الإضافة
    permission_classes = [IsAuthenticatedOrReadOnly] 

    # دالة لجلب التقييمات الخاصة بمنتج معين فقط
    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

    # دالة لربط التقييم الجديد بالمستخدم المسجل دخوله تلقائيًا
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)