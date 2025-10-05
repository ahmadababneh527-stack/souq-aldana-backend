document.addEventListener('DOMContentLoaded', async () => {
    // --- الجزء الأول: جلب وعرض تفاصيل المنتج ---

    // قراءة الـ id من رابط الصفحة (مثل /products/1/)
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts[2];

    // التأكد من وجود id في الرابط
    if (!productId) {
        document.querySelector('.product-page-container').innerHTML = '<h1>لم يتم العثور على المنتج.</h1>';
        return;
    }

    try {
        // طلب بيانات المنتج المحدد من الـ API
        const response = await fetch(`/api/products/${productId}/`);
        if (!response.ok) { throw new Error('فشل في جلب تفاصيل المنتج'); }
        const product = await response.json();

        // تحقق من وجود صور واستخدم الصورة الأولى كصورة رئيسية
        // إذا لم تكن هناك صور، استخدم صورة احتياطية
        const mainImageUrl = product.images && product.images.length > 0
            ? product.images[0].image
            : 'https://placehold.co/500x500?text=No+Image';

        // ملء بيانات الصفحة بالمعلومات التي تم جلبها
        document.getElementById('product-image').src = mainImageUrl;
        document.getElementById('product-image').alt = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `${product.price} درهم`;
        document.getElementById('product-description').textContent = product.description;

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.product-page-container').innerHTML = `<h1>حدث خطأ: ${error.message}</h1>`;
    }

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" ---
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    addToCartBtn.addEventListener('click', async () => {
        // تحقق إذا كان المستخدم مسجل دخوله
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
            window.location.href = '/login/';
            return;
        }
        
        // تحقق من وجود CSRF token قبل إرسال الطلب
        if (!csrfToken) {
            alert('حدث خطأ في الصفحة، يرجى إعادة التحميل.');
            return;
        }

        try {
            // إرسال طلب لإضافة المنتج إلى السلة
            const response = await fetch('/api/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message); // عرض رسالة نجاح
                updateCartCount();   // تحديث عدد السلة في القائمة العلوية
            } else {
                alert(`حدث خطأ: ${data.error}`);
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم.');
        }
    });
});