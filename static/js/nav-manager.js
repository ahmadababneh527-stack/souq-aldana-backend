// في ملف static/js/nav-manager.js (النسخة النهائية - تستمع للأحداث)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. كود القائمة الجانبية للهاتف (Hamburger Menu) ---
    const hamburgerButton = document.getElementById('hamburger-button');
    const mobileNav = document.getElementById('mobile-nav');
    const navOverlay = document.getElementById('nav-overlay');

    if (hamburgerButton && mobileNav && navOverlay) {
        function closeMenu() {
            hamburgerButton.classList.remove('is-active');
            mobileNav.classList.remove('is-open');
            navOverlay.classList.remove('is-open');
        }
        hamburgerButton.addEventListener('click', () => {
            hamburgerButton.classList.toggle('is-active');
            mobileNav.classList.toggle('is-open');
            navOverlay.classList.toggle('is-open');
        });
        navOverlay.addEventListener('click', closeMenu);
    }

    // --- 2. كود تحديث روابط تسجيل الدخول والخروج ---
    function updateNavigations() {
        const userFirstName = localStorage.getItem('userFirstName');
        const navs = [ { suffix: '' }, { suffix: '-mobile' } ];
        navs.forEach(nav => {
            const signupLink = document.getElementById(`signup-link${nav.suffix}`);
            const loginLink = document.getElementById(`login-link${nav.suffix}`);
            const userInfo = document.getElementById(`user-info${nav.suffix}`);
            const userDisplay = document.getElementById(`user-display${nav.suffix}`);
            const logoutLink = document.getElementById(`logout-link${nav.suffix}`);

            if (userFirstName) {
                if (signupLink) signupLink.style.display = 'none';
                if (loginLink) loginLink.style.display = 'none';
                if (userInfo) userInfo.style.display = 'list-item';
                if (userDisplay) userDisplay.innerHTML = `<a href="/profile/" style="color: #fff; font-weight: bold;">مرحباً، ${userFirstName}</a>`;
                if (logoutLink && !logoutLink.hasAttribute('data-listener-added')) {
                    logoutLink.addEventListener('click', logout);
                    logoutLink.setAttribute('data-listener-added', 'true');
                }
            } else {
                if (signupLink) signupLink.style.display = 'list-item';
                if (loginLink) loginLink.style.display = 'list-item';
                if (userInfo) userInfo.style.display = 'none';
            }
        });
    }
    
    function logout(event) {
        event.preventDefault();
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        updateNavigations();
        window.location.href = '/';
    }

    // --- 3. كود تحديث عدد المنتجات في السلة ---
    async function updateCartCount() {
        const cartCountElements = [document.getElementById('cart-count'), document.getElementById('cart-count-mobile')];
        const resetCount = () => cartCountElements.forEach(el => { if (el) el.textContent = '0'; });
        if (!localStorage.getItem('userEmail')) {
            resetCount();
            return;
        }
        try {
            const response = await fetch('/api/cart/');
            if (!response.ok) { resetCount(); return; }
            const data = await response.json();
            const cart = data[0];
            let totalQuantity = 0;
            if (cart && cart.items) {
                totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
            }
            cartCountElements.forEach(el => { if (el) el.textContent = totalQuantity; });
        } catch (error) {
            console.error("Failed to update cart count:", error);
            resetCount();
        }
    }

    // --- التشغيل عند تحميل الصفحة ---
    updateNavigations();
    updateCartCount();

    // --- الاستماع لتحديثات السلة ---
    document.addEventListener('cartUpdated', () => {
        updateCartCount();
    });
});