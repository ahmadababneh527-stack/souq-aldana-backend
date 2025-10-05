document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const statusMessage = document.getElementById('status-message');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusMessage.textContent = '';
        statusMessage.className = '';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ email: email, password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                // *** هذا هو التعديل المهم ***
                // احفظ البريد الإلكتروني في localStorage
                localStorage.setItem('userEmail', email);

                statusMessage.textContent = data.message;
                statusMessage.classList.add('success');
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 1500);
            } else {
                statusMessage.textContent = data.error || 'حدث خطأ ما.';
                statusMessage.classList.add('error');
            }
        } catch (error) {
            statusMessage.textContent = 'فشل الاتصال بالخادم.';
            statusMessage.classList.add('error');
        }
    });
});