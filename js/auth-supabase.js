/* ============================================================
   ARENA SYSTEM AUTH — auth-supabase.js
   Login, Register, Reset Password logic using Supabase Auth
   ============================================================ */
'use strict';

const { Auth } = window.ModzAuth;

// ── UTILITIES ─────────────────────────────────────────────────
function $id(id) { return document.getElementById(id); }
function showAlert(id, msg, type = 'error') {
    const el = $id(id);
    if (!el) return;
    el.className = `ap-alert ${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'error' ? 'circle-xmark' : type === 'success' ? 'circle-check' : 'circle-info'}"></i> ${msg}`;
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideAlert(id) { const el = $id(id); if (el) el.style.display = 'none'; }
function setLoading(btnId, loading) {
    const btn = $id(btnId); if (!btn) return;
    btn.disabled = loading;
    const text = btn.querySelector('.btn-text');
    const spin = btn.querySelector('.btn-spinner');
    if (text) text.style.display = loading ? 'none' : 'inline';
    if (spin) spin.style.display = loading ? 'inline' : 'none';
}
function setFieldError(fieldId, msg) {
    const input = $id(fieldId);
    const err = $id(fieldId + 'Error');
    if (input) input.classList.toggle('invalid', !!msg);
    if (err) err.textContent = msg ? ('⚠ ' + msg) : '';
}
function clearField(fieldId) { setFieldError(fieldId, ''); }

// ── REDIRECT IF ALREADY LOGGED IN ────────────────────────────
(async () => {
    const authed = await Auth.isAuthenticated();
    if (authed && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
        window.location.href = 'dashboard.html';
    }
})();

// ── PASSWORD STRENGTH ─────────────────────────────────────────
function getPasswordScore(pass) {
    let s = 0;
    if (pass.length >= 8) s++;
    if (pass.length >= 12) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return Math.min(s, 4);
}
function updateStrengthUI(score) {
    const bars = ['bar1','bar2','bar3','bar4'].map(id => $id(id));
    const label = $id('strengthLabel');
    const lvls = [
        { text:'Too weak',    cls:'weak' },
        { text:'Weak',        cls:'weak' },
        { text:'Fair',        cls:'medium' },
        { text:'Strong',      cls:'strong' },
        { text:'Very strong', cls:'strong' },
    ];
    bars.forEach((b, i) => {
        if (!b) return;
        b.className = 'bar';
        if (i < score) b.classList.add(lvls[score]?.cls || 'weak');
    });
    if (label) {
        label.textContent = score === 0 ? 'Enter password' : lvls[score]?.text;
        label.style.color = { weak:'#ef4444', medium:'#f59e0b', strong:'#22c55e' }[lvls[score]?.cls] || '#888';
    }
}
const regPassInput = $id('regPassword');
if (regPassInput) regPassInput.addEventListener('input', () => updateStrengthUI(getPasswordScore(regPassInput.value)));

// ── PASSWORD TOGGLE ───────────────────────────────────────────
function initPwToggle(toggleId, inputId) {
    const btn = $id(toggleId), inp = $id(inputId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        btn.querySelector('i').className = `fas fa-eye${show ? '-slash' : ''}`;
    });
}
initPwToggle('togglePass', 'password');
initPwToggle('toggleRegPass', 'regPassword');
initPwToggle('toggleConfirmPass', 'confirmPass');

// ── VALIDATION ────────────────────────────────────────────────
function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validateUsername(u) { return /^[a-zA-Z0-9_]{3,20}$/.test(u); }

// Real-time validation
['username','password'].forEach(id => {
    const inp = $id(id);
    if (inp) { inp.addEventListener('input', () => clearField(id)); }
});
['firstname','lastname','regUsername','regEmail','regPassword','confirmPass'].forEach(id => {
    const inp = $id(id);
    if (inp) inp.addEventListener('input', () => clearField(id));
});

// ── LOGIN FORM ────────────────────────────────────────────────
const loginForm = $id('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('loginAlert');
        const email    = ($id('email') || $id('username'))?.value.trim();
        const password = $id('password')?.value;
        let valid = true;
        if (!email) { setFieldError('email', 'Email is required'); setFieldError('username', 'Email is required'); valid = false; }
        if (!password) { setFieldError('password', 'Password is required'); valid = false; }
        if (!valid) return;

        setLoading('loginBtn', true);
        try {
            const data = await Auth.login({ email, password });
            // Store token
            showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } catch (err) {
            const msgs = {
                'INVALID_CREDENTIALS': 'Invalid email or password.',
                'ACCOUNT_BANNED': 'Your account has been banned.',
                'NOT_FOUND': 'Account not found.',
            };
            showAlert('loginAlert', msgs[err.code] || err.message || 'Login failed. Please try again.', 'error');
        } finally {
            setLoading('loginBtn', false);
        }
    });
}

// ── REGISTER FORM ─────────────────────────────────────────────
const registerForm = $id('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert('registerAlert');

        const firstname = $id('firstname')?.value.trim();
        const lastname  = $id('lastname')?.value.trim();
        const username  = $id('regUsername')?.value.trim();
        const email     = $id('regEmail')?.value.trim();
        const password  = $id('regPassword')?.value;
        const confirm   = $id('confirmPass')?.value;
        const agree     = $id('agreeTerms')?.checked;
        let valid = true;

        if (!firstname || firstname.length < 2) { setFieldError('firstname', 'First name required (min 2 chars)'); valid = false; }
        if (!lastname  || lastname.length  < 2) { setFieldError('lastname',  'Last name required (min 2 chars)');  valid = false; }
        if (!validateUsername(username))         { setFieldError('regUsername', 'Username: 3-20 chars, letters/numbers/_'); valid = false; }
        if (!validateEmail(email))               { setFieldError('regEmail',    'Enter a valid email'); valid = false; }
        if (!password || password.length < 8)    { setFieldError('regPassword', 'Password min 8 characters'); valid = false; }
        if (password !== confirm)                { setFieldError('confirmPass', 'Passwords do not match'); valid = false; }
        if (!agree) { showAlert('registerAlert', 'You must accept the Terms of Service.', 'error'); valid = false; }
        if (!valid) return;

        setLoading('registerBtn', true);
        try {
            await Auth.register({ email, password, username, full_name: `${firstname} ${lastname}`.trim() });
            showAlert('registerAlert', `Account created successfully! Welcome, ${firstname}! Redirecting...`, 'success');
            setTimeout(() => { window.location.href = 'dashboard.html?welcome=1'; }, 1000);
        } catch (err) {
            const msgs = {
                'USERNAME_TAKEN': 'Username is already taken. Choose another.',
                'REGISTRATION_FAILED': err.message,
                'WEAK_PASSWORD': 'Password is too weak.',
                'INVALID_USERNAME': 'Username: only letters, numbers, underscores (3-20 chars).',
            };
            showAlert('registerAlert', msgs[err.code] || err.message || 'Registration failed. Please try again.', 'error');
        } finally {
            setLoading('registerBtn', false);
        }
    });
}

// ── RESET PASSWORD FORM ───────────────────────────────────────
const resetForm = $id('resetForm');
if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $id('resetEmail')?.value.trim();
        if (!validateEmail(email)) { showAlert('resetAlert', 'Enter a valid email.', 'error'); return; }
        setLoading('resetBtn', true);
        try {
            await Auth.resetPassword(email);
            showAlert('resetAlert', 'Password reset email sent! Check your inbox.', 'success');
        } catch (err) {
            showAlert('resetAlert', err.message || 'Failed to send reset email.', 'error');
        } finally {
            setLoading('resetBtn', false);
        }
    });
}

// ── URL PARAM MESSAGES ────────────────────────────────────────
(function() {
    const p = new URLSearchParams(window.location.search);
    const alertEl = $id('loginAlert') || $id('registerAlert');
    if (!alertEl) return;
    const errMap = {
        google_not_configured: 'Google OAuth is not configured.',
        oauth_failed: 'Google sign-in failed.',
        session_error: 'Session error. Please try again.',
    };
    const msg = errMap[p.get('error')];
    if (msg) {
        alertEl.className = 'ap-alert error';
        alertEl.innerHTML = `<i class="fas fa-circle-xmark"></i> ${msg}`;
        alertEl.style.display = 'flex';
    } else if (p.get('logged_out') === '1') {
        alertEl.className = 'ap-alert success';
        alertEl.innerHTML = `<i class="fas fa-circle-check"></i> You have been logged out.`;
        alertEl.style.display = 'flex';
    } else if (p.get('registered') === '1') {
        alertEl.className = 'ap-alert success';
        alertEl.innerHTML = `<i class="fas fa-circle-check"></i> Account created! Sign in to continue.`;
        alertEl.style.display = 'flex';
    }
})();
