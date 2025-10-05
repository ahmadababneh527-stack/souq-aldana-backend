document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    async function fetchAndDisplayProducts() {
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
                // **تعديل جديد**: استخدم صورة احتياطية إذا كانت صورة المنتج فارغة
                const imageUrl = product.image ? product.image : 'https://placehold.co/300x300?text=No+Image';
                
                const productCardHTML = `
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
                productsGrid.innerHTML += productCardHTML;
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    fetchAndDisplayProducts();

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    productsGrid.addEventListener('click', async (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            if (!csrfToken) {
                console.error('CSRF Token not found!');
                alert('حدث خطأ في الصفحة. يرجى إعادة تحميلها.');
                return;
            }
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
                    updateCartCount();
                } else {
                    alert(`حدث خطأ: ${data.error}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        }
    });
});