document.addEventListener('DOMContentLoaded', () => {
    const productId = window.location.pathname.split('/')[2];

    if (!productId) {
        document.querySelector('main.container').innerHTML = '<h1>لم يتم العثور على المنتج.</h1>';
        return;
    }

    // --- تحميل كل بيانات الصفحة عند فتحها ---
    loadProductDetails();
    loadProductReviews();

    // ==========================================================
    // === الجزء الأول: تحميل وعرض تفاصيل المنتج ومعرض الصور ===
    // ==========================================================
    async function loadProductDetails() {
        try {
            const response = await fetch(`/api/products/${productId}/`);
            if (!response.ok) { throw new Error('فشل في جلب تفاصيل المنتج'); }
            const product = await response.json();

            // --- 1. ملء معرض الصور ---
            const mainImage = document.getElementById('main-product-image');
            const thumbnailGallery = document.getElementById('thumbnail-gallery');
            
            if (product.images && product.images.length > 0) {
                mainImage.src = product.images[0].image; // عرض الصورة الأولى كصورة رئيسية
                
                thumbnailGallery.innerHTML = ''; // إفراغ الصور المصغرة القديمة
                product.images.forEach((imageObj, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = imageObj.image;
                    thumb.alt = `صورة مصغرة ${index + 1}`;
                    thumb.classList.add('thumbnail-image');
                    if (index === 0) {
                        thumb.classList.add('active');
                    }
                    // عند الضغط على صورة مصغرة، يتم تغيير الصورة الرئيسية
                    thumb.addEventListener('click', () => {
                        mainImage.src = imageObj.image;
                        document.querySelector('.thumbnail-image.active').classList.remove('active');
                        thumb.classList.add('active');
                    });
                    thumbnailGallery.appendChild(thumb);
                });
            } else {
                mainImage.src = 'https://placehold.co/500x500?text=No+Image';
            }

            // --- 2. ملء باقي تفاصيل المنتج ---
            document.getElementById('product-name').textContent = product.name;
            document.getElementById('product-description').textContent = product.description;

            const priceElement = document.getElementById('product-price');
            const originalPriceElement = document.getElementById('product-original-price');

            if (product.original_price && parseFloat(product.original_price) > parseFloat(product.price)) {
                priceElement.textContent = `${product.price} درهم`;
                originalPriceElement.textContent = `${product.original_price} درهم`;
            } else {
                priceElement.textContent = `${product.price} درهم`;
                if (originalPriceElement) originalPriceElement.style.display = 'none';
            }

        } catch (error) {
            console.error('Error loading product details:', error);
            document.querySelector('.product-page-container').innerHTML = `<h1>حدث خطأ: ${error.message}</h1>`;
        }
    }

    // ==========================================================
    // === الجزء الثاني: تفعيل محدد الكمية وزر الإضافة للسلة ===
    // ==========================================================
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const statusDiv = document.getElementById('add-to-cart-status');

    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }

    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            if (!localStorage.getItem('userEmail')) {
                alert('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.');
                window.location.href = '/login/';
                return;
            }
            if (!csrfToken) {
                alert('خطأ في الصفحة، يرجى إعادة التحميل.');
                return;
            }
            const quantity = parseInt(quantityInput.value);

            try {
                const response = await fetch('/api/add-to-cart/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                    body: JSON.stringify({ product_id: productId, quantity: quantity }),
                });
                const data = await response.json();
                statusDiv.style.color = response.ok ? 'green' : 'red';
                statusDiv.textContent = response.ok ? data.message : data.error;
                if (response.ok) updateCartCount();
            } catch (error) {
                statusDiv.style.color = 'red';
                statusDiv.textContent = 'فشل الاتصال بالخادم.';
            }
        });
    }

    // ==========================================================
    // === الجزء الثالث: تحميل وعرض وإضافة التقييمات ===
    // ==========================================================
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');
    const reviewForm = document.getElementById('review-form');

    // دالة مساعدة لإنشاء النجوم
    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star ${i <= rating ? 'filled' : ''}"></i>`;
        }
        return stars;
    }

    async function loadProductReviews() {
        if (!reviewsList) return;
        try {
            const response = await fetch(`/api/products/${productId}/reviews/`);
            if (!response.ok) return;
            const reviews = await response.json();

            reviewsList.innerHTML = '';
            reviewsCount.textContent = reviews.length;

            if (reviews.length === 0) {
                reviewsList.innerHTML = '<p>لا توجد تقييمات لهذا المنتج بعد.</p>';
                return;
            }

            reviews.forEach(review => {
                const reviewCard = document.createElement('div');
                reviewCard.className = 'review-card';
                reviewCard.innerHTML = `
                    <div class="review-header">
                        <span class="review-author">${review.name}</span>
                        <span class="review-country">${review.country.name || ''}</span>
                    </div>
                    <div class="review-rating">${renderStars(review.rating)}</div>
                    <p class="review-comment">${review.comment}</p>
                    <small class="review-date">${new Date(review.created_at).toLocaleDateString()}</small>
                `;
                reviewsList.appendChild(reviewCard);
            });
        } catch (error) {
            console.error("Failed to load reviews:", error);
        }
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const statusEl = document.getElementById('review-status');
            const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
            const comment = document.getElementById('comment').value;

            if (!ratingInput) {
                statusEl.textContent = 'يرجى اختيار تقييم (عدد النجوم).';
                statusEl.style.color = 'red';
                return;
            }
            
            const rating = ratingInput.value;
            
            try {
                const response = await fetch(`/api/products/${productId}/reviews/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ rating, comment })
                });

                if (response.ok) {
                    statusEl.textContent = 'شكرًا لك، تم إضافة تقييمك!';
                    statusEl.style.color = 'green';
                    reviewForm.reset();
                    loadProductReviews(); // أعد تحميل التقييمات لتظهر الجديدة
                } else {
                    const data = await response.json();
                    statusEl.textContent = `خطأ: ${Object.values(data)[0]}`;
                    statusEl.style.color = 'red';
                }
            } catch (error) {
                statusEl.textContent = 'فشل الاتصال بالخادم.';
                statusEl.style.color = 'red';
            }
        });
    }
});