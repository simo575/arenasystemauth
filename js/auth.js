/* ============================================
   AUTHX — AUTH.JS
   Login & Register form logic
   ============================================ */

'use strict';

/* ============================================
   UTILITIES
   ============================================ */
function $(id) { return document.getElementById(id); }
function setError(fieldId, msg) {
    const fg = document.getElementById('fg' + fieldId) || document.getElementById('fg' + fieldId.charAt(0).toUpperCase() + fieldId.slice(1));
    const errEl = document.getElementById(fieldId + 'Error') || document.getElementById(fieldId.charAt(0).toLowerCase() + fieldId.slice(1) + 'Error');
    const input = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (errEl) errEl.textContent = msg ? '⚠ ' + msg : '';
    if (input) input.classList.toggle('invalid', !!msg);
    if (input) input.classList.toggle('valid', !msg && input.value.length > 0);
    const statusEl = input?.parentElement?.querySelector('.input-status');
    if (statusEl) {
        statusEl.textContent = msg ? '✕' : (input.value ? '✓' : '');
        statusEl.className   = 'input-status ' + (msg ? 'err' : (input.value ? 'ok' : ''));
    }
}
function clearError(fieldId) { setError(fieldId, ''); }
function showAlert(id, message, type = 'error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `auth-alert ${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'error' ? 'circle-xmark' : 'circle-check'}"></i> ${message}`;
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}
function setLoading(btnId, loading) {
    const btn     = document.getElementById(btnId);
    if (!btn) return;
    const text    = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled  = loading;
    if (text)    text.style.display    = loading ? 'none'  : 'inline';
    if (spinner) spinner.style.display = loading ? 'inline': 'none';
}

/* Fake async delay (replace with real API calls) */
const fakeDelay = (ms = 1400) => new Promise(r => setTimeout(r, ms));

/* ============================================
   PASSWORD TOGGLE
   ============================================ */
function initPasswordToggle(toggleId, inputId) {
    const btn   = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
        const isPass = input.type === 'password';
        input.type   = isPass ? 'text' : 'password';
        btn.querySelector('i').className = `fas fa-eye${isPass ? '-slash' : ''}`;
    });
}
initPasswordToggle('togglePass',    'password');
initPasswordToggle('toggleRegPass', 'regPassword');

/* ============================================
   PASSWORD STRENGTH METER
   ============================================ */
const regPassInput = document.getElementById('regPassword');
if (regPassInput) {
    regPassInput.addEventListener('input', () => {
        const val   = regPassInput.value;
        const score = getPasswordScore(val);
        updateStrengthUI(score);
    });
}

function getPasswordScore(pass) {
    let score = 0;
    if (pass.length >= 8)  score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return Math.min(score, 4);
}

function updateStrengthUI(score) {
    const bars   = ['bar1','bar2','bar3','bar4'].map(id => document.getElementById(id));
    const label  = document.getElementById('strengthLabel');
    const levels = [
        { text: 'Too weak',   cls: 'weak'   },
        { text: 'Weak',       cls: 'weak'   },
        { text: 'Fair',       cls: 'medium' },
        { text: 'Strong',     cls: 'strong' },
        { text: 'Very strong',cls: 'strong' },
    ];
    bars.forEach((bar, i) => {
        if (!bar) return;
        bar.className = 'bar';
        if (i < score) bar.classList.add(levels[score]?.cls || 'weak');
    });
    if (label) {
        label.textContent = score === 0 ? 'Enter password' : levels[score]?.text;
        const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#22c55e' };
        label.style.color = colors[levels[score]?.cls] || 'var(--text3)';
    }
}

/* ============================================
   REAL-TIME FIELD VALIDATION
   ============================================ */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validateUsername(name) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name);
}

// Login fields
['username', 'password'].forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('input', () => clearError(id));
        input.addEventListener('blur', () => {
            if (!input.value.trim()) setError(id, 'This field is required');
        });
    }
});

// Register fields real-time
const regFields = [
    { id: 'firstname',   validate: v => v.trim().length >= 2,        msg: 'Must be at least 2 characters' },
    { id: 'lastname',    validate: v => v.trim().length >= 2,        msg: 'Must be at least 2 characters' },
    { id: 'regUsername', validate: validateUsername,                  msg: 'Only letters, numbers, _ (3-20 chars)' },
    { id: 'regEmail',    validate: validateEmail,                     msg: 'Enter a valid email address' },
];

regFields.forEach(({ id, validate, msg }) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => {
        if (input.value.length > 0) {
            validate(input.value) ? clearError(id) : setError(id, msg);
        }
    });
    input.addEventListener('blur', () => {
        if (!input.value.trim()) setError(id, 'This field is required');
        else if (!validate(input.value)) setError(id, msg);
    });
});

// Confirm password
const confirmPassInput = document.getElementById('confirmPass');
const regPasswordInput = document.getElementById('regPassword');
if (confirmPassInput && regPasswordInput) {
    confirmPassInput.addEventListener('input', () => {
        if (confirmPassInput.value.length > 0) {
            if (confirmPassInput.value !== regPasswordInput.value) {
                setError('confirmPass', 'Passwords do not match');
            } else {
                clearError('confirmPass');
            }
        }
    });
}

/* ============================================
   LOGIN FORM SUBMIT
   ============================================ */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('loginAlert');

        const username = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value;
        let valid = true;

        if (!username) { setError('username', 'Please enter your username or email'); valid = false; }
        if (!password) { setError('password', 'Please enter your password'); valid = false; }
        if (password && password.length < 4) { setError('password', 'Password is too short'); valid = false; }

        if (!valid) return;

        setLoading('loginBtn', true);

        try {
            // Simulate API call — replace with real fetch()
            await fakeDelay();

            // Demo: accept any credentials for preview
            if (username && password) {
                showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
            }
        } catch (err) {
            showAlert('loginAlert', 'Something went wrong. Please try again.', 'error');
        } finally {
            setLoading('loginBtn', false);
        }
    });
}

/* ============================================
   REGISTER FORM SUBMIT
   ============================================ */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('registerAlert');

        const firstname  = document.getElementById('firstname')?.value.trim();
        const lastname   = document.getElementById('lastname')?.value.trim();
        const username   = document.getElementById('regUsername')?.value.trim();
        const email      = document.getElementById('regEmail')?.value.trim();
        const password   = document.getElementById('regPassword')?.value;
        const confirm    = document.getElementById('confirmPass')?.value;
        const agree      = document.getElementById('agreeTerms')?.checked;
        let valid = true;

        if (!firstname || firstname.length < 2) { setError('firstname', 'First name is required (min 2 chars)'); valid = false; }
        if (!lastname  || lastname.length  < 2) { setError('lastname',  'Last name is required (min 2 chars)');  valid = false; }
        if (!validateUsername(username))         { setError('regUsername', 'Only letters, numbers, _ (3-20 chars)'); valid = false; }
        if (!validateEmail(email))               { setError('regEmail', 'Enter a valid email address'); valid = false; }
        if (!password || password.length < 8)   { setError('regPassword', 'Password must be at least 8 characters'); valid = false; }
        if (password !== confirm)                { setError('confirmPass', 'Passwords do not match'); valid = false; }
        if (!agree) {
            showAlert('registerAlert', 'You must accept the Terms of Service to continue.', 'error');
            valid = false;
        }

        if (!valid) return;

        setLoading('registerBtn', true);

        try {
            await fakeDelay(1600);

            // Demo success
            showAlert('registerAlert', `Account created! Welcome, ${firstname}! Redirecting...`, 'success');

            // Update step indicators
            const step1 = document.getElementById('step-1-indicator');
            const step2 = document.getElementById('step-2-indicator');
            if (step1) { step1.classList.remove('active'); step1.classList.add('done'); }
            if (step2) step2.classList.add('active');

            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1800);
        } catch (err) {
            showAlert('registerAlert', 'Registration failed. Please try again.', 'error');
        } finally {
            setLoading('registerBtn', false);
        }
    });
}

/* ============================================
   SOCIAL AUTH BUTTONS (demo)
   ============================================ */
document.getElementById('githubBtn')?.addEventListener('click', () => {
    showOAuthPopup('GitHub');
});
document.getElementById('googleBtn')?.addEventListener('click', () => {
    showOAuthPopup('Google');
});

function showOAuthPopup(provider) {
    // In production: redirect to OAuth provider
    const btn = document.querySelector(`[id*="${provider.toLowerCase()}"]`);
    if (btn) {
        btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Connecting to ${provider}...`;
        btn.disabled = true;
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = `<i class="fab fa-${provider.toLowerCase()}"></i> Continue with ${provider}`;
            // Show a fake "coming soon" message
            const alertId = document.getElementById('loginAlert') ? 'loginAlert' : 'registerAlert';
            showAlert(alertId, `${provider} OAuth is not configured yet. Use email login.`, 'error');
        }, 1500);
    }
}
