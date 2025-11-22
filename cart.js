document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    /* Checkout button (placeholder) */
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                /* navigate to the dedicated checkout page which reads cart from localStorage */
                window.location.href = 'checkout.html';
        });
    }
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    /* update global badge if function exists */
    if (typeof updateCartBadge === 'function') updateCartBadge();
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    /* remove any non-numeric except dot and minus */
    const cleaned = priceStr.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
}

function formatCurrency(val) {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-container');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. Add some products to get started.</p>';
        return;
    }

    let html = '';
    html += '<table class="cart-table">';
    html += '<thead><tr><th class="col-image">Image</th><th>Product</th><th>Price</th><th>Quantity</th><th>Sub-total</th><th>Actions</th></tr></thead>';
    html += '<tbody>';

    let subtotal = 0;

    cart.forEach((item, index) => {
        const price = parsePrice(item.price);
        const qty = item.quantity || 1;
        const itemTotal = price * qty;
        subtotal += itemTotal;

        html += `<tr class="cart-row" data-index="${index}">`;
        html += `<td class="cart-product-image"><img src="${item.image || ''}" alt="${item.name}" /></td>`;
        html += `<td class="cart-product-name">${item.name}</td>`;
        html += `<td class="cart-price">${formatCurrency(price)}</td>`;
        html += `<td><input type="number" min="1" value="${qty}" class="cart-qty" data-index="${index}"></td>`;
        html += `<td class="cart-item-total">${formatCurrency(itemTotal)}</td>`;
        html += `<td><button class="btn btn--outline btn--remove" data-index="${index}">Remove</button></td>`;
        html += `</tr>`;
    });

    html += '</tbody></table>';

    /* Discounts and tax (simple defaults) */
    const discountPercent = parseFloat(localStorage.getItem('cartDiscountPercent')) || 0; // percent
    const discountAmount = subtotal * (discountPercent / 100);
    const taxRate = parseFloat(localStorage.getItem('cartTaxRate')) || 0.10; // default 10%
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxable * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    html += '<div class="cart-summary">';
    html += `<p><strong>Sub-total:</strong> ${formatCurrency(subtotal)}</p>`;
    html += `<p><strong>Discount (${discountPercent}%):</strong> -${formatCurrency(discountAmount)}</p>`;
    html += `<p><strong>Tax (${(taxRate*100).toFixed(0)}%):</strong> ${formatCurrency(taxAmount)}</p>`;
    html += `<p class="cart-total"><strong>Total:</strong> ${formatCurrency(total)}</p>`;
    html += '</div>';

    container.innerHTML = html;

    /* Attach listeners for quantity changes and remove buttons */
    document.querySelectorAll('.cart-qty').forEach(input => {
        input.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            const newQty = parseInt(e.target.value) || 1;
            updateQuantity(idx, newQty);
        });
    });

    document.querySelectorAll('.btn--remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'));
            removeItem(idx);
        });
    });
}

function updateQuantity(index, newQty) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].quantity = newQty;
    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    let cart = getCart();
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

/* Expose helper for potential future use */
window.cartHelpers = {
    getCart,
    saveCart,
    renderCart
};