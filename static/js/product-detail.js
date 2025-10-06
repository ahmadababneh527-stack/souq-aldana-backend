// static/js/product-details.js

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // === الجزء الأول: الإعدادات الأولية وجلب ID المنتج ===
    // ==========================================================
    const productId = window.location.pathname.split('/')[2];
    if (!productId) {
        console.error('Product ID not found in URL.');
        return;
    }
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // ==========================================================
    // === الجزء الثاني: تفعيل أزرار الكمية والإضافة للسلة ===
    // ==========================================================
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');

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
            if (!csrfToken) {
                alert('خطأ في الصفحة، يرجى إعادة التحميل.');
                return;
            }
            const quantity = parseInt(quantityInput.value);
            
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
                    alert(data.message);
                    // يمكنك لاحقًا إضافة دالة لتحديث عدد السلة هنا
                } else {
                    alert(`حدث خطأ: ${data.error}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            } finally {
                addToCartBtn.textContent = 'أضف إلى السلة';
                addToCartBtn.disabled = false;
            }
        });
    }

    // ==========================================================
    // === الجزء الثالث: تفعيل النقر على الصور المصغرة ===
    // ==========================================================
    const mainImage = document.querySelector('.main-image-wrapper img');
    const thumbnails = document.querySelectorAll('.thumbnail-image');

    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
        thumbnails[0].classList.add('active');
    }

    // ==========================================================
    // === الجزء الرابع: تحميل وعرض وإضافة التقييمات ===
    // ==========================================================
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');
    const reviewForm = document.getElementById('review-form');

    async function loadProductReviews() {
        // ... (كود تحميل التقييمات يبقى كما هو)
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
            // ... (كود إرسال التقييم يبقى كما هو)
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
                    loadProductReviews();
                } else {
                    const data = await response.json();
                    alert(`خطأ: ${Object.values(data)[0]}`);
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
            }
        });
    }
    
    // استدعاء دالة تحميل التقييمات عند فتح الصفحة
    loadProductReviews();

}); // <-- القوس الأخير يغلق مستمع الحدث الرئيسي