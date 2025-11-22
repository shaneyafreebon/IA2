document.addEventListener('DOMContentLoaded', () => {
    renderCheckout();

    document.getElementById('clearAllBtn')?.addEventListener('click', () => {
        if (confirm('Clear all items from cart?')) {
            localStorage.removeItem('cart');
            renderCheckout();
        }
    });

    document.getElementById('closeBtn')?.addEventListener('click', () => {
        /* navigate back to cart */
        window.location.href = 'cart.html';
    });
    /* Payment method UI wiring */
    const addPm = document.getElementById('addPaymentBtn');
    if (addPm) addPm.addEventListener('click', () => togglePaymentArea(true));
    const cancelPm = document.getElementById('cancelPaymentBtn');
    if (cancelPm) cancelPm.addEventListener('click', () => togglePaymentArea(false));
    const savePm = document.getElementById('savePaymentBtn');
    if (savePm) savePm.addEventListener('click', () => savePaymentMethod());
    renderSavedPaymentMethods();
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function togglePaymentArea(show) {
    const area = document.getElementById('payment-method-area');
    if (!area) return;
    area.style.display = show ? 'block' : 'none';
}

function getPaymentMethods() {
    return JSON.parse(localStorage.getItem('paymentMethods')) || [];
}

function savePaymentMethods(list) {
    localStorage.setItem('paymentMethods', JSON.stringify(list));
}

function validateCardNumber(num) {
    const cleaned = (num || '').replace(/\s+/g, '');
    return /^[0-9]{13,19}$/.test(cleaned);
}

function validateExpiry(exp) {
    return /^(0[1-9]|1[0-2])\/(\d{2})$/.test(exp || '');
}

function validateCvv(cvv) {
    return /^[0-9]{3,4}$/.test(cvv || '');
}

function savePaymentMethod() {
    const name = document.getElementById('pmCardName')?.value.trim();
    const number = document.getElementById('pmCardNumber')?.value.trim();
    const expiry = document.getElementById('pmExpiry')?.value.trim();
    const cvv = document.getElementById('pmCvv')?.value.trim();
    const billing = document.getElementById('pmBillingAddress')?.value.trim();

    if (!name || !number || !expiry || !cvv) {
        alert('Please complete all required payment fields.');
        return;
    }
    if (!validateCardNumber(number)) {
        alert('Please enter a valid card number (13-19 digits).');
        return;
    }
    if (!validateExpiry(expiry)) {
        alert('Please enter expiry in MM/YY format.');
        return;
    }
    if (!validateCvv(cvv)) {
        alert('Please enter a valid 3 or 4 digit CVV.');
        return;
    }

    const methods = getPaymentMethods();
    const masked = number.replace(/.(?=.{4})/g, '*');
    const method = {
        id: Date.now().toString(),
        name, number: masked, expiry, billing
    };
    methods.push(method);
    savePaymentMethods(methods);
    alert('Payment method saved.');
    togglePaymentArea(false);
    renderSavedPaymentMethods();
}

function renderSavedPaymentMethods() {
    const target = document.getElementById('savedPayments');
    if (!target) return;
    const methods = getPaymentMethods();
    if (methods.length === 0) {
        target.innerHTML = '<p>No saved payment methods.</p>';
        return;
    }
    let html = '<ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">';
    methods.forEach(m => {
        html += `<li style="display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;padding:8px;border-radius:6px;"><div><strong>${m.name}</strong><div style="font-size:0.9rem;color:#555">${m.number} • Exp: ${m.expiry}</div><div style="font-size:0.85rem;color:#666">${m.billing||''}</div></div><div><button data-id="${m.id}" class="btn btn--outline btn--remove-pm">Remove</button></div></li>`;
    });
    html += '</ul>';
    target.innerHTML = html;

    /* wire remove buttons */
    target.querySelectorAll('.btn--remove-pm').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const filtered = getPaymentMethods().filter(p => p.id !== id);
            savePaymentMethods(filtered);
            renderSavedPaymentMethods();
        });
    });
}

/* Render a selection UI if there are saved payment methods */
function renderPaymentSelectionIfNeeded() {
    const container = document.getElementById('payment-selection');
    if (!container) return;
    const methods = getPaymentMethods();
    if (!methods || methods.length === 0) {
        container.innerHTML = '';
        return;
    }

    let html = '<fieldset style="border:1px solid #eee;padding:10px;border-radius:6px;margin-bottom:12px;"><legend style="font-weight:600">Use a saved payment method</legend>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    methods.forEach(m => {
        html += `<label style="display:flex;align-items:center;gap:8px"><input type="radio" name="savedPayment" value="${m.id}"> <div><strong>${m.name}</strong><div style="font-size:0.9rem;color:#555">${m.number} • Exp: ${m.expiry}</div></div></label>`;
    });
    html += '</div>';
    html += '<div style="margin-top:8px"><button id="useSelectedPaymentBtn" class="btn btn--primary">Use Selected Payment</button> <button id="clearSelectedPaymentBtn" class="btn btn--outline">Clear Selection</button></div>';
    html += '</fieldset>';

    container.innerHTML = html;

    /* wire buttons */
    const useBtn = document.getElementById('useSelectedPaymentBtn');
    if (useBtn) useBtn.addEventListener('click', () => {
        const sel = document.querySelector('input[name="savedPayment"]:checked');
        if (!sel) { alert('Please choose a saved payment method first.'); return; }
        const id = sel.value;
        const method = getPaymentMethods().find(m => m.id === id);
        if (!method) return;
        /* populate payment form fields (CVV left blank for security) */
        document.getElementById('pmCardName').value = method.name || '';
        document.getElementById('pmCardNumber').value = method.number || '';
        document.getElementById('pmExpiry').value = method.expiry || '';
        document.getElementById('pmBillingAddress').value = method.billing || '';
        /* hide the payment area (user can still open it) */
        togglePaymentArea(false);
        alert('Saved payment method selected. Please enter CVV to proceed if required.');
    });

    const clearBtn = document.getElementById('clearSelectedPaymentBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="savedPayment"]').forEach(r => r.checked = false);
    });
}

/* Renders a unified payment options list: saved cards, PayPal, Buy now & save later */
function renderPaymentOptions() {
    const container = document.getElementById('payment-selection');
    if (!container) return;
    const methods = getPaymentMethods();
    /* Build a single select dropdown with options for saved cards, PayPal, and save-later */
    let html = `<fieldset style="border:1px solid #eee;padding:10px;border-radius:6px;margin-bottom:12px;"><legend style="font-weight:600">Select a payment method</legend>`;
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    html += '<select id="paymentOptionSelect" style="padding:8px;border-radius:6px;border:1px solid #e6e6e6;">';
    html += '<option value="">-- Choose payment method --</option>';

    if (methods && methods.length > 0) {
        methods.forEach(m => {
            /* option text: Cardholder — ****1234 • Exp: 12/24 */
            const text = `${m.name} — ${m.number} • Exp: ${m.expiry}`;
            html += `<option value="saved:${m.id}">${text}</option>`;
        });
    }

    html += '<option value="paypal">PayPal — Redirect to PayPal</option>';
    html += '<option value="savelater">Buy now & save later — Save order now</option>';
    html += '</select>';
    html += '</div>';
    html += '<div style="margin-top:8px"><button id="choosePaymentBtn" class="btn btn--primary">Choose</button></div>';
    html += '</fieldset>';

    container.innerHTML = html;

    /* wire choose button (uses select value) */
    const chooseBtn = document.getElementById('choosePaymentBtn');
    if (chooseBtn) chooseBtn.addEventListener('click', () => {
        const selVal = document.getElementById('paymentOptionSelect')?.value || '';
        if (!selVal) { alert('Please select a payment method to continue.'); return; }
        if (selVal.startsWith('saved:')) {
            const id = selVal.split(':')[1];
            const method = getPaymentMethods().find(m => m.id === id);
            if (method) {
                document.getElementById('pmCardName').value = method.name || '';
                document.getElementById('pmCardNumber').value = method.number || '';
                document.getElementById('pmExpiry').value = method.expiry || '';
                document.getElementById('pmBillingAddress').value = method.billing || '';
                /* Do not auto-open the payment area; require explicit Add Payment Method click */
                /* Focus and scroll to the Add Payment Method button so user can click it */
                const addBtn = document.getElementById('addPaymentBtn');
                if (addBtn) {
                    try { addBtn.focus(); } catch (e) {}
                    try { addBtn.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
                }
                alert('Saved card selected. Click "Add Payment Method" to enter CVV or edit the card.');
            }
            return;
        }
        if (selVal === 'paypal') {
            togglePaymentArea(false);
            alert('PayPal selected. You will be redirected after confirmation.');
            return;
        }
        if (selVal === 'savelater') {
            togglePaymentArea(false);
            alert('Order will be saved for later payment after confirmation.');
            return;
        }
    });
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
}

function formatCurrency(val) {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderCheckout() {
    const cart = getCart();
    const container = document.getElementById('checkout-container');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty. Add products then return to checkout.</p>';
        return;
    }

    let subtotal = 0;
    let rows = '';
    cart.forEach(item => {
        const price = parsePrice(item.price);
        const qty = item.quantity || 1;
        const total = price * qty;
        subtotal += total;
        rows += `<tr><td class="cart-product-image"><img src="${item.image||''}" alt="${item.name}"></td><td>${item.name}</td><td>${formatCurrency(price)}</td><td>${qty}</td><td>${formatCurrency(total)}</td></tr>`;
    });

    const discountPercent = parseFloat(localStorage.getItem('cartDiscountPercent')) || 0;
    const discountAmount = subtotal * (discountPercent/100);
    const taxRate = parseFloat(localStorage.getItem('cartTaxRate')) || 0.10;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxable * taxRate;
    const total = subtotal - discountAmount + taxAmount;

    container.innerHTML = `
        <div style="overflow:auto">
            <table class="cart-table">
                <thead><tr><th>Image</th><th>Product</th><th>Price</th><th>Qty</th><th>Amount</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div id="payment-selection"></div>
        <div class="cart-summary">
            <p><strong>Sub-total:</strong> ${formatCurrency(subtotal)}</p>
            <p><strong>Discount (${discountPercent}%):</strong> -${formatCurrency(discountAmount)}</p>
            <p><strong>Tax (${(taxRate*100).toFixed(0)}%):</strong> ${formatCurrency(taxAmount)}</p>
            <p class="cart-total"><strong>Total:</strong> ${formatCurrency(total)}</p>
        </div>

        <form id="shippingForm" style="margin-top:1rem; max-width:720px;">
            <h3>Shipping Details</h3>
            <div style="display:flex;flex-direction:column;gap:8px;">
                <input id="shipName" placeholder="Full name" class="cart-qty" required>
                <input id="shipAddress" placeholder="Shipping address" class="cart-qty" required>
                <input id="amountPaid" placeholder="Amount being paid" value="${total.toFixed(2)}" class="cart-qty" required>
            </div>
            <div style="margin-top:12px; display:flex; gap:8px;">
                <button type="button" id="confirmBtn" class="btn btn--primary">Check Out</button>
                <button type="button" id="cancelBtn" class="btn btn--outline">Cancel</button>
            </div>
        </form>

        <div id="confirmArea" style="margin-top:12px; display:none;">
            <p>Please confirm your purchase. Click Confirm to finalize or Cancel to return.</p>
            <div style="display:flex;gap:8px;">
                <button id="finalConfirm" class="btn btn--primary">Confirm</button>
                <button id="finalCancel" class="btn btn--outline">Cancel</button>
            </div>
        </div>
    `;

    /* After rendering, show payment option choices (saved cards, PayPal, save for later) */
    renderPaymentOptions();

    /* wire form buttons */
    document.getElementById('confirmBtn').addEventListener('click', () => {
        /* basic validation */
        const name = document.getElementById('shipName').value.trim();
        const address = document.getElementById('shipAddress').value.trim();
        const amt = parseFloat(document.getElementById('amountPaid').value) || 0;
        if (!name || !address) {
            alert('Please enter your name and shipping address.');
            return;
        }
        if (amt <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }
        /* show confirm area */
        document.getElementById('confirmArea').style.display = 'block';
    });

    document.getElementById('cancelBtn').addEventListener('click', () => {
        /* return to cart */
        window.location.href = 'cart.html';
    });

    document.getElementById('finalCancel').addEventListener('click', () => {
        document.getElementById('confirmArea').style.display = 'none';
    });

    document.getElementById('finalConfirm').addEventListener('click', () => {
        /* finalize: branch behavior by selected payment option */
        const amt = parseFloat(document.getElementById('amountPaid').value) || 0;
        if (amt < total - 0.001) {
            if (!confirm('Paid amount is less than total. Proceed anyway?')) return;
        }

        const selected = document.querySelector('input[name="paymentOption"]:checked')?.value || '';

        const orderBase = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: cart,
            subtotal, discountPercent, discountAmount, taxRate, taxAmount, total,
            shipping: {
                name: document.getElementById('shipName').value.trim(),
                address: document.getElementById('shipAddress').value.trim(),
            },
        };

        if (selected.startsWith('saved:')) {
            const id = selected.split(':')[1];
            const method = getPaymentMethods().find(m => m.id === id) || null;
            const order = Object.assign({}, orderBase, { paymentMethod: method? method.name : 'card', paid: amt, status: 'paid' });
            try { localStorage.setItem('lastOrder', JSON.stringify(order)); } catch(e){}
            localStorage.removeItem('cart');
            alert('Payment charged to saved card. Thank you!');
            window.location.href = 'home.html';
            return;
        }

        if (selected === 'paypal') {
            /* Simulate redirect */
            alert('You will be redirected to PayPal (simulation).');
            const order = Object.assign({}, orderBase, { paymentMethod: 'paypal', paid: amt, status: 'paid' });
            try { localStorage.setItem('lastOrder', JSON.stringify(order)); } catch(e){}
            localStorage.removeItem('cart');
            window.location.href = 'home.html';
            return;
        }

        if (selected === 'savelater') {
            const order = Object.assign({}, orderBase, { paymentMethod: 'save-later', paid: 0, status: 'saved' });
            try { localStorage.setItem('lastOrder', JSON.stringify(order)); } catch(e){}
            alert('Order saved for later. You can complete payment from your orders.');
            /* do not clear cart so user can still modify or checkout later */
            window.location.href = 'home.html';
            return;
        }

        /* Default: no payment option selected — treat as direct card entry */
        const order = Object.assign({}, orderBase, { paymentMethod: 'card-entry', paid: amt, status: 'paid' });
        try { localStorage.setItem('lastOrder', JSON.stringify(order)); } catch(e){}
        localStorage.removeItem('cart');
        alert('Purchase confirmed. Thank you!');
        window.location.href = 'home.html';
    });
}
