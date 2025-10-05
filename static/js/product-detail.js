console.log('--- تم تحميل النسخة الجديدة من السكريبت بنجاح ---');

document.addEventListener('DOMContentLoaded', async () => {
    // --- الجزء الأول: جلب وعرض تفاصيل المنتج ---

    // قراءة الـ id من رابط الصفحة (مثل /products/1/)
    const pathParts = window.location.pathname.split('/');
    const productId = pathParts[2];

    // التأكد من وجود id في الرابط
    if (!productId) {
        document.querySelector('.product-page-container').innerHTML = '<h1>لم يتم العثور على المنتج.</h1>';
        return;
    }

   try {
        const response = await fetch(`/api/products/${productId}/`);
        if (!response.ok) { throw new Error('فشل في جلب تفاصيل المنتج'); }
        const product = await response.json();
            document.title = `${product.name} - سوق الدانة`;

        const mainImageUrl = product.images && product.images.length > 0
            ? product.images[0].image
            : 'https://placehold.co/500x500?text=No+Image';
        
        // ملء البيانات
        document.getElementById('product-image').src = mainImageUrl;
        document.getElementById('product-image').alt = product.name;
        document.getElementById('product-name').textContent = product.name;
        document.getElementById('product-description').textContent = product.description;

        // **منطق جديد لعرض السعر**
        const priceElement = document.getElementById('product-price');
        const originalPriceElement = document.getElementById('product-original-price');

        if (product.original_price && parseFloat(product.original_price) > parseFloat(product.price)) {
            priceElement.textContent = `${product.price} درهم`;
            priceElement.classList.add('offer');
            originalPriceElement.textContent = `${product.original_price} درهم`;
        } else {
            priceElement.textContent = `${product.price} درهم`;
            originalPriceElement.style.display = 'none'; // إخفاء السعر الأصلي إذا لم يكن هناك عرض
        }

    } catch (error) {
        console.error('Error:', error);
        document.querySelector('.product-page-container').innerHTML = `<h1>حدث خطأ: ${error.message}</h1>`;
    }

    // --- الجزء الثاني: وظيفة زر "أضف إلى السلة" ---
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    addToCartBtn.addEventListener('click', async () => {
        // تحقق إذا كان المستخدم مسجل دخوله
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
            window.location.href = '/login/';
            return;
        }
        
        // تحقق من وجود CSRF token قبل إرسال الطلب
        if (!csrfToken) {
            alert('حدث خطأ في الصفحة، يرجى إعادة التحميل.');
            return;
        }

        try {
            // إرسال طلب لإضافة المنتج إلى السلة
            const response = await fetch('/api/add-to-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('تمت إضافة المنتج إلى السلة بنجاح!');
// عرض رسالة نجاح
                updateCartCount();   // تحديث عدد السلة في القائمة العلوية
            } else {
                alert(`حدث خطأ: ${data.error}`);
            }
        } catch (error) {
            alert('فشل الاتصال بالخادم.');
        }
    });


    // في نهاية ملف static/js/product-detail.js

// --- الجزء الثالث: وظائف التقييمات ---
const reviewsList = document.getElementById('reviews-list');
const reviewForm = document.getElementById('review-form');
const reviewStatus = document.getElementById('review-status');

// دالة لجلب وعرض التقييمات
async function loadReviews(productId) {
    try {
        const response = await fetch(`/api/reviews/?product_id=${productId}`);
        const reviews = await response.json();
        reviewsList.innerHTML = '';
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>لا توجد تقييمات لهذا المنتج بعد.</p>';
            return;
        }
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review-card');
            reviewElement.innerHTML = `
                <div class="review-header">
                    <strong>${review.name}</strong>
                    <span>${'⭐'.repeat(review.rating)}</span>
                </div>
                <p class="review-comment">${review.comment}</p>
                <small class="review-meta">من ${review.country || 'غير محدد'} - ${new Date(review.created_at).toLocaleDateString()}</small>
            `;
            reviewsList.appendChild(reviewElement);
        });
    } catch (error) {
        reviewsList.innerHTML = '<p>فشل في تحميل التقييمات.</p>';
    }
}

// استدعاء دالة عرض التقييمات عند تحميل الصفحة
// (productId معرف من بداية الملف)
if(productId) {
    loadReviews(productId);
}

// إضافة وظيفة لنموذج إضافة تقييم
reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // التحقق من أن المستخدم مسجل دخوله
    if (!localStorage.getItem('userFirstName')) {
        alert('يرجى تسجيل الدخول أولاً لإضافة تقييم.');
        return;
    }

    const name = document.getElementById('review-name').value;
    const country = document.getElementById('review-country').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;

    try {
        const response = await fetch('/api/reviews/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                name: name,
                country: country,
                rating: rating,
                comment: comment,
                product: productId
            })
        });

        if (response.ok) {
            reviewStatus.textContent = 'شكرًا لك! تم إرسال تقييمك بنجاح.';
            reviewStatus.style.color = 'green';
            reviewForm.reset();
            loadReviews(productId); // إعادة تحميل التقييمات لتظهر الجديدة
        } else {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
    } catch (error) {
        reviewStatus.textContent = `فشل إرسال التقييم: ${error.message}`;
        reviewStatus.style.color = 'red';
    }
});

});