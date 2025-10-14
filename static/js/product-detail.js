document.addEventListener('DOMContentLoaded', () => {
    // --- 1. الحصول على العناصر الأساسية من الصفحة ---
    const priceSection = document.getElementById('price-section');
    const colorOptionsContainer = document.getElementById('color-options-container');
    const colorOptionsDiv = document.getElementById('color-options');
    const sizeOptionsContainer = document.getElementById('size-options-container');
    const sizeOptionsDiv = document.getElementById('size-options');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const variantStatusDiv = document.getElementById('variant-status');
    const decreaseBtn = document.getElementById('decrease-quantity');
    const increaseBtn = document.getElementById('increase-quantity');
    const quantityInput = document.getElementById('quantity');
    const mainImage = document.querySelector('.main-image-wrapper img');
    const thumbnails = document.querySelectorAll('.thumbnail-image');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    let productData = null;
    let selectedColor = null;
    let selectedSize = null;
    let selectedVariant = null;

    // --- 2. جلب بيانات المنتج والنسخ المتاحة من الـ API ---
    async function fetchProductData() {
        try {
            const response = await fetch(`/api/products/${PRODUCT_ID}/`);
            if (!response.ok) throw new Error('فشل تحميل المنتج');
            productData = await response.json();
            
            displayInitialPrice(); 
            
            renderColorOptions();
            updateButtonState();
        } catch (error) {
            console.error(error);
            priceSection.innerHTML = `<p>حدث خطأ في تحميل بيانات المنتج.</p>`;
        }
    }
    function displayInitialPrice() {
        if (productData && productData.variants && productData.variants.length > 0) {
            const firstVariant = productData.variants[0];
            
            let priceHTML = '';
            if (firstVariant.original_price && parseFloat(firstVariant.original_price) > parseFloat(firstVariant.price)) {
                priceHTML = `
                    <div class="price-wrapper">
                        <span class="price-label">السعر قبل الخصم:</span>
                        <span class="original-price">${parseFloat(firstVariant.original_price).toFixed(2)} درهم</span>
                    </div>
                    <div class="price-wrapper">
                        <span class="price-label">السعر بعد الخصم:</span>
                        <span class="product-price offer">${parseFloat(firstVariant.price).toFixed(2)} درهم</span>
                    </div>
                `;
            } else {
                priceHTML = `
                    <div class="price-wrapper">
                        <span class="product-price">${parseFloat(firstVariant.price).toFixed(2)} درهم</span>
                    </div>
                `;
            }
            priceSection.innerHTML = priceHTML;
            
        } else {
            priceSection.innerHTML = `<p>السعر غير متوفر</p>`;
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
        renderSizeOptions();
        updateButtonState();
    }

    // --- 5. عرض خيارات المقاسات المتاحة للون المختار ---
    function renderSizeOptions() {
        const sizesForColor = productData.variants.filter(v => v.color?.name === selectedColor).map(v => v.size).filter(Boolean);
        const uniqueSizes = [...new Map(sizesForColor.map(item => [item['name'], item])).values()];

        if (uniqueSizes.length > 0) {
            sizeOptionsContainer.style.display = 'block';
            sizeOptionsDiv.innerHTML = uniqueSizes.map(size => {
                const variant = productData.variants.find(v => v.color?.name === selectedColor && v.size?.name === size.name);
                const isDisabled = !variant || variant.stock === 0;
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
        updateButtonState();
    }

    // --- 7. تحديث حالة الزر والمخزون ---
    function updateButtonState() {
        const hasColorOptions = productData.variants.some(v => v.color);
        const hasSizeOptions = productData.variants.some(v => v.size);

        if ((hasColorOptions && !selectedColor) || (hasSizeOptions && !selectedSize)) {
            selectedVariant = null;
        } else {
            selectedVariant = productData.variants.find(v => 
                (!hasColorOptions || v.color?.name === selectedColor) &&
                (!hasSizeOptions || v.size?.name === selectedSize)
            );
        }
        
        if (selectedVariant) {
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
            addToCartBtn.textContent = 'اختر الخيارات للإضافة';
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
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify({
                    variant_id: selectedVariant.id,
                    quantity: quantityInput.value
                })
            });
            const data = await response.json();
            if (response.ok) {
                showNotification(data.message || 'تمت الإضافة بنجاح!', 'success');
                // ▼▼▼ هذا هو السطر الذي يقوم بتحديث العدد ▼▼▼
                updateCartCount();
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
                mainImage.src = this.src;
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
        if (thumbnails[0]) {
           thumbnails[0].classList.add('active');
        }
    }
    
    // ▼▼▼▼▼ أضف هذه الدالة الجديدة بالكامل في نهاية الملف (قبل السطر الأخير) ▼▼▼▼▼
    async function updateCartCount() {
        try {
            const response = await fetch('/api/cart/');
            if (!response.ok) return;

            const carts = await response.json();
            let totalQuantity = 0;

            // إذا كان المستخدم لديه سلة، قم بحساب الكمية الإجمالية
            if (carts.length > 0) {
                const cart = carts[0];
                cart.items.forEach(item => {
                    totalQuantity += item.quantity;
                });
            }
            
            // تحديث العدد في القائمة العلوية للكمبيوتر والجوال
            const cartCountDesktop = document.getElementById('cart-count');
            const cartCountMobile = document.getElementById('cart-count-mobile');
            if (cartCountDesktop) cartCountDesktop.textContent = totalQuantity;
            if (cartCountMobile) cartCountMobile.textContent = totalQuantity;
            
        } catch (error) {
            console.error('Failed to update cart count:', error);
        }
    }
    // ▲▲▲▲▲ نهاية الدالة الجديدة ▲▲▲▲▲

    // --- 11. بدء كل شيء ---
    fetchProductData();
    updateCartCount(); // <-- وأضفنا هذا السطر ليتم تحديث العدد عند تحميل الصفحة
});