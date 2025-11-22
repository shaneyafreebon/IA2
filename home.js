document.addEventListener('DOMContentLoaded', function() {
    /* Initialize page */
    initializePage();
    
    /* Setup event listeners */
    setupEventListeners();
    
    /* Display user info */
    displayUserInfo();
});

/* Footer layout handled via CSS (no JS adjustment required) */


function initializePage() {
    /* Smooth scrolling for navigation links */
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    /* Mobile menu toggle (opens/closes mobile drawer) */
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const open = document.body.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }
}

function setupEventListeners() {
    /* Logout functionality */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    /* Add to cart buttons */
    const cartButtons = document.querySelectorAll('.btn--cart');
    cartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
    
    /* Search functionality */
    const searchIcon = document.querySelector('.ri-search-line');
    if (searchIcon) {
        searchIcon.addEventListener('click', handleSearch);
    }
    
    /* Cart icon click */
    const cartIcon = document.querySelector('.ri-shopping-cart-line');
    if (cartIcon) {
        cartIcon.addEventListener('click', handleCartClick);
    }

    /* View All toggle (inline) */
    const viewAllBtn = document.getElementById('viewAllBtn');
    const allProductsSection = document.getElementById('all-products');
    const featuredGrid = document.querySelector('#products .products__grid');
    if (viewAllBtn && allProductsSection && featuredGrid) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const showingAll = allProductsSection.classList.contains('active');
            if (!showingAll) {
                allProductsSection.style.display = 'block';
            allProductsSection.classList.add('active');
                allProductsSection.setAttribute('aria-hidden', 'false');
                featuredGrid.classList.add('hidden');
                viewAllBtn.textContent = 'Show Featured';
            } else {
                allProductsSection.style.display = 'none';
                allProductsSection.classList.remove('active');
                allProductsSection.setAttribute('aria-hidden', 'true');
                featuredGrid.classList.remove('hidden');
                viewAllBtn.textContent = 'View All Products';
                featuredGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
}

function displayUserInfo() {
    /* Get user data from localStorage (fallback to sessionStorage for local file use) */
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (e) {
        currentUser = null;
    }

    /* If not in localStorage, try sessionStorage (helps when files are opened using file://) */
    if (!currentUser) {
        try {
            const s = JSON.parse(sessionStorage.getItem('currentUser')) || null;
            if (s) {
                currentUser = s;
                /* restore to localStorage for consistency */
                try { localStorage.setItem('currentUser', JSON.stringify(s)); } catch (e) {}
            }
        } catch (e) {}
    }
    const userNameElement = document.getElementById('userName');
    
    if (currentUser && userNameElement) {
        if (currentUser.firstName) {
            userNameElement.textContent = `Welcome, ${currentUser.firstName}!`;
        } else {
            userNameElement.textContent = `Welcome, ${currentUser.email}!`;
        }
    } else {
        /* Only redirect to login for protected pages (home, cart, checkout) */
        const path = window.location.pathname.toLowerCase();
        const protectedPages = ['home.html', 'cart.html', 'checkout'];
        const isProtected = protectedPages.some(p => path.endsWith(p));

        if (isProtected) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        } else {
            /* Public pages (e.g., about.html) should not force a redirect. */
            if (userNameElement) userNameElement.textContent = 'Welcome!';
        }
    }
}

function handleLogout() {
    /* Confirm logout */
    if (confirm('Are you sure you want to logout?')) {
        /* Clear current user session */
        localStorage.removeItem('currentUser');
        
        /* Show logout message */
        alert('You have been logged out successfully.');
        
        /* Redirect to login page after logout */
        window.location.href = 'index.html';
    }
}

function handleAddToCart(event) {
    const productCard = event.target.closest('.product__card');
    if (!productCard) return;
    
    const productName = productCard.querySelector('.product__name').textContent;
    const productPrice = productCard.querySelector('.product__price').textContent;
    
    /* Get current cart from localStorage */
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    /* Create product object */
    const product = {
        id: Date.now().toString(),
        name: productName,
        price: productPrice,
        image: productCard.querySelector('.product__img') ? productCard.querySelector('.product__img').src : '',
        quantity: 1,
        addedDate: new Date().toISOString()
    };
    
    /* Check if product already exists in cart */
    const existingProduct = cart.find(item => item.name === productName);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
        alert(`${productName} quantity updated in cart!`);
    } else {
        cart.push(product);
        alert(`${productName} added to cart!`);
    }
    
    /* Save cart to localStorage */
    localStorage.setItem('cart', JSON.stringify(cart));
    
    /* Update cart badge */
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.querySelector('.cart__badge');
    
    if (cartBadge) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }
}

function handleSearch() {
    const searchTerm = prompt('What are you looking for?');
    if (searchTerm) {
        alert(`Searching for: "${searchTerm}". Search functionality coming soon!`);
    }
}

function handleCartClick() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty. Add some products to get started!');
    } else {
        window.location.href = 'cart.html';
    }
}

/* Initialize cart badge on page load */
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
});

/* Header scroll effect */
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

/* Service cards hover effect */
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service__card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceTitle = this.querySelector('.service__title').textContent;
            alert(`Booking for ${serviceTitle} coming soon! Call us at (555) 123-4567 to schedule.`);
        });
    });
});

/* Entrance & cute animations */
document.addEventListener('DOMContentLoaded', function() {
    /* Hero slide-in */
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) setTimeout(() => heroContent.classList.add('in-view'), 120);

    /* CTA pulse (run a few times) */
    const cta = document.querySelector('.btn--primary');
    if (cta) {
        cta.classList.add('pulse');
        cta.addEventListener('animationend', () => cta.classList.remove('pulse'));
    }

    /* Product cards staggered reveal */
    const prodOptions = { threshold: 0.12, rootMargin: '0px 0px -50px 0px' };
    const prodObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                /* compute index for a gentle stagger */
                const all = Array.from(document.querySelectorAll('.product__card'));
                const idx = all.indexOf(el);
                el.style.transitionDelay = (idx * 80) + 'ms';
                el.classList.add('in-view');
                obs.unobserve(el);
            }
        });
    }, prodOptions);

    document.querySelectorAll('.product__card').forEach(card => {
        prodObserver.observe(card);
    });

    /* Footer fade-in */
    const footer = document.querySelector('.footer');
    if (footer) {
        const fObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('in-view');
            });
        }, { threshold: 0.05 });
        fObs.observe(footer);
    }
});