// في ملف static/js/cart.js (النسخة النهائية مع مؤشر التحميل)

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsBody = document.getElementById('cart-items-body'); 
    const cartTotalSpan = document.getElementById('cart-total');
    const mainContainer = document.querySelector('.cart-container'); 
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    
    // ▼▼▼ الخطوة 1: الحصول على عنصر مؤشر التحميل ▼▼▼
    const spinnerOverlay = document.getElementById('spinner-overlay');

    async function displayCart() {
        if (!mainContainer) return;

        // ▼▼▼ الخطوة 2: إظهار مؤشر التحميل في بداية العملية ▼▼▼
        spinnerOverlay.classList.add('show');

        try {
            const response = await fetch('/api/cart/');
            
            if (response.status === 401 || response.status === 403) {
                mainContainer.innerHTML = '<h3>يرجى <a href="/login/">تسجيل الدخول</a> لعرض سلة المشتريات.</h3>';
                return;
            }
            if (!response.ok) {
                throw new Error('فشل في جلب بيانات السلة.');
            }
            
            const data = await response.json();
            const cart = data.length > 0 ? data[0] : null;

            if (!cart || cart.items.length === 0) {
                mainContainer.innerHTML = '<h3>سلة المشتريات فارغة.</h3>';
                if (cartTotalSpan) cartTotalSpan.textContent = '0.00';
                return;
            }

            cartItemsBody.innerHTML = '';
            let grandTotal = 0;

            cart.items.forEach(item => {
                const imageUrl = item.product.images && item.product.images.length > 0
                    ? item.product.images[0].image
                    : 'https://placehold.co/100x100?text=No+Image';

                const itemTotal = item.product.price * item.quantity;
                grandTotal += itemTotal;

                const row = document.createElement('tr');
                // أضفنا class لزر الحذف ليتناسب مع تصميم CSS
                row.innerHTML = `
                    <td>
                        <div class="cart-product-info">
                            <img src="${imageUrl}" alt="${item.product.name}">
                            <span>${item.product.name}</span>
                        </div>
                    </td>
                    <td>${parseFloat(item.product.price).toFixed(2)} درهم</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal.toFixed(2)} درهم</td>
                    <td><button class="remove-from-cart-btn" data-item-id="${item.id}">حذف</button></td>
                `;
                cartItemsBody.appendChild(row);
            });
            
            cartTotalSpan.textContent = grandTotal.toFixed(2);

        } catch (error) {
            mainContainer.innerHTML = `<h3>عذرًا، حدث خطأ أثناء عرض السلة.</h3><p>${error.message}</p>`;
        } finally {
            // ▼▼▼ الخطوة 3: إخفاء مؤشر التحميل دائماً عند انتهاء العملية ▼▼▼
            spinnerOverlay.classList.remove('show');
        }
    }
    
    if (cartItemsBody) {
        cartItemsBody.addEventListener('click', async (event) => {
            if (event.target.classList.contains('remove-from-cart-btn')) {
                const itemId = event.target.dataset.itemId;
                try {
                    const response = await fetch(`/api/cart-items/${itemId}/`, {
                        method: 'DELETE',
                        headers: { 'X-CSRFToken': csrfToken }
                    });
                    if (response.ok) {
                        displayCart();
                    } else {
                        alert(`فشل حذف المنتج.`);
                    }
                } catch (error) {
                    alert('فشل الاتصال بالخادم.');
                }
            }
        });
    }

    displayCart();
});