document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('login-status');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (typeof showSpinner === 'function') showSpinner();

            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        username: usernameInput.value,
                        password: passwordInput.value
                    })
                });

                if (response.ok) {
                    // ▼▼▼▼▼ هذا هو التعديل الوحيد والمهم ▼▼▼▼▼
                    const userData = await response.json();
                    
                    // حفظ بيانات المستخدم في الذاكرة المحلية للمتصفح
                    localStorage.setItem('userFirstName', userData.first_name);
                    localStorage.setItem('userLastName', userData.last_name);
                    localStorage.setItem('userEmail', userData.email);

                    // إعادة التوجيه للصفحة الرئيسية
                    window.location.href = '/';
                    // ▲▲▲▲▲ نهاية التعديل ▲▲▲▲▲
                    
                } else {
                    const data = await response.json();
                    if (statusMessage) statusMessage.textContent = data.error || 'فشل تسجيل الدخول.';
                }

            } catch (error) {
                if (statusMessage) statusMessage.textContent = 'فشل الاتصال بالخادم.';
            } finally {
                if (typeof hideSpinner === 'function') hideSpinner();
            }
        });
    }
});