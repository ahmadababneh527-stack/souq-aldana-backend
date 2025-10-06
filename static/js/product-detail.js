// static/js/product-details.js

document.addEventListener('DOMContentLoaded', () => {
    // ما زلنا بحاجة لمعرف المنتج (productId) لوظائف الإضافة للسلة والتقييمات
    const productId = window.location.pathname.split('/')[2];

    if (!productId) {
        // يمكنك إظهار رسالة خطأ إذا لم يتم العثور على المعرف
        console.error('Product ID not found in URL.');
        return;
    }

    // ==========================================================
    // تم حذف دالة loadProductDetails() لأن Django يعرض البيانات الآن
    // ==========================================================

    // يمكنك الإبقاء على تحميل التقييمات بشكل ديناميكي إذا أردت
    loadProductReviews();

    // ==========================================================
    // === الجزء الثاني: تفعيل محدد الكمية وزر الإضافة للسلة ===
    // (هذا الجزء يبقى كما هو لأنه تفاعلي)
    // ==========================================================
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });

        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            // ملاحظة: قد تحتاج إلى طريقة أخرى للتحقق من تسجيل دخول المستخدم
            // إذا لم تعد تعتمد على localStorage
            if (!csrfToken) {
                // يمكنك استبدال showNotification بتنبيه بسيط أو إظهار رسالة
                alert('خطأ في الصفحة، يرجى إعادة التحميل.');
                return;
            }
            const quantity = parseInt(quantityInput.value);
            
            // يمكنك استبدال showSpinner/hideSpinner بمؤشر تحميل بسيط
            addToCartBtn.textContent = 'جاري الإضافة...';
            addToCartBtn.disabled = true;

            try {
                const response = await fetch('/api/add-to-cart/', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-CSRFToken': csrfToken 
                    },
                    body: JSON.stringify({ product_id: productId, quantity: quantity }),
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); // استبدال showNotification
                    // يمكنك استدعاء دالة لتحديث عدد المنتجات في أيقونة السلة
                    // updateCartCount(); 
                } else {
                    alert(`حدث خطأ: ${data.error}`); // استبدال showNotification
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.'); // استبدال showNotification
            } finally {
                addToCartBtn.textContent = 'أضف إلى السلة';
                addToCartBtn.disabled = false;
            }
        });
    }

    // ==========================================================
    // === الجزء الثالث: تحميل وعرض وإضافة التقييمات ===
    // (هذا الجزء يبقى كما هو لأنه تفاعلي)
    // ==========================================================
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');
    const reviewForm = document.getElementById('review-form');

    async function loadProductReviews() {
        try {
            const response = await fetch(`/api/products/${productId}/reviews/`);
            if (!response.ok) return;
            const reviews = await response.json();
            
            reviewsList.innerHTML = '';
            reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review-item');
                reviewElement.innerHTML = `
                    <strong>${review.user}</strong>
                    <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                    <p>${review.comment}</p>
                    <small>${new Date(review.created_at).toLocaleDateString()}</small>
                `;
                reviewsList.appendChild(reviewElement);
            });
            reviewsCount.textContent = reviews.length;
        } catch (error) {
            console.error('Failed to load reviews:', error);
        }
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
            const comment = document.getElementById('comment').value;

            if (!ratingInput) {
                alert('يرجى اختيار تقييم (عدد النجوم).');
                return;
            }
            const rating = ratingInput.value;
            
            try {
                const response = await fetch(`/api/products/${productId}/reviews/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                    body: JSON.stringify({ rating, comment })
                });
                
                if (response.ok) {
                    alert('شكرًا لك، تم إضافة تقييمك!');
                    reviewForm.reset();
                    loadProductReviews(); // إعادة تحميل التقييمات لتشمل الجديد
                } else {
                    const data = await response.json();
                    alert(`خطأ: ${Object.values(data)[0]}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        });
    }
});