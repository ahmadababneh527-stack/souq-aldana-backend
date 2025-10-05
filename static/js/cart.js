document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsBody = document.getElementById('cart-items-body');
    const cartTotalSpan = document.getElementById('cart-total');
    const mainContainer = document.querySelector('.cart-container');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    if (!localStorage.getItem('userEmail')) {
        mainContainer.innerHTML = '<h3>يرجى <a href="/login/">تسجيل الدخول</a> لعرض سلة المشتريات.</h3>';
        return;
    }

    async function displayCart() {
        try {
            const response = await fetch('/api/cart/');
            if (!response.ok) throw new Error('فشل في جلب بيانات السلة.');
            
            const data = await response.json();
            const cart = data[0]; 

            if (!cart || cart.items.length === 0) {
                mainContainer.innerHTML = '<h3>سلة المشتريات فارغة.</h3>';
                // تأكد من تحديث الإجمالي إلى صفر
                if(cartTotalSpan) cartTotalSpan.textContent = '0.00';
                return;
            }

            let total = 0;
            cartItemsBody.innerHTML = ''; 

            cart.items.forEach(item => {
                const itemTotal = item.product.price * item.quantity;
                total += itemTotal;

                const row = document.createElement('tr');
                row.setAttribute('id', `item-row-${item.id}`);
                // **هذا هو الكود الكامل الذي يحل محل النص المؤقت**
                row.innerHTML = `
                    <td>
                        <div class="cart-product-info">
                            <img src="${item.product.image}" alt="${item.product.name}" width="50">
                            <span>${item.product.name}</span>
                        </div>
                    </td>
                    <td>${item.product.price} درهم</td>
                    <td>${item.quantity}</td>
                    <td>${itemTotal.toFixed(2)} درهم</td>
                    <td><button class="remove-btn" data-item-id="${item.id}">حذف</button></td>
                `;
                cartItemsBody.appendChild(row);
            });

            cartTotalSpan.textContent = total.toFixed(2);
        } catch (error) {
            mainContainer.innerHTML = `<h3>حدث خطأ: ${error.message}</h3>`;
        }
    }
    
    cartItemsBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('remove-btn')) {
            const itemId = event.target.dataset.itemId;
            
            try {
                const response = await fetch(`/api/cart-items/${itemId}/`, {
                    method: 'DELETE',
                    headers: { 'X-CSRFToken': csrfToken }
                });

                if (response.ok) {
                    // أعد تحميل وعرض السلة بالكامل لتحديث كل شيء
                    displayCart(); 
                    updateCartCount();
                } else {
                    alert('فشل حذف المنتج.');
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        }
    });

    displayCart();
});