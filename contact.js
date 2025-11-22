document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('sendContact');
    const form = document.getElementById('contactForm');

    function updateCartBadge() {
        try {
            const badge = document.querySelector('.cart__badge');
            const cartRaw = localStorage.getItem('cart');
            const cart = cartRaw ? JSON.parse(cartRaw) : [];
            if (badge) badge.textContent = String(cart.length || 0);
        } catch (e) {
            /* ignore */
        }
    }

    updateCartBadge();

    /* Basic email validation */
    function isEmail(v) {
        return /\S+@\S+\.\S+/.test(v);
    }

    sendBtn?.addEventListener('click', () => {
        const name = document.getElementById('cname').value.trim();
        const email = document.getElementById('cemail').value.trim();
        const message = document.getElementById('cmessage').value.trim();
        if (!name || !email || !message) { alert('Please complete all fields.'); return; }
        if (!isEmail(email)) { alert('Please provide a valid email address.'); return; }

        sendBtn.textContent = 'Sending...';
        sendBtn.disabled = true;
        /* Simulate network latency */
        setTimeout(() => {
            alert('Message sent (simulation). Thank you, ' + name + '!');
            form.reset();
            sendBtn.textContent = 'Send';
            sendBtn.disabled = false;
            updateCartBadge();
        }, 850);
    });

    /* Make nav link active if present */
    try {
        const navLinks = document.querySelectorAll('.nav__menu .nav__link');
        navLinks.forEach(a => {
            if (a.getAttribute('href') && a.getAttribute('href').includes('contact')) {
                a.classList.add('active');
            }
        });
    } catch (e) { }
});
