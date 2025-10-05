// في ملف static/js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('profile-form');
    const saveBtn = document.getElementById('save-profile-btn');
    const successMessage = document.getElementById('success-message');
    // لا نحتاج لـ csrfToken هنا لأننا وضعناه في ملف profile.html مباشرة
    // لكن من الجيد التأكد من وجوده في القالب

    // --- المهمة الأولى: جلب البيانات الحالية وعرضها في النموذج ---
    async function loadProfileData() {
        try {
            const response = await fetch('/api/profile/');
            
            // التحقق من تسجيل الدخول
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/login/';
                return;
            }
            if (!response.ok) throw new Error('فشل تحميل بيانات الملف الشخصي.');
            
            const userData = await response.json();

            // ملء حقول النموذج بالبيانات الموجودة
            document.getElementById('first_name').value = userData.first_name || '';
            document.getElementById('last_name').value = userData.last_name || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('username').value = userData.username || '';
            
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // --- المهمة الثانية: حفظ التغييرات عند الضغط على الزر ---
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع الإرسال التقليدي للنموذج
        
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        saveBtn.textContent = 'جاري الحفظ...';
        saveBtn.disabled = true;

        try {
            const response = await fetch('/api/profile/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }
            
            const updatedUserData = await response.json();

            successMessage.style.display = 'block';
            setTimeout(() => { successMessage.style.display = 'none'; }, 3000);

            // تحديث الاسم في localStorage ليظهر في شريط التنقل
            localStorage.setItem('userFirstName', updatedUserData.first_name);
            localStorage.setItem('userLastName', updatedUserData.last_name);
            
            // تحديث الاسم في شريط التنقل مباشرة بدون إعادة تحميل
            const userEmailSpan = document.getElementById('user-email');
            if(userEmailSpan) {
                 userEmailSpan.innerHTML = `مرحباً، <a href="/profile/" style="color: #fff; text-decoration: underline;">${updatedUserData.first_name} ${updatedUserData.last_name}</a>`;
            }

        } catch (error) {
            console.error(error);
            alert(`فشل حفظ التغييرات: ${error.message}`);
        } finally {
            saveBtn.textContent = 'حفظ التغييرات';
            saveBtn.disabled = false;
        }
    });

    // استدعاء دالة جلب البيانات عند تحميل الصفحة
    loadProfileData();
});