document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const statusMessage = document.getElementById('status-message');
    // **جديد**: اقرأ الـ CSRF Token من الحقل المخفي
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        statusMessage.textContent = '';
        statusMessage.className = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // **جديد**: أضف الـ Token إلى الـ Headers
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.textContent = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
                statusMessage.classList.add('success');
                signupForm.reset();
            } else {
                const errorMessage = data.email || 'حدث خطأ غير متوقع.';
                statusMessage.textContent = errorMessage;
                statusMessage.classList.add('error');
            }
        } catch (error) {
            statusMessage.textContent = 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
            statusMessage.classList.add('error');
        }
    });
});