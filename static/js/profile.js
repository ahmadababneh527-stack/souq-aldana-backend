document.addEventListener('DOMContentLoaded', async () => {
    try {
        // الخطوة 1: نحاول جلب بيانات الملف الشخصي مباشرةً
        const response = await fetch('/api/profile/');

        // الخطوة 2: نفحص استجابة الخادم
        // إذا كانت الاستجابة 401 أو 403، فهذا يعني أن المستخدم غير مسجل دخوله
        if (response.status === 401 || response.status === 403) {
            // نوجهه إلى صفحة تسجيل الدخول ونوقف تنفيذ الكود
            window.location.href = '/login/';
            return;
        }

        // إذا لم تكن الاستجابة ناجحة لسبب آخر، نعرض رسالة خطأ
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء تحميل البيانات.');
        }

        // الخطوة 3: إذا كان كل شيء على ما يرام، نعرض البيانات
        const data = await response.json();

        // دالة مساعدة لتجنب التكرار
        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 'غير محدد';
            }
        };
        
        // ملء البيانات في الصفحة
        setText('profile-first-name', data.first_name);
        setText('profile-last-name', data.last_name);
        setText('profile-email', data.email);
        setText('profile-username', data.username);
        setText('profile-dob', data.date_of_birth);
        // التعامل مع عرض الجنس بشكل أفضل
        let gender = 'غير محدد';
        if (data.gender === 'M') {
            gender = 'ذكر';
        } else if (data.gender === 'F') {
            gender = 'أنثى';
        }
        setText('profile-gender', gender);
        setText('profile-country', data.country);
        setText('profile-address', data.address);
        setText('profile-postal-code', data.postal_code);
        setText('profile-phone', data.phone_number);

    } catch (error) {
        // في حال فشل الاتصال بالخادم أو أي خطأ آخر
        console.error("Fetch Error:", error);
        document.querySelector('.profile-container').innerHTML = `<h3>عذرًا، لا يمكن عرض الصفحة. قد تحتاج إلى تسجيل الدخول أولاً.</h3>`;
    }
});