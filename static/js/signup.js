document.addEventListener('DOMContentLoaded', () => {
    async function populateCountries() {
        const countrySelect = document.getElementById('country');
        try {
            const response = await fetch('/api/countries/');
            const countries = await response.json();

            countrySelect.innerHTML = '<option value="">-- اختر بلدك --</option>'; 

            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load countries:', error);
            countrySelect.innerHTML = '<option value="">فشل تحميل البلدان</option>';
        }
    }
    populateCountries();
    
    const signupForm = document.getElementById('signup-form');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // قراءة البيانات من كل الحقول
        const firstName = document.getElementById('first_name').value;
        const lastName = document.getElementById('last_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        // ✨▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼✨
        // ✨ 1. أضف هذا السطر لقراءة قيمة حقل تأكيد كلمة المرور ✨
        const password2 = document.getElementById('password2').value;
        // ✨▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲✨
        const dateOfBirth = document.getElementById('date_of_birth').value;
        const gender = document.getElementById('gender').value;
        const country = document.getElementById('country').value;
        const address = document.getElementById('address').value;
        const postalCode = document.getElementById('postal_code').value;
        const phoneNumber = document.getElementById('phone_number').value;

        // ✨ تحقق من تطابق كلمتي المرور قبل إرسال الطلب ✨
        if (password !== password2) {
            showNotification('خطأ: كلمتا المرور غير متطابقتين.', 'error');
            return; // أوقف التنفيذ
        }

        showSpinner();
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify({
                    username: email, // استخدام البريد الإلكتروني كاسم مستخدم
                    email: email,
                    password: password,
                    // ✨▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼✨
                    // ✨ 2. أضف هذا السطر لإرسال قيمة تأكيد كلمة المرور ✨
                    password2: password2,
                    // ✨▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲✨
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth || null,
                    gender: gender || null,
                    country: country,
                    address: address,
                    postal_code: postalCode,
                    phone_number: phoneNumber
                }),
            });

            const data = await response.json();

            if (response.status === 201) { // 201 Created is the success status for creating new objects
                showNotification('تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول.', 'success');
                setTimeout(() => {
                    window.location.href = '/login/';
                }, 2000);
            } else {
                // عرض رسالة الخطأ القادمة من السيرفر (مثل: البريد مسجل مسبقًا)
                const errorKey = Object.keys(data)[0];
                const errorMessage = Array.isArray(data[errorKey]) ? data[errorKey][0] : data[errorKey];
                showNotification(`خطأ: ${errorMessage}`, 'error');
            }
        } catch (error) {
            showNotification('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            hideSpinner();
        }
    });
});