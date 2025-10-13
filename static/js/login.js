// static/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('login-status');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // منع الإرسال التلقائي للفورم

            if (typeof showSpinner === 'function') showSpinner();

            // ✨▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼✨
            // ✨ هذا هو الجزء الذي تم إصلاحه ✨
            // البحث عن id="username" بدلاً من id="email"
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            // ✨▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲✨

            try {
                const response = await fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        username: usernameInput.value, // استخدام القيمة من الحقل الصحيح
                        password: passwordInput.value
                    })
                });

                if (response.ok) {
                    // في حالة النجاح، قم بتوجيه المستخدم للصفحة الرئيسية
                    window.location.href = '/';
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