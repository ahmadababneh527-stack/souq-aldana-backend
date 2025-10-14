// --- الدوال العامة ---
function showSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) spinner.classList.add('show');
}

function hideSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) spinner.classList.remove('show');
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification show';
    notification.classList.add(type);
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


// --- المنطق الرئيسي للصفحة ---
document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    async function fetchAndDisplayProducts() {
        if (!productsGrid) return;
        
        showSpinner();
        try {
            const response = await fetch('/api/products/');
            if (!response.ok) { throw new Error('فشل تحميل المنتجات'); }
            
            const products = await response.json();
            productsGrid.innerHTML = '';

            if (products.length === 0) {
                productsGrid.innerHTML = '<p>لم يتم إضافة أي منتجات بعد.</p>';
                hideSpinner();
                return;
            }

            products.forEach(product => {
                const imageUrl = product.images && product.images.length > 0
                    ? product.images[0].image 
                    : 'https://placehold.co/300x300?text=No+Image';

                // جلب السعر من أول نسخة متاحة
                let displayPrice = "غير متوفر";
                let originalPrice = null;
                if (product.variants && product.variants.length > 0) {
                    displayPrice = product.variants[0].price;
                    originalPrice = product.variants[0].original_price;
                }

                let priceHTML = `<p class="product-price">${displayPrice} درهم</p>`;
                if (originalPrice && parseFloat(originalPrice) > parseFloat(displayPrice)) {
                    priceHTML = `<p class="product-price offer">${displayPrice} درهم</p><span class="original-price">${originalPrice} درهم</span>`;
                }

                // ▼▼▼▼▼ هذا هو الكود الجديد الذي تمت إضافته ▼▼▼▼▼
                let stockHTML = '';
                if (product.total_stock > 0) {
                    stockHTML = `<p class="product-stock">الكمية المتاحة: ${product.total_stock}</p>`;
                } else {
                    stockHTML = `<p class="product-stock out-of-stock">نفدت الكمية</p>`;
                }
                // ▲▲▲▲▲ نهاية الكود الجديد ▲▲▲▲▲

                // تحويل الزر إلى رابط لصفحة المنتج
                const buttonHTML = `<a href="/products/${product.id}/" class="add-to-cart-btn">عرض الخيارات</a>`;

                const productCardHTML = `
                <div class="product-card">
                    <a href="/products/${product.id}/"><img src="${imageUrl}" alt="${product.name}"></a>
                    <div class="product-info">
                        <h4><a href="/products/${product.id}/">${product.name}</a></h4>
                        ${priceHTML} 
                        ${stockHTML} ${buttonHTML}
                    </div>
                </div>`;
                productsGrid.innerHTML += productCardHTML;
            });
        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        } finally {
            hideSpinner();
        }
    }

    // --- بدء تشغيل جلب المنتجات ---
    fetchAndDisplayProducts();
});