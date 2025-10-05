document.addEventListener('DOMContentLoaded', () => {
    const cartItemsBody = document.getElementById('cart-items-body');
    const cartTotalSpan = document.getElementById('cart-total');
    const mainContainer = document.querySelector('.cart-container');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    async function displayCart() {
        try {
            // **هذا هو الرابط الصحيح الذي سنقوم بتعريفه في Django**
            const response = await fetch('/api/cart/');
            
            // إذا كان المستخدم غير مسجل دخوله، الخادم سيرد بـ 401 أو 403
            if (response.status === 401 || response.status === 403) {
                mainContainer.innerHTML = '<h3>يرجى <a href="/login/">تسجيل الدخول</a> لعرض سلة المشتريات.</h3>';
                return;
            }
            if (!response.ok) {
                throw new Error('فشل في جلب بيانات السلة.');
            }
            
            const data = await response.json();
            // الـ API يرجع قائمة، وفي حالتنا تحتوي على سلة واحدة فقط
            const cart = data.length > 0 ? data[0] : null;

            if (!cart || cart.items.length === 0) {
                mainContainer.innerHTML = '<h3>سلة المشتريات فارغة.</h3>';
                if (cartTotalSpan) cartTotalSpan.textContent = '0.00';
                return;
            }

            cartItemsBody.innerHTML = '';
            // استخدام toFixed(2) لعرض السعر بشكل صحيح
            cartTotalSpan.textContent = parseFloat(cart.total_price || 0).toFixed(2);
            
            cart.items.forEach(item => {
                const itemTotal = (item.product.price * item.quantity).toFixed(2);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="cart-product-info">
                            <img src="${item.product.image || 'https://placehold.co/100x100?text=No+Image'}" alt="${item.product.name}" width="50">
                            <span>${item.product.name}</span>
                        </div>
                    </td>
                    <td>${item.product.price} درهم</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal} درهم</td>
                    <td><button class="remove-btn" data-item-id="${item.id}">حذف</button></td>
                `;
                cartItemsBody.appendChild(row);
            });

        } catch (error) {
            mainContainer.innerHTML = `<h3>عذرًا، حدث خطأ أثناء عرض السلة.</h3><p>${error.message}</p>`;
        }
    }
    
    // إدارة عملية الحذف
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
                        // نعيد عرض السلة لتحديث البيانات بعد الحذف
                        displayCart();
                    } else {
                        const errorData = await response.json();
                        alert(`فشل حذف المنتج: ${JSON.stringify(errorData)}`);
                    }
                } catch (error) {
                    alert('فشل الاتصال بالخادم.');
                }
            }
        });
    }

    // عرض السلة عند تحميل الصفحة
    displayCart();
});