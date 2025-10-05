document.addEventListener('DOMContentLoaded', () => {
    // --- 1. تعريف العناصر الأساسية من الصفحة ---
    const productsGrid = document.querySelector('.products-grid');
    const cartCountSpan = document.getElementById('cart-count');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // --- 2. الدوال المساعدة ---

    /**
     * تحديث عدّاد السلة في شريط التنقل العلوي.
     * @param {object} cartData - بيانات السلة الكاملة المستلمة من الـ API.
     */
    function updateCartCount(cartData) {
        if (!cartCountSpan || !cartData || !cartData.items) return;
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    }

    /**
     * البحث عن كل عناصر المؤقتات في الصفحة وبدء العد التنازلي لكل منها.
     */
    function initializeCountdownTimers() {
        const countdownElements = document.querySelectorAll('.countdown-timer');
        countdownElements.forEach(element => {
            const offerEndDate = new Date(element.dataset.offerEnd).getTime();

            // تحديث المؤقت كل ثانية
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = offerEndDate - now;

                // إذا انتهى الوقت، أوقف المؤقت واعرض رسالة
                if (distance < 0) {
                    clearInterval(interval);
                    element.innerHTML = "انتهى العرض";
                    return;
                }

                // حساب الأيام، الساعات، الدقائق، الثواني
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // عرض النتيجة
                element.innerHTML = `ينتهي خلال: ${days}ي ${hours}س ${minutes}د ${seconds}ث`;
            }, 1000);
        });
    }

    // --- 3. جلب وعرض المنتجات الرئيسية ---

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

            // بناء HTML لكل المنتجات مرة واحدة لتحسين الأداء
            const allProductsHTML = products.map(product => {
                // منطق عرض السعر (عادي أو مخفض)
                let priceHTML = '';
                if (product.original_price && parseFloat(product.original_price) > parseFloat(product.price)) {
                    priceHTML = `
                        <div class="price-container">
                            <span class="original-price">${product.original_price} درهم</span>
                            <span class="sale-price">${product.price} درهم</span>
                        </div>`;
                } else {
                    priceHTML = `<p class="product-price">${product.price} درهم</p>`;
                }

                // منطق عرض المؤقت (فقط إذا كان العرض موجودًا)
                let timerHTML = '';
                if (product.offer_end_date) {
                    timerHTML = `<div class="countdown-timer" data-offer-end="${product.offer_end_date}"></div>`;
                }

                const imageUrl = (product.images && product.images.length > 0) ? product.images[0].image : 'https://placehold.co/300x300?text=No+Image';
                
                return `
                    <div class="product-card">
                        <a href="/products/${product.id}/">
                            <img src="${imageUrl}" alt="${product.name}">
                        </a>
                        <div class="product-info">
                            <h4><a href="/products/${product.id}/">${product.name}</a></h4>
                            ${priceHTML}
                            <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
                            ${timerHTML}
                        </div>
                    </div>`;
            }).join('');

            productsGrid.innerHTML = allProductsHTML;
            
            // بعد عرض كل المنتجات، قم بتشغيل المؤقتات
            initializeCountdownTimers();

        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    // --- 4. إدارة وظيفة "إضافة إلى السلة" ---

    if (productsGrid) {
        productsGrid.addEventListener('click', async (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const button = event.target;
                const productId = button.dataset.productId;
                const originalButtonText = button.textContent;

                try {
                    button.textContent = 'جارٍ الإضافة...';
                    button.disabled = true;

                    const response = await fetch('/api/add-to-cart/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
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
    }

    // --- 5. تشغيل الوظائف الرئيسية عند تحميل الصفحة ---
    fetchAndDisplayProducts();
});