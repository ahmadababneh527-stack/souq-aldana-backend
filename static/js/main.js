document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');
    const cartCountSpan = document.getElementById('cart-count'); // عنصر عدّاد السلة في الأعلى

    // --- 1. تحسين عرض المنتجات ---
    // هذه الدالة الآن تبني كل HTML مرة واحدة، مما يجعلها أسرع بكثير
    async function fetchAndDisplayProducts() {
        if (!productsGrid) return;

        try {
            const response = await fetch('/api/products/');
            if (!response.ok) { throw new Error('فشل تحميل المنتجات'); }
            
            const products = await response.json();
            
            if (products.length === 0) {
                productsGrid.innerHTML = '<p>لم يتم إضافة أي منتجات بعد.</p>';
                return;
            }

            // نبني كل بطاقات المنتجات كسلسلة نصية واحدة
            const allProductsHTML = products.map(product => {
                const imageUrl = product.image ? product.image : 'https://placehold.co/300x300?text=No+Image';
                return `
                    <div class="product-card">
                        <a href="/products/${product.id}/">
                            <img src="${imageUrl}" alt="${product.name}">
                        </a>
                        <div class="product-info">
                            <h4><a href="/products/${product.id}/">${product.name}</a></h4>
                            <p class="product-price">${product.price} درهم</p>
                            <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                        </div>
                    </div>`;
            }).join(''); // ندمجها كلها في نص واحد

            // نضع كل الـ HTML في الصفحة دفعة واحدة فقط
            productsGrid.innerHTML = allProductsHTML;

        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    // --- 2. دالة لتحديث عدّاد السلة ---
    // هذه الدالة تستقبل بيانات السلة وتحسب العدد الإجمالي للمنتجات
    function updateCartCount(cartData) {
        if (!cartCountSpan || !cartData || !cartData.items) return;

        // نحسب العدد الإجمالي بجمع كميات كل المنتجات في السلة
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    }


    // --- 3. تحسين "إضافة إلى السلة" ---
    // هذا الجزء الآن لا يعرض رسالة، بل يعطي رد فعل مرئي ويحدّث عدّاد السلة
  // --- 3. تحسين "إضافة إلى السلة" (نسخة محدّثة مع CSRF Token) ---
productsGrid.addEventListener('click', async (event) => {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const button = event.target;
        const productId = button.dataset.productId;
        
        // **▼▼▼ الإضافة الجديدة: نقرأ رمز الحماية من الصفحة ▼▼▼**
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const originalButtonText = button.textContent;

        try {
            button.textContent = 'جارٍ الإضافة...';
            button.disabled = true;

            const response = await fetch('/api/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // **▼▼▼ الإضافة الجديدة: نرسل الرمز مع الطلب ▼▼▼**
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            const data = await response.json();

            if (response.ok) {
                updateCartCount(data); 

                button.textContent = '✓ تمت الإضافة';
                button.style.backgroundColor = '#28a745';

                setTimeout(() => {
                    button.textContent = originalButtonText;
                    button.style.backgroundColor = '';
                    button.disabled = false;
                }, 2000);

            } else {
                if (response.status === 401 || response.status === 403) {
                     alert('يجب تسجيل الدخول أولاً.');
                     window.location.href = '/login/';
                } else {
                    alert(`حدث خطأ: ${data.error || 'غير معروف'}`);
                    button.textContent = originalButtonText;
                    button.disabled = false;
                }
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم.');
            button.textContent = originalButtonText;
            button.disabled = false;
        }
    }
});

    // استدعاء الدوال عند تحميل الصفحة
    fetchAndDisplayProducts();
    // يمكنك إضافة دالة لجلب بيانات السلة عند تحميل الصفحة لتحديث العدّاد أول مرة
    // fetch('/api/cart/').then(res => res.json()).then(data => updateCartCount(data));
});