from django.views.generic import TemplateView, DetailView
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_countries import countries
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required


from django.db.models import Q # تأكد من إضافة هذا السطر في الأعلى مع بقية الـ imports
from .models import Product, User, Cart, CartItem, Review, Category, Order, OrderItem
from .serializers import (
    ProductSerializer, UserSerializer, CartSerializer, 
    CartItemSerializer, ReviewSerializer
)

# =======================================
# === API ViewSets (للنماذج الرئيسية) ===
# =======================================

# في ملف store/views.py

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    يعرض قائمة المنتجات ومنتج واحد. للقراءة فقط.
    """
    # ----- السطر الذي يجب تعديله -----
    queryset = Product.objects.prefetch_related('images', 'reviews__user').order_by('-createdAt')
    
    serializer_class = ProductSerializer
class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet لإنشاء المستخدمين وعرضهم (يستخدم في صفحة التسجيل).
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CartViewSet(viewsets.ReadOnlyModelViewSet):
    """
    يعرض السلة الخاصة بالمستخدم المسجل دخوله. للقراءة فقط.
    """
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class CartItemViewSet(viewsets.ModelViewSet):
    """
    لإدارة العناصر داخل السلة (مثل الحذف).
    """
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(cart__user=self.request.user)

# =======================================
# === API Views (لوظائف محددة) ===
# =======================================

class LoginAPIView(APIView):
    """
    لمعالجة طلبات تسجيل الدخول.
    """
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            return Response({
                'message': 'تم تسجيل الدخول بنجاح.',
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }, status=status.HTTP_200_OK)
        return Response({'error': 'بيانات الاعتماد غير صالحة.'}, status=status.HTTP_400_BAD_REQUEST)

class AddToCartAPIView(APIView):
    """
    لإضافة منتج إلى السلة.
    """
    permission_classes = [IsAuthenticated]
    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
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
        
        return Response({'message': f"تمت إضافة '{product.name}' إلى السلة بنجاح."}, status=status.HTTP_200_OK)

class ProfileAPIView(APIView):
    """
    لجلب وتحديث بيانات الملف الشخصي للمستخدم.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReviewListCreateAPIView(generics.ListCreateAPIView):
    """
    لعرض وإنشاء التقييمات لمنتج معين.
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return Review.objects.filter(product_id=product_id).order_by('-created_at')

    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = Product.objects.get(id=product_id)
        serializer.save(
            user=self.request.user,
            product=product,
            name=f"{self.request.user.first_name} {self.request.user.last_name}",
            country=self.request.user.country
        )

# =======================================
# === Template Views (لعرض صفحات HTML) ===
# =======================================

class IndexView(TemplateView):
    template_name = 'index.html'

class ProductDetailView(DetailView):
    model = Product
    template_name = 'product.html'
    context_object_name = 'product'

class SignupView(TemplateView):
    template_name = 'signup.html'

class LoginView(TemplateView):
    template_name = 'login.html'

class CartView(TemplateView):
    template_name = 'cart.html'

class ProfileView(TemplateView):
    template_name = 'profile.html'

class TermsView(TemplateView):
    template_name = 'terms.html'

class PrivacyView(TemplateView):
    template_name = 'privacy.html'



# الشكل الصحيح
class CountryListView(APIView):
    def get(self, request):
        # ... (كود البلدان) ...
        country_list = [{'code': code, 'name': name} for code, name in list(countries)]
        return Response(country_list)

# --- صحيح: الدالة تم نقلها إلى هنا في نهاية الملف ---
# (لاحظ أنها على نفس مستوى الـ indentation مع الكلاسات الأخرى، أي بدون مسافة بادئة)
def category_products(request, slug):
    category = get_object_or_404(Category, slug=slug)
    products = Product.objects.filter(category=category)
    context = {
        'category': category,
        'products': products
    }
    return render(request, 'category_products.html', context)



def search_results(request):
    query = request.GET.get('q', '') # الحصول على كلمة البحث من الرابط
    results = []
    if query:
        # ابحث في اسم المنتج ووصفه عن الكلمة
        results = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )

    context = {
        'query': query,
        'results': results
    }
    return render(request, 'search_results.html', context)


# في نهاية ملف store/views.py

@login_required
def track_order_view(request):
    # جلب كل الطلبات الخاصة بالمستخدم الحالي فقط، وترتيبها من الأحدث للأقدم
    orders = request.user.orders.all().order_by('-created_at')
    context = {
        'orders': orders
    }
    return render(request, 'track_order.html', context)


# في نهاية ملف store/views.py

@login_required
def checkout_view(request):
    # هذه الدالة ستقوم بإنشاء الطلب بعد أن يملأ المستخدم بياناته
    if request.method == 'POST':
        cart = Cart.objects.get(user=request.user)
        cart_items = cart.items.all()

        if not cart_items:
            return redirect('cart') # إذا كانت السلة فارغة، أعده للسلة

        # إنشاء طلب جديد
        new_order = Order.objects.create(
            user=request.user,
            first_name=request.POST.get('first_name'),
            last_name=request.POST.get('last_name'),
            country=request.POST.get('country'),
            address=request.POST.get('address'),
            postal_code=request.POST.get('postal_code'),
            phone_number=request.POST.get('phone_number'),
            # (تجريبي) حفظ بيانات الدفع
            payment_method_box1=request.POST.get('box1'),
            payment_method_box2=request.POST.get('box2'),
            payment_confirmation_code=request.POST.get('pin_code'),
        )

        total_price = 0
        # نقل المنتجات من السلة إلى الطلب الجديد
        for item in cart_items:
            OrderItem.objects.create(
                order=new_order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            total_price += item.product.price * item.quantity

        # تحديث السعر الإجمالي للطلب
        new_order.total_price = total_price
        new_order.save()

        # تفريغ السلة
        cart_items.delete()

        return redirect('order_success') # توجيه لصفحة النجاح

    # في حالة GET، فقط اعرض صفحة إتمام الشراء
    return render(request, 'templates/checkout.html')
