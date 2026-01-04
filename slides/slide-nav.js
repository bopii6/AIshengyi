// Slide Navigation - Keyboard & Touch Support with Smooth Transitions
(function () {
    const TOTAL_SLIDES = 10;
    let isTransitioning = false;

    // 从文件名获取当前slide编号
    const path = window.location.pathname;
    const match = path.match(/slide(\d+)\.html/);
    const currentSlide = match ? parseInt(match[1]) : 1;

    // 创建过渡遮罩层
    function createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'slide-transition';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: #0a0a0a;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease-out;
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    const overlay = createTransitionOverlay();

    // 页面加载时淡入效果
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-out';

    window.addEventListener('load', function () {
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    });

    // 带过渡效果的导航函数
    function goToSlide(num, direction = 'right') {
        if (num < 1 || num > TOTAL_SLIDES || isTransitioning) return;
        if (num === currentSlide) return;

        isTransitioning = true;

        // 添加滑动方向的动画
        const slideContent = document.querySelector('.slide') || document.body;
        const slideDirection = direction === 'right' ? '-30px' : '30px';

        // 淡出 + 轻微滑动
        slideContent.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
        slideContent.style.opacity = '0';
        slideContent.style.transform = `translateX(${slideDirection})`;

        // 同时显示遮罩
        overlay.style.opacity = '1';

        // 延迟后跳转
        setTimeout(() => {
            window.location.href = `slide${num}.html`;
        }, 200);
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1, 'left');
        }
    }

    function nextSlide() {
        if (currentSlide < TOTAL_SLIDES) {
            goToSlide(currentSlide + 1, 'right');
        }
    }

    // 键盘事件监听
    document.addEventListener('keydown', function (e) {
        if (isTransitioning) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
            case ' ': // 空格键也可以下一页
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1, 'left');
                break;
            case 'End':
                e.preventDefault();
                goToSlide(TOTAL_SLIDES, 'right');
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
        if (isTransitioning) return;

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
