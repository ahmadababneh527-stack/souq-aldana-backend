document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-product-form');
    const statusMessage = document.getElementById('status-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // منع إعادة تحميل الصفحة

        const formData = new FormData(form);
        const productData = Object.fromEntries(formData.entries());

        statusMessage.textContent = 'جاري إضافة المنتج...';
        statusMessage.style.color = 'black';

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('فشل الاتصال بالخادم');
            }

            const result = await response.json();
            statusMessage.textContent = `تمت إضافة المنتج بنجاح! (ID: ${result.id})`;
            statusMessage.style.color = 'green';
            form.reset(); // إفراغ النموذج

        } catch (error) {
            statusMessage.textContent = `حدث خطأ: ${error.message}`;
            statusMessage.style.color = 'red';
        }
    });
});