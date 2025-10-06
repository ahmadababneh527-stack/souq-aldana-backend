document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    // --- الجزء الأول: جلب وعرض المنتجات ---
    async function fetchAndDisplayProducts() {
        if (!productsGrid) return;
        
        showSpinner(); // <-- إظهار المؤشر
        try {
            const response = await fetch('/api/products/');
            if (!response.ok) { throw new Error('فشل تحميل المنتج'); }
            
            const products = await response.json();
            productsGrid.innerHTML = '';

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

                // **تم تصحيح الرابط هنا**
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
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        } finally {
            hideSpinner(); // <-- إخفاء المؤشر
        }
    }

    fetchAndDisplayProducts();

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" ---
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    productsGrid.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            if (!csrfToken) {
                showNotification('حدث خطأ في الصفحة. يرجى إعادة تحميلها.', 'error');
                return;
            }

            if (!localStorage.getItem('userEmail')) {
                showNotification('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.', 'error');
                setTimeout(() => { window.location.href = '/login/'; }, 2000);
                return;
            }

            const productId = event.target.dataset.productId;
            
            showSpinner();
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
                    showNotification('تمت إضافة المنتج إلى السلة بنجاح!', 'success');
                    updateCartCount();
                } else {
                    showNotification(`حدث خطأ: ${data.error || 'فشل إضافة المنتج'}`, 'error');
                }
            } catch (error) {
                showNotification('فشل الاتصال بالخادم.', 'error');
            } finally {
                hideSpinner();
            }
        }
    });
});