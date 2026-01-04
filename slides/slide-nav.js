// Slide Navigation - Keyboard & Touch Support
(function () {
    const TOTAL_SLIDES = 10;

    // 从文件名获取当前slide编号
    const path = window.location.pathname;
    const match = path.match(/slide(\d+)\.html/);
    const currentSlide = match ? parseInt(match[1]) : 1;

    // 导航函数
    function goToSlide(num) {
        if (num >= 1 && num <= TOTAL_SLIDES) {
            window.location.href = `slide${num}.html`;
        }
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }

    function nextSlide() {
        if (currentSlide < TOTAL_SLIDES) {
            goToSlide(currentSlide + 1);
        }
    }

    // 键盘事件监听
    document.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowLeft':
                prevSlide();
                break;
            case 'ArrowRight':
            case ' ': // 空格键也可以下一页
                nextSlide();
                break;
            case 'Home':
                goToSlide(1);
                break;
            case 'End':
                goToSlide(TOTAL_SLIDES);
                break;
        }
    });

    // 触摸滑动支持
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;

        // 确保是水平滑动（X方向移动大于Y方向）
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // 向右滑 = 上一页
                prevSlide();
            } else {
                // 向左滑 = 下一页
                nextSlide();
            }
        }
    }

    // 添加页码指示器
    function createPageIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'slide-indicator';
        indicator.innerHTML = `
            <span class="slide-nav-hint">← → 切换</span>
            <span class="slide-number">${currentSlide} / ${TOTAL_SLIDES}</span>
        `;
        indicator.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 20px;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            padding: 12px 24px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
        `;

        const hintStyle = indicator.querySelector('.slide-nav-hint');
        hintStyle.style.cssText = `
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
        `;

        const numStyle = indicator.querySelector('.slide-number');
        numStyle.style.cssText = `
            color: white;
            font-weight: 700;
            font-size: 1rem;
        `;

        document.body.appendChild(indicator);
    }

    // 页面加载完成后添加指示器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPageIndicator);
    } else {
        createPageIndicator();
    }
})();
