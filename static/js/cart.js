// في ملف static/js/cart.js

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

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsBody = document.getElementById('cart-items-body'); 
    const cartTotalSpan = document.getElementById('cart-total');
    const mainContainer = document.querySelector('.cart-container'); 
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    async function displayCart() {
        if (!mainContainer) return;

        showSpinner();

        try {
            const response = await fetch('/api/cart/');
            
            if (response.status === 401 || response.status === 403) {
                mainContainer.innerHTML = '<h3>يرجى <a href="/login/">تسجيل الدخول</a> لعرض سلة المشتريات.</h3>';
                hideSpinner();
                return;
            }
            if (!response.ok) {
                throw new Error('فشل في جلب بيانات السلة.');
            }
            
            const data = await response.json();
            const cart = data.length > 0 ? data[0] : null;

            if (!cart || cart.items.length === 0) {
                document.querySelector('.cart-table').style.display = 'none';
                document.querySelector('.cart-summary').style.display = 'none';
                document.getElementById('cart-empty-message').style.display = 'block';
                return;
            }

            document.querySelector('.cart-table').style.display = '';
            document.querySelector('.cart-summary').style.display = '';
            document.getElementById('cart-empty-message').style.display = 'none';

            cartItemsBody.innerHTML = '';
            let grandTotal = 0;

            // ✨▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼✨
            // ✨ يبدأ التعديل هنا: داخل حلقة forEach ✨
            cart.items.forEach(item => {
                const variant = item.variant;
                const product = variant.product;

                // 1. الحصول على الصورة والاسم من المسار الصحيح
                const imageUrl = product.images && product.images.length > 0
                    ? product.images[0].image
                    : 'https://placehold.co/100x100?text=No+Image';
                const productName = product.name;

                // 2. الحصول على السعر من الـ variant
                const itemTotal = parseFloat(variant.price) * item.quantity;
                grandTotal += itemTotal;
                
                // 3. (تحسين) جلب تفاصيل اللون والمقاس لعرضها
                let variantDetails = [];
                if (variant.color) {
                    variantDetails.push(variant.color.name);
                }
                if (variant.size) {
                    variantDetails.push(variant.size.name);
                }
                const variantText = variantDetails.length > 0 
                    ? `<small class="cart-variant-details">${variantDetails.join(' / ')}</small>` 
                    : '';

                const row = document.createElement('tr');
                // 4. تحديث HTML ليعكس المسارات الجديدة والتفاصيل
                row.innerHTML = `
                    <td data-label="المنتج:">
                        <div class="cart-product-info">
                            <img src="${imageUrl}" alt="${productName}">
                            <div>
                                <span>${productName}</span>
                                ${variantText}
                            </div>
                        </div>
                    </td>
                    <td data-label="السعر:"><span>${parseFloat(variant.price).toFixed(2)} درهم</span></td>
                    <td data-label="الكمية:"><span>${item.quantity}</span></td>
                    <td data-label="الإجمالي:"><span>${itemTotal.toFixed(2)} درهم</span></td>
                    <td data-label="إزالة:"><button class="remove-from-cart-btn" data-item-id="${item.id}">حذف</button></td>
                `;

                cartItemsBody.appendChild(row);
            });
            // ✨▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲✨
            
            cartTotalSpan.textContent = grandTotal.toFixed(2);

        } catch (error) {
            mainContainer.innerHTML = `<h3>عذرًا، حدث خطأ أثناء عرض السلة.</h3><p>${error.message}</p>`;
        } finally {
            setTimeout(() => {
                hideSpinner();
            }, 300);
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
                        // أرسل إشارة لتحديث عدد السلة في الهيدر
                        document.dispatchEvent(new CustomEvent('cartUpdated'));
                    } else {
                        showNotification(`فشل حذف المنتج.`, 'error');
                    }
                } catch (error) {
                    showNotification('فشل الاتصال بالخادم.', 'error');
                }
            }
        });
    }

    displayCart();
});