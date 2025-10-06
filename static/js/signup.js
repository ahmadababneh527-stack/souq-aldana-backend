document.addEventListener('DOMContentLoaded', () => {
    // --- كود جديد لجلب وتعبئة قائمة البلدان ---
async function populateCountries() {
    const countrySelect = document.getElementById('country');
    try {
        const response = await fetch('/api/countries/');
        const countries = await response.json();

        countrySelect.innerHTML = '<option value="">-- اختر بلدك --</option>'; // إعادة تعيين القائمة

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
// استدعاء الدالة عند تحميل الصفحة
populateCountries();
// --- نهاية الكود الجديد ---
    const signupForm = document.getElementById('signup-form');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // قراءة البيانات من كل الحقول
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

        showSpinner(); // <-- إظهار المؤشر
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify({
                    username: email,
                    email: email,
                    password: password,
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

            if (response.ok) {
                showNotification('تم إنشاء الحساب بنجاح! سيتم توجيهك لصفحة تسجيل الدخول.', 'success');
                setTimeout(() => {
                    window.location.href = '/login/';
                }, 2000);
            } else {
                const errorKey = Object.keys(data)[0];
                const errorMessage = data[errorKey][0];
                showNotification(`خطأ: ${errorMessage}`, 'error');
            }
        } catch (error) {
            showNotification('فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            hideSpinner(); // <-- إخفاء المؤشر
        }
    });
});