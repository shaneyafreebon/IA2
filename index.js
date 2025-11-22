/*Show Hidden - Password*/
const showHiddenPass = (inputPass, inputIcon) =>{
    const input = document.getElementById(inputPass),
          iconEye = document.getElementById(inputIcon)
    iconEye.addEventListener('click', () =>{
        /* Change password to text */
        if(input.type === 'password'){
            /* Switch to text */
            input.type = 'text'

            /* Add icon */
            iconEye.classList.add('ri-eye-line')

            /* Remove Icon */
            iconEye.classList.remove('ri-eye-off-line')
        }else{
            /* Change to password */
            input.type = 'password'

             /* Remove Icon */
            iconEye.classList.remove('ri-eye-line')

             /* Add icon */
            iconEye.classList.add('ri-eye-off-line')

        }
    })

}

showHiddenPass('input-pass','input-icon')

/*Account Creation Functionality*/
document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.querySelector('.login__button-ghost');
    const loginButton = document.querySelector('.login__button:not(.login__button-ghost)');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.getElementById('input-pass');
    
    /* Sign Up Button Click Handler - Navigate to signup section */
    signUpButton.addEventListener('click', function(e) {
        e.preventDefault();
        showSignupSection();
    });
    
    /* Login Button Click Handler */
    loginButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            alert('Please fill in both email and password fields.');
            return;
        }
        
        /* Simulate login */
        loginUser(email, password);
    });
    
    /* Setup forgot password link/modal */
    setupForgotPassword();
});

/* Forgot Password: responsive modal and simulated reset */
function setupForgotPassword() {
    const forgotLink = document.querySelector('.login__forgot');
    if (!forgotLink) return;

    forgotLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotModal();
    });
}

function showForgotModal() {
    /* Prevent multiple modals */
    if (document.getElementById('forgot-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'forgot-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.45)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '2000';

    const modal = document.createElement('div');
    modal.style.width = 'min(420px, 92%)';
    modal.style.background = '#fff';
    modal.style.borderRadius = '10px';
    modal.style.padding = '1.25rem';
    modal.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
    modal.innerHTML = `
        <h2 style="margin-top:0;margin-bottom:0.5rem;font-size:1.2rem;">Reset Password</h2>
        <p style="margin-top:0;margin-bottom:1rem;color:#444;font-size:0.95rem;">Enter the email for your account and we'll send a password reset link.</p>
        <label style="display:block;font-size:0.85rem;margin-bottom:0.25rem;">Email</label>
        <input id="forgot-email" type="email" placeholder="you@example.com" style="width:100%;padding:0.6rem;border:1px solid #ddd;border-radius:6px;margin-bottom:0.75rem;">
        <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
            <button id="forgot-cancel" style="background:transparent;border:1px solid #ccc;padding:0.5rem 0.75rem;border-radius:6px;cursor:pointer;">Cancel</button>
            <button id="forgot-send" style="background:#2ecc71;color:#fff;border:none;padding:0.55rem 0.9rem;border-radius:6px;cursor:pointer;">Send Reset Link</button>
        </div>
        <p id="forgot-message" style="margin-top:0.75rem;color:#444;font-size:0.9rem;display:none;"></p>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    /* Focus input */
    const emailInput = document.getElementById('forgot-email');
    setTimeout(() => emailInput && emailInput.focus(), 50);

    /* Event listeners */
    document.getElementById('forgot-cancel').addEventListener('click', closeForgotModal);
    document.getElementById('forgot-send').addEventListener('click', handleForgotSubmit);

    /* Close on overlay click (but not when clicking modal) */
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeForgotModal();
    });

    /* Close on ESC */
    const escHandler = (e) => { if (e.key === 'Escape') closeForgotModal(); };
    document.addEventListener('keydown', escHandler);

    /* Store handler so we can remove it later */
    overlay._escHandler = escHandler;
}

function closeForgotModal() {
    const overlay = document.getElementById('forgot-overlay');
    if (!overlay) return;
    const escHandler = overlay._escHandler;
    if (escHandler) document.removeEventListener('keydown', escHandler);
    overlay.remove();
}

function handleForgotSubmit() {
    const emailEl = document.getElementById('forgot-email');
    const msgEl = document.getElementById('forgot-message');
    if (!emailEl || !msgEl) return;
    const email = emailEl.value.trim();
    if (!isValidEmail(email)) {
        msgEl.style.display = 'block';
        msgEl.style.color = 'crimson';
        msgEl.textContent = 'Please enter a valid email address.';
        return;
    }

    /* Check accounts */
    const accounts = JSON.parse(localStorage.getItem('hairapyAccounts')) || [];
    const account = accounts.find(a => a.email === email);

    if (!account) {
        msgEl.style.display = 'block';
        msgEl.style.color = '#333';
        msgEl.textContent = 'No account found with that email. You can create one using Sign Up.';
        return;
    }

    /* Simulate sending a reset link: create a token and save a resetRequests object */
    const token = Math.random().toString(36).slice(2, 12);
    const resetRequests = JSON.parse(localStorage.getItem('hairapyResetRequests')) || {};
    resetRequests[email] = { token, requestedAt: new Date().toISOString() };
    localStorage.setItem('hairapyResetRequests', JSON.stringify(resetRequests));

    msgEl.style.display = 'block';
    msgEl.style.color = 'green';
    msgEl.textContent = 'A password reset link has been (simulated) sent to your email. Check your inbox.';

    /* Auto-close after short delay */
    setTimeout(() => {
        closeForgotModal();
        /* Do not show a popup to the user; token is saved in localStorage for testing. */
        console.log('Reset link simulated. Token:', token);
    }, 1300);
}

/* Navigation Functions */
function showSignupSection() {
    /* Hide the current login form */
    document.querySelector('.login__form').style.display = 'none';
    
    /* Create or show signup section */
    let signupSection = document.getElementById('signupSection');
    if (!signupSection) {
        createSignupSection();
    } else {
        signupSection.style.display = 'flex';
    }
}

function showLoginSection() {
    /* Show login form */
    document.querySelector('.login__form').style.display = 'flex';
    
    /* Hide signup section */
    const signupSection = document.getElementById('signupSection');
    if (signupSection) {
        signupSection.style.display = 'none';
    }
}

function createSignupSection() {
    const loginContent = document.querySelector('.login__content');
    
    /* Create signup form HTML with improved spacing and width */
    const signupHTML = `
        <form id="signupSection" class="login__form signup__form" style="display: flex;">
            <div style="margin-bottom: 1.5rem;">
                <h1 class="login__title" style="font-size: 2rem; margin-bottom: 0.8rem; text-align: center;">
                    Create Your <span>Account</span>
                </h1>
                <p class="login__description" style="font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center;">
                    Join Neya's Hairapy today!
                </p>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div class="login__inputs" style="gap: 1.2rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; gap: 1.2rem;">
                        <div style="flex: 1;">
                            <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">First Name</label>
                            <input type="text" id="signup-firstname" placeholder="First name" required class="login__input" style="padding: 0.8rem; width: 100%;">
                        </div>
                        <div style="flex: 1;">
                            <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">Last Name</label>
                            <input type="text" id="signup-lastname" placeholder="Last name" required class="login__input" style="padding: 0.8rem; width: 100%;">
                        </div>
                    </div>

                    <div>
                        <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">Email Address</label>
                        <input type="email" id="signup-email" placeholder="Enter email" required class="login__input" style="padding: 0.8rem; width: 100%;">
                    </div>

                    <div>
                        <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">Phone Number</label>
                        <input type="tel" id="signup-phone" placeholder="Enter phone" required class="login__input" style="padding: 0.8rem; width: 100%;">
                    </div>

                    <div style="display: flex; gap: 1.2rem;">
                        <div style="flex: 1;">
                            <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">Password</label>
                            <div class="login__box">
                                <input type="password" id="signup-password" placeholder="Password" required class="login__input" style="padding: 0.8rem; width: 100%;">
                                <i class="ri-eye-off-line login__eye" id="signup-icon"></i>
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <label class="login__label" style="font-size: 0.75rem; margin-bottom: 0.5rem; display: block;">Confirm Password</label>
                            <div class="login__box">
                                <input type="password" id="signup-confirm" placeholder="Confirm" required class="login__input" style="padding: 0.8rem; width: 100%;">
                                <i class="ri-eye-off-line login__eye" id="confirm-icon"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="login__check" style="margin-bottom: 1.5rem; justify-content: center;">
                    <input type="checkbox" class="login__check-input" id="terms-checkbox" required>
                    <label for="terms-checkbox" class="login__check-label" style="font-size: 0.8rem;">I agree to Terms & Conditions</label>
                </div>
            </div>

            <div>
                <div class="login__buttons">
                    <button type="button" id="createAccountBtn" class="login__button">Create Account</button>
                    <button type="button" id="backToLoginBtn" class="login__button login__button-ghost">Back to Login</button>
                </div>
            </div>
        </form>
    `;
    
    /* Add signup section to the page */
    loginContent.insertAdjacentHTML('beforeend', signupHTML);
    
    /* Add event listeners for the new signup form */
    setupSignupEventListeners();
}

function setupSignupEventListeners() {
    /* Create Account button */
    document.getElementById('createAccountBtn').addEventListener('click', function(e) {
        e.preventDefault();
        handleSignupSubmission();
    });
    
    /* Back to Login button */
    document.getElementById('backToLoginBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showLoginSection();
    });
    
    /* Setup password toggles */
    setupPasswordToggle('signup-password', 'signup-icon');
    setupPasswordToggle('signup-confirm', 'confirm-icon');
}

function setupPasswordToggle(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (input && icon) {
        icon.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.add('ri-eye-line');
                icon.classList.remove('ri-eye-off-line');
            } else {
                input.type = 'password';
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            }
        });
    }
}

function handleSignupSubmission() {
    const firstName = document.getElementById('signup-firstname').value.trim();
    const lastName = document.getElementById('signup-lastname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirmPassword = document.getElementById('signup-confirm').value.trim();
    const termsAccepted = document.getElementById('terms-checkbox').checked;
    
    /* Validate all fields */
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }
    
    if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to create an account.');
        return;
    }
    
    /* Create account with full details */
    createAccountWithDetails(firstName, lastName, email, phone, password);
}

function createAccountWithDetails(firstName, lastName, email, phone, password) {
    /* Get existing accounts from localStorage or create empty array */
    let accounts = JSON.parse(localStorage.getItem('hairapyAccounts')) || [];
    
    /* Check if account already exists */
    const existingAccount = accounts.find(account => account.email === email);
    
    if (existingAccount) {
        alert('An account with this email already exists. Please try logging in instead.');
        return;
    }
    
    /* Create new account object */
    const newAccount = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        password: password, /* In real app, this should be hashed */
        createdDate: new Date().toISOString(),
        id: Date.now().toString()
    };
    
    /* Add to accounts array */
    accounts.push(newAccount);
    
    /* Save to localStorage */
    localStorage.setItem('hairapyAccounts', JSON.stringify(accounts));
    
    /* Store current user session */
    localStorage.setItem('currentUser', JSON.stringify(newAccount));
    /* Also keep session copy in sessionStorage (helps when files are opened locally) */
    try { sessionStorage.setItem('currentUser', JSON.stringify(newAccount)); } catch(e) {}
    
    alert(`Welcome to Neya's Hairapy, ${firstName}! Your account has been created successfully.`);
    
    /* Redirect to home page */
    window.location.href = 'home.html';
}

function clearSignupForm() {
    const fields = ['signup-firstname', 'signup-lastname', 'signup-email', 'signup-phone', 'signup-password', 'signup-confirm'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
    
    const checkbox = document.getElementById('terms-checkbox');
    if (checkbox) checkbox.checked = false;
}

/* Email validation function */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}



/* Login User Function */
function loginUser(email, password) {
    /* Get accounts from localStorage */
    const accounts = JSON.parse(localStorage.getItem('hairapyAccounts')) || [];
    
    /* Find matching account */
    const account = accounts.find(acc => acc.email === email && acc.password === password);
    
    if (account) {
        /* Store current user session */
        localStorage.setItem('currentUser', JSON.stringify(account));
        /* Also keep a session copy */
        try { sessionStorage.setItem('currentUser', JSON.stringify(account)); } catch(e) {}
        
        alert(`Welcome back to Neya's Hairapy${account.firstName ? ', ' + account.firstName : ''}!`);
        
        /* Redirect to home page */
        window.location.href = 'home.html';
    } else {
        alert('Invalid email or password. Please check your credentials or create an account.');
    }
}