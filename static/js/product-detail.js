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
        showSpinner(); // <-- إظهار المؤشر
        try {
            const response = await fetch(`/api/products/${productId}/`);
            if (!response.ok) { throw new Error('فشل في جلب تفاصيل المنتج'); }
            const product = await response.json();

            // ملء معرض الصور
            const mainImage = document.getElementById('main-product-image');
            const thumbnailGallery = document.getElementById('thumbnail-gallery');
            if (product.images && product.images.length > 0) {
                mainImage.src = product.images[0].image;
                thumbnailGallery.innerHTML = '';
                product.images.forEach((imageObj, index) => {
                    const thumb = document.createElement('img');
                    thumb.src = imageObj.image;
                    thumb.alt = `صورة مصغرة ${index + 1}`;
                    thumb.classList.add('thumbnail-image');
                    if (index === 0) { thumb.classList.add('active'); }
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

            // ملء باقي تفاصيل المنتج
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
        } finally {
            hideSpinner(); // <-- إخفاء المؤشر
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

    if(decreaseBtn) { /* ... كود محدد الكمية ... */ }
    if(increaseBtn) { /* ... كود محدد الكمية ... */ }
    
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', async () => {
            if (!localStorage.getItem('userEmail')) {
                showNotification('يرجى تسجيل الدخول أولاً لإضافة منتجات إلى السلة.', 'error');
                setTimeout(() => { window.location.href = '/login/'; }, 2000);
                return;
            }
            if (!csrfToken) {
                showNotification('خطأ في الصفحة، يرجى إعادة التحميل.', 'error');
                return;
            }
            const quantity = parseInt(quantityInput.value);
            
            showSpinner();
            try {
                const response = await fetch('/api/add-to-cart/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                    body: JSON.stringify({ product_id: productId, quantity: quantity }),
                });
                const data = await response.json();
                if (response.ok) {
                    showNotification(data.message, 'success');
                    updateCartCount();
                } else {
                    showNotification(`حدث خطأ: ${data.error}`, 'error');
                }
            } catch (error) {
                showNotification('فشل الاتصال بالخادم.', 'error');
            } finally {
                hideSpinner();
            }
        });
    }

    // ==========================================================
    // === الجزء الثالث: تحميل وعرض وإضافة التقييمات ===
    // ==========================================================
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');
    const reviewForm = document.getElementById('review-form');

    function renderStars(rating) { /* ... كود عرض النجوم ... */ }

    async function loadProductReviews() {
        // ... (هذا الكود لا يحتاج spinner لأنه يعمل بالتوازي مع التحميل الرئيسي)
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
            const comment = document.getElementById('comment').value;

            if (!ratingInput) {
                showNotification('يرجى اختيار تقييم (عدد النجوم).', 'error');
                return;
            }
            const rating = ratingInput.value;
            
            showSpinner();
            try {
                const response = await fetch(`/api/products/${productId}/reviews/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                    body: JSON.stringify({ rating, comment })
                });
                
                if (response.ok) {
                    showNotification('شكرًا لك، تم إضافة تقييمك!', 'success');
                    reviewForm.reset();
                    loadProductReviews();
                } else {
                    const data = await response.json();
                    showNotification(`خطأ: ${Object.values(data)[0]}`, 'error');
                }
            } catch (error) {
                showNotification('فشل الاتصال بالخادم.', 'error');
            } finally {
                hideSpinner();
            }
        });
    }
});