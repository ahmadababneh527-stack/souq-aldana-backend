document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const statusMessage = document.getElementById('status-message');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        statusMessage.textContent = '';
        statusMessage.className = '';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                // **هذا هو التعديل**
                // أضفنا username ليكون نفس قيمة email
                body: JSON.stringify({
                    username: email, // <-- السطر الجديد
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
                // نعرض رسائل الخطأ سواء كانت للاسم أو البريد الإلكتروني
                const errorMessage = data.username || data.email || 'حدث خطأ غير متوقع.';
                statusMessage.textContent = errorMessage;
                statusMessage.classList.add('error');
            }
        } catch (error) {
            statusMessage.textContent = 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
            statusMessage.classList.add('error');
        }
    });
});