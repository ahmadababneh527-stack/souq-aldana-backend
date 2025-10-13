// في ملف static/js/product-detail.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. الحصول على العناصر الأساسية من الصفحة ---
    const priceSection = document.getElementById('price-section');
    const colorOptionsContainer = document.getElementById('color-options-container');
    const colorOptionsDiv = document.getElementById('color-options');
    const sizeOptionsContainer = document.getElementById('size-options-container');
    const sizeOptionsDiv = document.getElementById('size-options');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const variantStatusDiv = document.getElementById('variant-status');
    
    // عناصر التحكم بالكمية
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');

    // عناصر معرض الصور
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-image');

    // عناصر التقييمات
    const reviewsList = document.getElementById('reviews-list');
    const reviewsCount = document.getElementById('reviews-count');
    const reviewForm = document.getElementById('review-form');
    
    // المتغيرات العامة
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    let productData = null;
    let selectedColor = null;
    let selectedSize = null;
    let selectedVariant = null;

    // --- 2. جلب بيانات المنتج والنسخ المتاحة من الـ API ---
    async function fetchProductData() {
        try {
            // نستخدم PRODUCT_ID الذي تم تمريره من القالب
            const response = await fetch(`/api/products/${PRODUCT_ID}/`);
            if (!response.ok) throw new Error('فشل تحميل المنتج');
            productData = await response.json();
            
            // استدعاء الدوال لعرض الخيارات
            renderColorOptions();
            updateUI(); // استدعاء أولي لتحديد الحالة الابتدائية
        } catch (error) {
            console.error(error);
            priceSection.innerHTML = `<p>حدث خطأ في تحميل بيانات المنتج.</p>`;
        }
    }

    // --- 3. عرض خيارات الألوان المتاحة ---
    function renderColorOptions() {
        if (!productData || !productData.variants) return;
        const colors = [...new Set(productData.variants.map(v => v.color?.name).filter(Boolean))];
        
        if (colors.length > 0) {
            colorOptionsContainer.style.display = 'block';
            colorOptionsDiv.innerHTML = colors.map(colorName => {
                const variant = productData.variants.find(v => v.color?.name === colorName);
                return `<div class="color-swatch" data-color="${colorName}" style="background-color: ${variant.color.hex_code};" title="${colorName}"></div>`;
            }).join('');
            
            colorOptionsDiv.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.addEventListener('click', () => handleColorSelection(swatch));
            });
        }
    }

    // --- 4. التعامل مع اختيار لون ---
    function handleColorSelection(selectedSwatch) {
        selectedColor = selectedSwatch.dataset.color;
        colorOptionsDiv.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        selectedSwatch.classList.add('selected');
        selectedSize = null;
        selectedVariant = null;
        renderSizeOptions();
        updateUI();
    }

    // --- 5. عرض خيارات المقاسات المتاحة للون المختار ---
    function renderSizeOptions() {
        const sizesForColor = productData.variants
            .filter(v => v.color?.name === selectedColor)
            .map(v => v.size)
            .filter(Boolean);

        const uniqueSizes = [...new Map(sizesForColor.map(item => [item['name'], item])).values()];

        if (uniqueSizes.length > 0) {
            sizeOptionsContainer.style.display = 'block';
            sizeOptionsDiv.innerHTML = uniqueSizes.map(size => {
                const variant = productData.variants.find(v => v.color?.name === selectedColor && v.size?.name === size.name);
                const isDisabled = variant.stock === 0;
                return `<button class="size-btn" data-size="${size.name}" ${isDisabled ? 'disabled' : ''}>${size.name}</button>`;
            }).join('');
            
            sizeOptionsDiv.querySelectorAll('.size-btn').forEach(btn => {
                btn.addEventListener('click', () => handleSizeSelection(btn));
            });
        } else {
             sizeOptionsContainer.style.display = 'none';
        }
    }

    // --- 6. التعامل مع اختيار مقاس ---
    function handleSizeSelection(selectedBtn) {
        selectedSize = selectedBtn.dataset.size;
        sizeOptionsDiv.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        selectedBtn.classList.add('selected');
        updateUI();
    }

    // --- 7. تحديث واجهة المستخدم (السعر، زر الإضافة، حالة المخزون) ---
    function updateUI() {
        selectedVariant = productData.variants.find(v => v.color?.name === selectedColor && v.size?.name === selectedSize);
        
        if (selectedVariant) {
            let priceHTML = `<span class="product-price offer">${selectedVariant.price} درهم</span>`;
            if (selectedVariant.original_price && parseFloat(selectedVariant.original_price) > parseFloat(selectedVariant.price)) {
                priceHTML += `<span class="original-price">${selectedVariant.original_price} درهم</span>`;
            }
            priceSection.innerHTML = priceHTML;

            if (selectedVariant.stock > 0) {
                variantStatusDiv.textContent = `متوفر (${selectedVariant.stock} قطعة)`;
                variantStatusDiv.className = 'variant-status';
                addToCartBtn.textContent = 'أضف إلى السلة';
                addToCartBtn.disabled = false;
            } else {
                variantStatusDiv.textContent = 'نفدت الكمية';
                variantStatusDiv.className = 'variant-status out-of-stock';
                addToCartBtn.textContent = 'نفدت الكمية';
                addToCartBtn.disabled = true;
            }
        } else {
            priceSection.innerHTML = productData.variants.length > 0 ? '<p>الرجاء اختيار الخيارات المتاحة لعرض السعر</p>' : '';
            addToCartBtn.textContent = 'اختر الخيارات أولاً';
            addToCartBtn.disabled = true;
            variantStatusDiv.textContent = '';
        }
    }
    
    // --- 8. إضافة النسخة المحددة إلى السلة ---
    addToCartBtn.addEventListener('click', async () => {
        if (!selectedVariant || !csrfToken) return;

        showSpinner();
        try {
            const response = await fetch('/api/cart/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    variant_id: selectedVariant.id,
                    quantity: quantityInput.value
                })
            });
            const data = await response.json();
            if (response.ok) {
                showNotification(data.message || 'تمت الإضافة بنجاح!', 'success');
                document.dispatchEvent(new CustomEvent('cartUpdated'));
            } else {
                showNotification(data.error || 'حدث خطأ ما.', 'error');
            }
        } catch (error) {
            showNotification('فشل الاتصال بالخادم.', 'error');
        } finally {
            hideSpinner();
        }
    });

    // --- 9. الحفاظ على وظائف التحكم بالكمية ---
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) quantityInput.value = currentValue - 1;
        });
        increaseBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            quantityInput.value = currentValue + 1;
        });
    }

    // --- 10. الحفاظ على وظائف معرض الصور ---
if (mainImage && thumbnails.length > 0) {
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // تغيير الصورة الرئيسية
            mainImage.src = this.src;

            // ✨ إضافة: إزالة التحديد من كل الصور ✨
            thumbnails.forEach(t => t.classList.remove('active'));

            // ✨ إضافة: تحديد الصورة التي تم النقر عليها ✨
            this.classList.add('active');
        });
    });
    // ✨ إضافة: تحديد أول صورة كصورة نشطة عند تحميل الصفحة ✨
    if (thumbnails.length > 0) {
        thumbnails[0].classList.add('active');
    }
}
    // --- 11. الحفاظ على وظائف التقييمات (لم تتغير) ---
    async function loadProductReviews() {
        // ... (كود تحميل التقييمات)
    }
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            // ... (كود إرسال التقييم)
        });
    }
    
    // --- 12. بدء كل شيء ---
    fetchProductData();
    // loadProductReviews(); // يمكنك تفعيل هذا السطر إذا أردت تحميل التقييمات أيضًا
});