/* ============================================
   AUTHX — AUTHPAGE.JS
   Login & Register logic + OAuth + Canvas
   ============================================ */

'use strict';

/* ============================================
   CANVAS PARTICLES (auth pages)
   ============================================ */
(function initAuthCanvas() {
    const canvas = document.getElementById('authCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];
    const COLORS = ['34,197,94', '74,222,128', '22,163,74'];  /* orange palette */
    const COUNT  = 60;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Pt {
        constructor() { this.reset(true); }
        reset(init) {
            this.x = Math.random() * W;
            this.y = init ? Math.random() * H : H + 8;
            this.r = Math.random() * 1.5 + .4;
            this.vx = (Math.random() - .5) * .3;
            this.vy = -(Math.random() * .4 + .1);
            this.a  = Math.random() * .4 + .08;
            this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.ph = Math.random() * Math.PI * 2;
            this.ps = .018 + Math.random() * .015;
        }
        update() {
            this.ph += this.ps;
            this.vx *= .98; this.vy *= .98;
            this.x += this.vx; this.y += this.vy;
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -20) this.reset();
        }
        draw() {
            const a = this.a * (.6 + Math.sin(this.ph) * .4);
            if (this.r > 1.1) {
                const g = ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*7);
                g.addColorStop(0, `rgba(${this.c},${a*.45})`);
                g.addColorStop(1, `rgba(${this.c},0)`);
                ctx.beginPath(); ctx.arc(this.x,this.y,this.r*7,0,Math.PI*2);
                ctx.fillStyle = g; ctx.fill();
            }
            ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
            ctx.fillStyle = `rgba(${this.c},${a})`; ctx.fill();
        }
    }

    function drawLines() {
        for (let i = 0; i < pts.length; i++)
            for (let j = i+1; j < pts.length; j++) {
                const dx = pts[i].x-pts[j].x, dy = pts[i].y-pts[j].y;
                const d  = Math.sqrt(dx*dx+dy*dy);
                if (d < 100) {
                    ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y);
                    ctx.lineTo(pts[j].x,pts[j].y);
                    ctx.strokeStyle = `rgba(249,115,22,${(1-d/100)*.07})`;
                    ctx.lineWidth = .5; ctx.stroke();
                }
            }
    }

    function loop() {
        ctx.clearRect(0,0,W,H);
        drawLines();
        pts.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }

    resize();
    pts = Array.from({length:COUNT}, () => new Pt(true));
    window.addEventListener('resize', resize, {passive:true});
    loop();
})();

/* ============================================
   SESSION TIMER (login)
   ============================================ */
(function initSessionTimer() {
    const el = document.getElementById('sessionTimer');
    if (!el) return;
    let secs = 0;
    setInterval(() => {
        secs++;
        const m = String(Math.floor(secs/60)).padStart(2,'0');
        const s = String(secs%60).padStart(2,'0');
        el.textContent = `${m}:${s}`;
    }, 1000);
})();

/* ============================================
   OFFER TIMER (register) — countdown 14:55
   ============================================ */
(function initOfferTimer() {
    const el = document.getElementById('offerTimer');
    if (!el) return;
    let total = 14*60+55;
    setInterval(() => {
        if (total <= 0) { el.textContent = '00:00'; return; }
        total--;
        const m = String(Math.floor(total/60)).padStart(2,'0');
        const s = String(total%60).padStart(2,'0');
        el.textContent = `${m}:${s}`;
    }, 1000);
})();

/* ============================================
   UTILS
   ============================================ */
function setFieldState(inputId, state, errMsg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.remove('ap-valid','ap-invalid');
    const stEl = input.parentElement?.querySelector('.ap-field-status');
    const errEl = document.getElementById('err-' + inputId) ||
                  document.getElementById('err-' + inputId.replace('reg','reg'));
    if (state === 'ok') {
        input.classList.add('ap-valid');
        if (stEl) { stEl.textContent='✓'; stEl.className='ap-field-status ok'; }
        if (errEl) errEl.textContent='';
    } else if (state === 'err') {
        input.classList.add('ap-invalid');
        if (stEl) { stEl.textContent='✕'; stEl.className='ap-field-status err'; }
        if (errEl) errEl.textContent = errMsg || '';
    } else {
        if (stEl) { stEl.textContent=''; stEl.className='ap-field-status'; }
        if (errEl) errEl.textContent='';
    }
}

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validateUsername(u) { return /^[a-zA-Z0-9_]{3,20}$/.test(u); }

function showAlert(id, msg, type='error') {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `ap-alert ${type}`;
    el.innerHTML = `<i class="fas fa-${type==='error'?'circle-xmark':'circle-check'}"></i> ${msg}`;
    el.style.display = 'flex';
}
function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.style.display='none';
}

function setLoading(btnId, on) {
    const btn  = document.getElementById(btnId);
    if (!btn) return;
    /* Support both markup variants: the auth pages ship
       .btn-text / .btn-spinner, older markup used .ap-submit-* */
    const txt  = btn.querySelector('.btn-text, .ap-submit-text');
    const spin = btn.querySelector('.btn-spinner, .ap-submit-spin');
    btn.disabled = on;
    if (txt)  txt.style.display  = on ? 'none' : 'inline';
    if (spin) spin.style.display = on ? 'inline' : 'none';
}

const delay = ms => new Promise(r => setTimeout(r, ms));

/* ============================================
   PASSWORD TOGGLE
   ============================================ */
function initEye(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const inp = document.getElementById(inputId);
    if (!btn || !inp) return;
    btn.addEventListener('click', () => {
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        btn.querySelector('i').className = `fas fa-eye${show ? '-slash' : ''}`;
    });
}
initEye('togglePass',    'password');
initEye('toggleRegPass', 'regPassword');

/* ============================================
   OAUTH BUTTONS — REAL & DEMO SUPPORT
   ============================================ */

/* Detect server vs file:// */
const IS_SERVER = window.location.protocol !== 'file:';
window.HAS_GOOGLE_CREDS = false;

function showGoogleConfigModal() {
    let modal = document.getElementById('googleConfigModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'googleConfigModal';
        modal.className = 'g-modal-backdrop';
        modal.innerHTML = `
            <div class="g-modal-content">
                <div class="g-modal-header">
                    <div class="g-modal-title">
                        <i class="fab fa-google" style="color:#4285F4"></i> Google OAuth Setup &amp; Demo
                    </div>
                    <button class="g-modal-close" onclick="document.getElementById('googleConfigModal').remove()">&times;</button>
                </div>
                <div class="g-modal-body">
                    <p style="margin-bottom:12px;color:#d1d5db;font-size:0.88rem;line-height:1.5;">
                        Google OAuth is not configured in <code>.env</code> yet. You can test immediately using <strong>Demo Google Login</strong> or add your real Google API credentials.
                    </p>
                    
                    <div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);padding:12px;border-radius:8px;margin-bottom:16px;">
                        <h4 style="color:#f97316;margin-bottom:6px;font-size:0.85rem;"><i class="fas fa-key"></i> How to add real Google credentials:</h4>
                        <ol style="margin-left:18px;color:#a1a1aa;font-size:0.8rem;line-height:1.6;">
                            <li>Open <strong>.env</strong> file in project folder.</li>
                            <li>Set <code>GOOGLE_CLIENT_ID</code> from Google Cloud Console.</li>
                            <li>Set <code>GOOGLE_CLIENT_SECRET</code> from Google Cloud Console.</li>
                            <li>Redirect URI: <code>http://localhost:3000/auth/google/callback</code></li>
                        </ol>
                    </div>

                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <a href="/auth/google/dev-mock" class="ap-submit" style="flex:1;text-decoration:none;text-align:center;padding:10px 14px;background:#ea580c;color:#fff;font-weight:700;border-radius:8px;font-size:0.85rem;">
                            🚀 Demo Google Login →
                        </a>
                        <button type="button" class="ap-submit" style="background:#27272a;color:#d4d4d8;border:1px solid #3f3f46;border-radius:8px;padding:10px 14px;font-size:0.85rem;cursor:pointer;" onclick="document.getElementById('googleConfigModal').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        /* Add dynamic modal CSS if not present */
        if (!document.getElementById('gModalStyle')) {
            const st = document.createElement('style');
            st.id = 'gModalStyle';
            st.textContent = `
                .g-modal-backdrop { position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px; }
                .g-modal-content { background:#12121a;border:1px solid rgba(249,115,22,0.3);border-radius:16px;max-width:480px;width:100%;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,0.8);animation:popIn 0.25s ease-out; }
                .g-modal-header { display:flex;align-items:center;justify-space-between;margin-bottom:16px; }
                .g-modal-title { font-size:1.1rem;font-weight:700;color:#fff;display:flex;align-items:center;gap:10px; }
                .g-modal-close { background:none;border:none;color:#8a8aaa;font-size:1.5rem;cursor:pointer;margin-left:auto; }
                .g-modal-close:hover { color:#fff; }
                @keyframes popIn { from { transform:scale(0.9);opacity:0; } to { transform:scale(1);opacity:1; } }
            `;
            document.head.appendChild(st);
        }
    }
}

function initOAuth() {
    const googleBtn  = document.getElementById('btnGoogle');
    const discordBtn = document.getElementById('btnDiscord');

    /* ---- GOOGLE ---- */
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            if (IS_SERVER) {
                if (window.HAS_GOOGLE_CREDS) {
                    /* Real OAuth redirect */
                    googleBtn.classList.add('loading');
                    googleBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Connecting to Google...';
                    await delay(350);
                    window.location.href = '/auth/google';
                } else {
                    /* Prompt with setup instructions & dev mock choice */
                    showGoogleConfigModal();
                }
            } else {
                /* file:// fallback */
                const aId = document.getElementById('loginAlert') ? 'loginAlert' : 'registerAlert';
                showAlert(aId, '&#x26A0;&#xFE0F; Run <strong>npm run dev</strong> to enable Google OAuth.', 'error');
            }
        });
    }

    /* ---- DISCORD ---- */
    if (discordBtn) {
        discordBtn.addEventListener('click', () => {
            const aId = document.getElementById('loginAlert') ? 'loginAlert' : 'registerAlert';
            showAlert(aId, '<i class="fab fa-discord" style="color:#5865f2"></i>&nbsp; Discord OAuth coming soon!', 'error');
        });
    }
}
initOAuth();

/* ============================================
   AUTO-DETECT SESSION ON PAGE LOAD
   ============================================ */
(async function checkSession() {
    if (!IS_SERVER) return;
    try {
        const res  = await fetch('/api/me', { credentials: 'include' });
        const data = await res.json();
        window.HAS_GOOGLE_CREDS = !!data.hasGoogleCreds;

        if (data.authenticated && data.user) {
            const isAuthPage = ['/login','/register','/signup'].includes(window.location.pathname);
            if (isAuthPage) { window.location.href = '/dashboard'; return; }
            injectUserBanner(data.user);
        } else {
            const p = new URLSearchParams(window.location.search);
            const aId = document.getElementById('loginAlert') ? 'loginAlert' : 'registerAlert';
            if (p.get('error') === 'google_not_configured') {
                showGoogleConfigModal();
            } else if (p.get('error') === 'oauth_failed') {
                showAlert(aId, 'Google sign-in failed. Please try again.', 'error');
            } else if (p.get('logged_out') === '1') {
                showAlert(aId, 'You have been logged out.', 'success');
            }
        }
    } catch(e) { /* silent — server might not be running */ }
})();

function injectUserBanner(user) {
    const card = document.querySelector('.ap-card');
    if (!card || document.getElementById('userBanner')) return;
    const rc = user.role === 'owner' ? 'var(--ap-acc)' : '#22c55e';
    const ri = user.role === 'owner' ? '&#x1F451;' : '&#x1F464;';
    const banner = document.createElement('div');
    banner.id = 'userBanner';
    banner.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.25);border-radius:10px;margin-bottom:16px;font-size:.82rem;';
    banner.innerHTML = (user.avatar
        ? '<img src="'+user.avatar+'" style="width:32px;height:32px;border-radius:50%;border:2px solid '+rc+'">'
        : '<div style="width:32px;height:32px;border-radius:50%;background:var(--ap-acc);display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff">'+user.displayName[0]+'</div>'
    )+'<div style="flex:1"><div style="font-weight:700;color:#f5f5ff">'+user.displayName+'</div><div style="font-size:.68rem;color:#8a8aaa;font-family:monospace">'+user.email+'</div></div>'
    +'<span style="padding:2px 8px;border-radius:99px;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.3);font-size:.62rem;font-weight:800;color:'+rc+';text-transform:uppercase;letter-spacing:.5px">'+ri+' '+user.role+'</span>'
    +'<a href="/dashboard" style="padding:5px 12px;background:var(--ap-acc);color:#fff;border-radius:8px;font-size:.75rem;font-weight:800;text-decoration:none">Dashboard &#x2192;</a>';
    card.insertBefore(banner, card.firstChild);
}
