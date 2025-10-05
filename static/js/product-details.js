document.addEventListener('DOMContentLoaded', () => {
    // --- تعريف العناصر الأساسية ---
    const productNameH1 = document.getElementById('product-name');
    const productPriceP = document.getElementById('product-price');
    const productDescriptionP = document.getElementById('product-description');
    const productImageImg = document.getElementById('product-image');
    const addToCartButton = document.getElementById('add-to-cart-btn');
    const cartCountSpan = document.getElementById('cart-count');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

    // --- 1. جلب وعرض بيانات المنتج ---
    async function fetchProductDetails() {
        try {
            // استخراج ID المنتج من رابط الصفحة الحالي
            const urlParts = window.location.pathname.split('/');
            const productId = urlParts[urlParts.length - 2];

            if (!productId) {
                throw new Error("لم يتم العثور على معرّف المنتج.");
            }

            const response = await fetch(`/api/products/${productId}/`);
            if (!response.ok) {
                throw new Error("المنتج غير موجود.");
            }
            const product = await response.json();

            // ملء بيانات المنتج في الصفحة
            productNameH1.textContent = product.name;
            productPriceP.textContent = `${product.price} درهم`;
            productDescriptionP.textContent = product.description;
            productImageImg.src = product.image || 'https://placehold.co/400x400?text=No+Image';
            
            // **هنا نقوم بتعيين ID المنتج للزر ديناميكيًا**
            if(addToCartButton) {
                addToCartButton.dataset.productId = product.id;
            }

        } catch (error) {
            productNameH1.textContent = "حدث خطأ";
            productDescriptionP.textContent = error.message;
        }
    }

    // --- 2. إدارة وظيفة "أضف إلى السلة" ---
    function updateCartCount(cartData) {
        if (!cartCountSpan || !cartData || !cartData.items) return;
        const totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;
    }

    if (addToCartButton) {
        addToCartButton.addEventListener('click', async () => {
            const button = addToCartButton;
            const productId = button.dataset.productId;
            if (!productId) {
                alert("خطأ: معرّف المنتج غير متوفر. يرجى تحديث الصفحة.");
                return;
            }
            
            const originalButtonText = button.textContent;

            try {
                button.textContent = 'جارٍ الإضافة...';
                button.disabled = true;

                const response = await fetch('/api/add-to-cart/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ product_id: productId, quantity: 1 }),
                });

                const data = await response.json();

                if (response.ok) {
                    updateCartCount(data);
                    button.textContent = '✓ تمت الإضافة';
                    button.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        button.textContent = originalButtonText;
                        button.style.backgroundColor = '';
                        button.disabled = false;
                    }, 2000);
                } else {
                    if (response.status === 401 || response.status === 403) {
                         alert('يجب تسجيل الدخول أولاً.');
                         window.location.href = '/login/';
                    } else {
                        alert(`حدث خطأ: ${data.error || 'غير معروف'}`);
                        button.textContent = originalButtonText;
                        button.disabled = false;
                    }
                }
            } catch (error) {
                alert('فشل الاتصال بالخادم.');
                button.textContent = originalButtonText;
                button.disabled = false;
            }
        });
    }

    // --- تشغيل كل شيء ---
    fetchProductDetails();
});