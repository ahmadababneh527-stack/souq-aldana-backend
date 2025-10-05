// في ملف static/js/cart.js (النسخة النهائية)

document.addEventListener('DOMContentLoaded', () => {
    // تأكد من أن HTML يحتوي على tbody بهذا الـ id
    const cartItemsBody = document.getElementById('cart-items-body'); 
    // تأكد من أن HTML يحتوي على span أو div بهذا الـ id
    const cartTotalSpan = document.getElementById('cart-total');
    // تأكد من أن HTML يحتوي على العنصر الرئيسي للسلة بهذا الـ class
    const mainContainer = document.querySelector('.cart-container'); 
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    async function displayCart() {
        if (!mainContainer) return; // إذا لم نكن في صفحة السلة، لا تفعل شيئًا

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
            let grandTotal = 0; // <-- **الإصلاح 1**: متغير لحساب المجموع الإجمالي

            cart.items.forEach(item => {
                // ▼▼▼ **الإصلاح 2**: طريقة الوصول الصحيحة للصورة ▼▼▼
                const imageUrl = item.product.images && item.product.images.length > 0
                    ? item.product.images[0].image
                    : 'https://placehold.co/100x100?text=No+Image';

                const itemTotal = item.product.price * item.quantity;
                grandTotal += itemTotal; // <-- **الإصلاح 1**: إضافة إجمالي العنصر للمجموع الكلي

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="cart-product-info">
                            <img src="${imageUrl}" alt="${item.product.name}" width="50">
                            <span>${item.product.name}</span>
                        </div>
                    </td>
                    <td>${parseFloat(item.product.price).toFixed(2)} درهم</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal.toFixed(2)} درهم</td>
                    <td><button class="remove-btn" data-item-id="${item.id}">حذف</button></td>
                `;
                cartItemsBody.appendChild(row);
            });

            // <-- **الإصلاح 1**: عرض المجموع الإجمالي بعد حسابه
            cartTotalSpan.textContent = grandTotal.toFixed(2);

        } catch (error) {
            mainContainer.innerHTML = `<h3>عذرًا، حدث خطأ أثناء عرض السلة.</h3><p>${error.message}</p>`;
        }
    }
    
    // (جزء الحذف يبقى كما هو، فهو سليم)
    if (cartItemsBody) {
        cartItemsBody.addEventListener('click', async (event) => {
            if (event.target.classList.contains('remove-btn')) {
                const itemId = event.target.dataset.itemId;
                try {
                    const response = await fetch(`/api/cart-items/${itemId}/`, {
                        method: 'DELETE',
                        headers: { 'X-CSRFToken': csrfToken }
                    });
                    if (response.ok) {
                        displayCart(); // نعيد عرض السلة لتحديث البيانات
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