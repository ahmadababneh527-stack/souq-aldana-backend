// static/js/main.js (النسخة النهائية والمعدلة)

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    // --- الجزء الأول: جلب وعرض المنتجات ---
    async function fetchAndDisplayProducts() {
        if (!productsGrid) return;
        try {
            // استخدام رابط نسبي لجلب المنتجات
            const response = await fetch('/api/products/');
            if (!response.ok) { throw new Error('فشل تحميل المنتجات'); }
            
            const products = await response.json();
            productsGrid.innerHTML = ''; // إفراغ الشبكة قبل العرض

            if (products.length === 0) {
                productsGrid.innerHTML = '<p>لم يتم إضافة أي منتجات بعد.</p>';
                return;
            }

            products.forEach(product => {
                const imageUrl = product.images && product.images.length > 0
                    ? product.images[0].image 
                    : 'https://placehold.co/300x300?text=No+Image';

                let priceHTML = `<p class="product-price">${product.price} درهم</p>`;
                if (product.original_price && parseFloat(product.original_price) > parseFloat(product.price)) {
                    priceHTML = `
                        <p class="product-price offer">${product.price} درهم</p>
                        <p class="original-price">${product.original_price} درهم</p>
                    `;
                }

                // =================================================================
                // ▼▼▼ هذا هو التعديل الوحيد والمطلوب ▼▼▼
                // قمنا بتغيير الرابط من /products/ إلى /product/
                // =================================================================
                const productCardHTML = `
                <div class="product-card">
                    <a href="/product/${product.id}/">
                        <img src="${imageUrl}" alt="${product.name}">
                    </a>
                    <div class="product-info">
                        <h4><a href="/product/${product.id}/">${product.name}</a></h4>
                        ${priceHTML} 
                        <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                    </div>
                </div>`;
                productsGrid.innerHTML += productCardHTML;
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    // استدعاء الوظيفة عند تحميل الصفحة
    fetchAndDisplayProducts();

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" ---
    // (هذا الجزء يبقى كما هو بدون تغيير)
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    productsGrid.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            if (!csrfToken) {
                console.error('CSRF Token not found!');
                alert('حدث خطأ في الصفحة. يرجى إعادة تحميلها.');
                return;
            }

            const userIsLoggedIn = !!localStorage.getItem('userEmail'); // تحقق بسيط
            if (!userIsLoggedIn) {
                alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
                window.location.href = '/login/'; // افترض أن لديك صفحة تسجيل دخول على هذا الرابط
                return;
            }

            const productId = event.target.dataset.productId;

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
                    alert('تمت إضافة المنتج إلى السلة بنجاح!');
                    // يمكنك هنا تحديث عدد المنتجات في أيقونة السلة إذا أردت
                    // updateCartCount();
                } else {
                    alert(`حدث خطأ: ${data.error || 'فشل إضافة المنتج'}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        }
    });
});