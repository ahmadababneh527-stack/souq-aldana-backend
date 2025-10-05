document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');

    const signupLink = document.getElementById('signup-link');
    const loginLink = document.getElementById('login-link');
    const userInfo = document.getElementById('user-info');
    const userEmailSpan = document.getElementById('user-email');
    const logoutLink = document.getElementById('logout-link');

    if (userEmail) {
        // المستخدم مسجل دخوله
        signupLink.style.display = 'none';
        loginLink.style.display = 'none';
        
        userInfo.style.display = 'list-item'; // أو 'block' حسب التنسيق
        userEmailSpan.textContent = `مرحباً، ${userEmail}`;

        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            // حذف معلومات المستخدم وتسجيل الخروج
            localStorage.removeItem('userEmail');
            // إعادة توجيه للصفحة الرئيسية
            window.location.href = '/';
        });
           updateCartCount(); 
    } else {
        // المستخدم ليس مسجل دخوله
        signupLink.style.display = 'list-item';
        loginLink.style.display = 'list-item';
        userInfo.style.display = 'none';
    }
});


// دالة لجلب وتحديث عدد المنتجات في السلة
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