document.addEventListener('DOMContentLoaded', () => {
    // --- الجزء الأول: إدارة القائمة العلوية ---
    const userFirstName = localStorage.getItem('userFirstName');
    const userLastName = localStorage.getItem('userLastName');

    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const logoutLink = document.getElementById('logout-link');

    if (userFirstName) { // نتأكد من وجود الاسم
        if(signupLink) signupLink.style.display = 'none';
        if(loginLink) loginLink.style.display = 'none';
        
        if(userInfo) userInfo.style.display = 'list-item';
        if(userEmailSpan) userEmailSpan.innerHTML = `مرحباً، <a href="/profile/" style="color: #fff; text-decoration: underline;">${userFirstName} ${userLastName}</a>`;

        if(logoutLink) logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
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

    // استدعاء دالة تحديث السلة عند تحميل أي صفحة
    updateCartCount();

    // --- الجزء الثاني: تفعيل روابط الشريط السفلي ---
    const termsLink = document.getElementById('terms-link');
    const privacyLink = document.getElementById('privacy-link');

    if (termsLink) {
        termsLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/terms/'; // توجيه المستخدم إلى صفحة الشروط
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/privacy/'; // توجيه المستخدم إلى صفحة الخصوصية
        });
    }
});


// --- دالة تحديث عدد السلة (تبقى منفصلة في الخارج) ---
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
}