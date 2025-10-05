document.addEventListener('DOMContentLoaded', async () => {
    // تحقق إذا كان المستخدم مسجلاً دخوله
    if (!localStorage.getItem('userFirstName')) {
        window.location.href = '/login/'; // إذا لم يكن، وجهه لصفحة الدخول
        return;
    }

    try {
        const response = await fetch('/api/profile/');
        if (!response.ok) {
            throw new Error('فشل في جلب بيانات الملف الشخصي.');
        }

        const data = await response.json();

        // ملء البيانات في الصفحة
        document.getElementById('profile-first-name').textContent = data.first_name || 'غير محدد';
        document.getElementById('profile-last-name').textContent = data.last_name || 'غير محدد';
        document.getElementById('profile-email').textContent = data.email || 'غير محدد';
        document.getElementById('profile-username').textContent = data.username || 'غير محدد';
        document.getElementById('profile-dob').textContent = data.date_of_birth || 'غير محدد';
        document.getElementById('profile-gender').textContent = data.gender === 'M' ? 'ذكر' : (data.gender === 'F' ? 'أنثى' : 'غير محدد');
        document.getElementById('profile-country').textContent = data.country || 'غير محدد';
        document.getElementById('profile-address').textContent = data.address || 'غير محدد';
        document.getElementById('profile-postal-code').textContent = data.postal_code || 'غير محدد';
        document.getElementById('profile-phone').textContent = data.phone_number || 'غير محدد';

    } catch (error) {
        document.querySelector('.profile-container').innerHTML = `<h3>${error.message}</h3>`;
    }
});