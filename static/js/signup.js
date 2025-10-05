document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const statusMessage = document.getElementById('status-message');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        statusMessage.textContent = '';
        statusMessage.className = '';

        // قراءة البيانات من كل الحقول الجديدة
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const dateOfBirth = document.getElementById('date_of_birth').value;
        const gender = document.getElementById('gender').value;
        const country = document.getElementById('country').value;
        const address = document.getElementById('address').value;
        const postalCode = document.getElementById('postal_code').value;
        const phoneNumber = document.getElementById('phone_number').value;

        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify({
                    username: email, // سنستمر باستخدام الإيميل كاسم مستخدم
                    email: email,
                    password: password,
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth || null, // أرسل null إذا كان الحقل فارغًا
                    gender: gender || null,
                    country: country,
                    address: address,
                    postal_code: postalCode,
                    phone_number: phoneNumber
                }),
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.textContent = 'تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول.';
                statusMessage.classList.add('success');
                setTimeout(() => {
                    window.location.href = '/login/'; // توجيه المستخدم لصفحة تسجيل الدخول بعد النجاح
                }, 2000);
            } else {
                // عرض رسالة الخطأ الأولى التي تظهر
                const errorKey = Object.keys(data)[0];
                const errorMessage = data[errorKey][0];
                statusMessage.textContent = `خطأ: ${errorMessage}`;
                statusMessage.classList.add('error');
            }
        } catch (error) {
            statusMessage.textContent = 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.';
            statusMessage.classList.add('error');
        }
    });
});