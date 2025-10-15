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
            
            // ▼▼▼ هذا هو الاستدعاء الجديد لعرض تفاصيل الكتاب ▼▼▼
            displayBookDetails(productData);
            // ▲▲▲ نهاية الاستدعاء الجديد ▲▲▲

            displayInitialPrice(); 
            renderColorOptions();
            updateButtonState();
        } catch (error) {
            console.error(error);
            priceSection.innerHTML = `<p>حدث خطأ في تحميل بيانات المنتج.</p>`;
        }
    }

    // ▼▼▼▼▼ أضفنا هذه الدالة الجديدة بالكامل ▼▼▼▼▼
    function displayBookDetails(product) {
        const bookDetailsSection = document.getElementById('book-details-section');
        if (!bookDetailsSection) return; // تأكد من وجود العنصر

        // إذا لم يكن المنتج كتابًا (لا يوجد مؤلف)، قم بإخفاء قسم تفاصيل الكتاب
        if (!product.author) {
            bookDetailsSection.style.display = 'none';
            return;
        }

        // إذا كان المنتج كتابًا، أظهر القسم واملأ البيانات
        bookDetailsSection.style.display = 'block';
        document.getElementById('product-author').textContent = product.author || 'غير متوفر';
        document.getElementById('product-publisher').textContent = product.publisher || 'غير متوفر';
        document.getElementById('product-publication-date').textContent = product.publication_date || 'غير متوفر';
        document.getElementById('product-page-count').textContent = product.page_count || 'غير متوفر';
        document.getElementById('product-isbn').textContent = product.isbn || 'غير متوفر';
    }
    // ▲▲▲▲▲ نهاية الدالة الجديدة ▲▲▲▲▲

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
        // ... (الكود هنا يبقى كما هو بدون تغيير) ...
    }
    
    // --- 8. إضافة النسخة المحددة إلى السلة ---
    addToCartBtn.addEventListener('click', async () => {
        // ... (الكود هنا يبقى كما هو بدون تغيير) ...
    });

    // ... (باقي دوال التحكم بالكمية ومعرض الصور تبقى كما هي) ...

    async function updateCartCount() {
        // ... (الكود هنا يبقى كما هو بدون تغيير) ...
    }

    // --- 11. بدء كل شيء ---
    fetchProductData();
    updateCartCount();
});