document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.querySelector('.products-grid');

    // وظيفة لجلب وعرض المنتجات
    async function fetchAndDisplayProducts() {
        if (!productsGrid) return;

        try {
            // 1. اطلب المنتجات من الخادم
            // In main.js
const response = await fetch('/api/products/');

            if (!response.ok) {
                throw new Error('فشل تحميل المنتجات');
            }
            const products = await response.json();

            // 2. إفراغ الشبكة من أي محتوى قديم
            productsGrid.innerHTML = '';

            if (products.length === 0) {
                productsGrid.innerHTML = '<p>لم يتم إضافة أي منتجات بعد.</p>';
                return;
            }

            // 3. قم بإنشاء بطاقة منتج لكل منتج تم جلبه
            products.forEach(product => {
             const productCardHTML = `
    <div class="product-card">
        <a href="/products/${product.id}/">
            <img src="${product.imageUrl}" alt="${product.name}">
        </a>
        <div class="product-info">
            <h4><a href="/products/${product.id}/">${product.name}</a></h4>
            <p class="product-price">${product.price} درهم</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">أضف إلى السلة</button>
        </div>
    </div>
`;
                // 4. أضف البطاقة إلى الشبكة
                productsGrid.innerHTML += productCardHTML;
            });

        } catch (error) {
            productsGrid.innerHTML = `<p>حدث خطأ في عرض المنتجات: ${error.message}</p>`;
        }
    }

    // قم بتشغيل الوظيفة عند تحميل الصفحة
    fetchAndDisplayProducts();
});