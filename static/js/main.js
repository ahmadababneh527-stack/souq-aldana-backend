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

         // (الكود في بداية الملف يبقى كما هو)
// ...
            products.forEach(product => {
                const imageUrl = product.images && product.images.length > 0
                    ? product.images[0].image 
                    : 'https://placehold.co/300x300?text=No+Image';

                // **منطق جديد لعرض السعر**
                let priceHTML = `<p class="product-price">${product.price} درهم</p>`;
                if (product.original_price && parseFloat(product.original_price) > parseFloat(product.price)) {
                    priceHTML = `
                        <p class="product-price offer">${product.price} درهم</p>
                        <p class="original-price">${product.original_price} درهم</p>
                    `;
                }

                const productCardHTML = `
                <div class="product-card">
                    <a href="/products/${product.id}/">
                        <img src="${imageUrl}" alt="${product.name}">
                    </a>
                    <div class="product-info">
                        <h4><a href="/products/${product.id}/">${product.name}</a></h4>
                        ${priceHTML} 
                        <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                    </div>
                </div>`;
                productsGrid.innerHTML += productCardHTML;
            
// ... (باقي الكود في نهاية الملف يبقى كما هو)
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    // استدعاء الوظيفة عند تحميل الصفحة
    fetchAndDisplayProducts();

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" ---
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // استخدام "Event Delegation" للاستماع للنقرات على الأزرار المضافة ديناميكيًا
    productsGrid.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            // تأكد من وجود CSRF Token
            if (!csrfToken) {
                console.error('CSRF Token not found!');
                alert('حدث خطأ في الصفحة. يرجى إعادة تحميلها.');
                return;
            }

            // تحقق إذا كان المستخدم مسجل دخوله
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