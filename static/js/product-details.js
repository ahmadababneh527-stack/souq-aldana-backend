document.addEventListener('DOMContentLoaded', async () => {
    // --- الجزء الأول: جلب وعرض تفاصيل المنتج (يبقى كما هو) ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('.product-page-container').innerHTML = '<h1>لم يتم العثور على المنتج.</h1>';
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}/`);
        if (!response.ok) { throw new Error('فشل في جلب تفاصيل المنتج'); }
        const product = await response.json();

        document.getElementById('product-image').src = product.imageUrl;
        document.getElementById('product-image').alt = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-price').textContent = `${product.price} درهم`;
        document.getElementById('product-description').textContent = product.description;

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.product-page-container').innerHTML = `<h1>حدث خطأ: ${error.message}</h1>`;
    }

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" (جديد) ---
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    addToCartBtn.addEventListener('click', async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
            window.location.href = '/login/'; // توجيه المستخدم لصفحة تسجيل الدخول
            return;
        }

        try {
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
                // يمكنك هنا تحديث عدد المنتجات في أيقونة السلة لاحقًا
                updateCartCount();
            } else {
                alert(`حدث خطأ: ${data.error}`);
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم.');
        }
    });
});