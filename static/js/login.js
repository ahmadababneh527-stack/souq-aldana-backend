document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        showSpinner(); // <-- إظهار المؤشر
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ 
                    username: email,
                    password: password 
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // حفظ بيانات المستخدم
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userFirstName', data.first_name);
                localStorage.setItem('userLastName', data.last_name);

                showNotification(data.message, 'success');
                
                setTimeout(() => {
                    window.location.href = '/'; 
                }, 1500);

            } else {
                showNotification(data.error || 'حدث خطأ ما.', 'error');
            }
        } catch (error) {
            showNotification('فشل الاتصال بالخادم.', 'error');
        } finally {
            hideSpinner(); // <-- إخفاء المؤشر
        }
    });
});