document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    // --- الجزء الأول: جلب وعرض المنتجات (موجود مسبقًا) ---
    async function fetchAndDisplayProducts() {
        // ... (هذا الجزء يبقى كما هو تمامًا)
        if (!productsGrid) return;
        try {
            const response = await fetch('/api/products/');
            if (!response.ok) { throw new Error('فشل تحميل المنتجات'); }
            const products = await response.json();
            productsGrid.innerHTML = '';
            if (products.length === 0) {
                productsGrid.innerHTML = '<p>لم يتم إضافة أي منتجات بعد.</p>';
                return;
            }
            products.forEach(product => {
                const productCardHTML = `
                <div class="product-card">
                    <a href="/products/${product.id}/">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <div class="product-info">
                        <h4><a href="/products/${product.id}/">${product.name}</a></h4>
                        <p class="product-price">${product.price} درهم</p>
                        <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                    </div>
                </div>`;
                productsGrid.innerHTML += productCardHTML;
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    fetchAndDisplayProducts();

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" (جديد) ---
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    productsGrid.addEventListener('click', async (event) => {
        // تأكد من أن العنصر الذي تم الضغط عليه هو زر الإضافة للسلة
        if (event.target.classList.contains('add-to-cart-btn')) {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
                window.location.href = '/login/';
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
                    alert(data.message);
                    updateCartCount(); // تحديث العدد في القائمة العلوية
                } else {
                    alert(`حدث خطأ: ${data.error}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        }
    });
});