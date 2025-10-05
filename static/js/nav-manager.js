document.addEventListener('DOMContentLoaded', () => {
    // نقرأ الآن الاسم والبريد الإلكتروني
    const userFirstName = localStorage.getItem('userFirstName');
    const userLastName = localStorage.getItem('userLastName');

    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email'); // سنغير هذا العنصر ليعرض الاسم
    const logoutLink = document.getElementById('logout-link');

    if (userFirstName) { // نتأكد من وجود الاسم
        // المستخدم مسجل دخوله
        if(signupLink) signupLink.style.display = 'none';
        if(loginLink) loginLink.style.display = 'none';
        
        if(userInfo) userInfo.style.display = 'list-item';
        // **هذا هو التعديل**: نعرض الاسم الأول والأخير
        if(userEmailSpan) userEmailSpan.innerHTML = `مرحباً، <a href="/profile/" style="color: #fff; text-decoration: underline;">${userFirstName} ${userLastName}</a>`;

        if(logoutLink) logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            // **تعديل**: نحذف كل بيانات المستخدم عند الخروج
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userFirstName');
            localStorage.removeItem('userLastName');
            window.location.href = '/';
        });

    } else {
        // المستخدم ليس مسجل دخوله
        if(signupLink) signupLink.style.display = 'list-item';
        if(loginLink) loginLink.style.display = 'list-item';
        if(userInfo) userInfo.style.display = 'none';
    }

    updateCartCount();
});


// دالة جلب وتحديث عدد المنتجات في السلة (تبقى كما هي)
async function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (!localStorage.getItem('userEmail') || !cartCountElement) {
        if(cartCountElement) cartCountElement.textContent = 0;
        return;
    }
    
    try {
        const response = await fetch('/api/cart/');
        if (!response.ok) return;
        const data = await response.json();
        const cart = data[0];
        if (cart) {
            const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalQuantity;
        } else {
            cartCountElement.textContent = 0;
        }
    } catch (error) {
        console.error("Failed to update cart count:", error);
    }

    // --- كود روابط الفوتر (يضاف في نهاية nav-manager.js) ---
document.addEventListener('DOMContentLoaded', () => {
    const termsLink = document.getElementById('terms-link');
    const privacyLink = document.getElementById('privacy-link');

    if (termsLink) {
        termsLink.addEventListener('click', (event) => {
            event.preventDefault(); // منع الصفحة من الانتقال لأعلى
            alert(
                "شروط الاستخدام:\n\n" +
                "1. مرحبًا بك في سوق الدانة.\n" +
                "2. استخدامك للموقع يعني موافقتك على هذه الشروط.\n" +
                "(يمكنك كتابة شروطك الكاملة هنا...)"
            );
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', (event) => {
            event.preventDefault(); // منع الصفحة من الانتقال لأعلى
            alert(
                "سياسة الخصوصية:\n\n" +
                "نحن في سوق الدانة نلتزم بحماية خصوصيتك. نحن لا نشارك بياناتك مع أي طرف ثالث.\n" +
                "(يمكنك كتابة سياستك الكاملة هنا...)"
            );
        });
    }
});
}