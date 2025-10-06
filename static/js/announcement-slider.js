document.addEventListener('DOMContentLoaded', function() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');

    if (!sliderWrapper || !prevBtn || !nextBtn || !dotsContainer) {
        // توقف إذا كان أي عنصر من عناصر السلايدر غير موجود
        return; 
    }

    let currentIndex = 0;
    const totalSlides = slides.length;

    if (totalSlides === 0) return; // لا تفعل شيئًا إذا لم تكن هناك شرائح

    // --- إنشاء نقاط التنقل ---
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    }
    const dots = document.querySelectorAll('.dot');

    // --- دالة الانتقال للشريحة المحددة ---
    function goToSlide(slideIndex) {
        currentIndex = slideIndex;
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    // --- تحديث النقطة النشطة ---
    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // --- أزرار التحكم ---
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        goToSlide(currentIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        goToSlide(currentIndex);
    });

    // --- التشغيل التلقائي للسلايدر ---
    setInterval(() => {
        nextBtn.click();
    }, 5000); // تغيير الشريحة كل 5 ثواني

    // --- تفعيل أول نقطة عند التحميل ---
    goToSlide(0);
});