
// script_v2.js - Handles dynamic content for the v2 redesign

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    initScrollEffects();
});

function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Check if products data is available (loaded from products.js)
    if (typeof products === 'undefined') {
        console.error('Products data not loaded');
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-img">
                ${product.icon || '📦'}
            </div>
            <div class="product-info">
                <span class="product-tag">${product.categoryName || 'Tool'}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">¥${product.price}</span>
                    <span class="product-arrow"><i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `).join('');
}

function initScrollEffects() {
    // Simple smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 2, 18, 0.9)';
            navbar.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
        } else {
            navbar.style.background = 'rgba(0, 2, 18, 0.7)';
            navbar.style.boxShadow = 'none';
        }
    });
}
