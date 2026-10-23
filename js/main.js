/* ============================================
   AUTHX — MAIN.JS  v5.0  FULL CINEMATIC
   Particles · Typing · 3D tilt · Spotlight
   Scroll progress · Scroll reveal · Counters
   ============================================ */

'use strict';

/* ============================================
   1. CANVAS PARTICLE SYSTEM — neon dots + lines + shooting stars
   ============================================ */
(function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, raf;

    const COLORS  = ['34,197,94', '74,222,128', '22,163,74', '52,211,153'];
    const COUNT   = 110;
    let particles = [];
    let mouse = { x: -999, y: -999 };

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor(init) {
            this.reset(init);
        }
        reset(init = false) {
            this.x     = Math.random() * W;
            this.y     = init ? Math.random() * H : H + 10;
            this.vx    = (Math.random() - 0.5) * 0.35;
            this.vy    = -(Math.random() * 0.45 + 0.1);
            this.r     = Math.random() * 1.6 + 0.4;
            this.alpha = Math.random() * 0.45 + 0.08;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.phase = Math.random() * Math.PI * 2;
            this.speed = 0.018 + Math.random() * 0.015;
        }
        update() {
            /* mouse repel */
            const dx = this.x - mouse.x, dy = this.y - mouse.y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < 90) {
                const f = (90 - d) / 90;
                this.vx += (dx / d) * f * 0.7;
                this.vy += (dy / d) * f * 0.7;
            }
            this.vx *= 0.975;
            this.vy *= 0.975;
            this.x  += this.vx;
            this.y  += this.vy;
            this.phase += this.speed;
            if (this.x < -10) this.x = W + 10;
            if (this.x > W + 10) this.x = -10;
            if (this.y < -20) this.reset();
        }
        draw() {
            const a = this.alpha * (0.6 + Math.sin(this.phase) * 0.4);
            /* glow halo */
            if (this.r > 1.2) {
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 7);
                g.addColorStop(0, `rgba(${this.color},${a * 0.5})`);
                g.addColorStop(1, `rgba(${this.color},0)`);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * 7, 0, Math.PI * 2);
                ctx.fillStyle = g; ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color},${a})`;
            ctx.fill();
        }
    }

    /* connection lines */
    function drawLines() {
        const DIST = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx*dx + dy*dy);
                if (d < DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(249,115,22,${(1 - d/DIST) * 0.12})`;
                    ctx.lineWidth   = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    /* shooting stars */
    class Star {
        constructor() { this.alive = false; }
        spawn() {
            this.x    = Math.random() * W;
            this.y    = Math.random() * H * 0.5;
            this.len  = 80 + Math.random() * 120;
            this.spd  = 7 + Math.random() * 7;
            this.ang  = Math.PI / 5 + (Math.random() - 0.5) * 0.3;
            this.life = 0;
            this.max  = 50 + Math.random() * 40;
            this.col  = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alive= true;
        }
        update() {
            if (!this.alive) return;
            this.life++;
            this.x += Math.cos(this.ang) * this.spd;
            this.y += Math.sin(this.ang) * this.spd;
            if (this.life >= this.max) this.alive = false;
        }
        draw() {
            if (!this.alive) return;
            const a = this.life < 8
                ? this.life / 8
                : this.life > this.max - 8
                    ? (this.max - this.life) / 8
                    : 1;
            const tx = this.x - Math.cos(this.ang) * this.len;
            const ty = this.y - Math.sin(this.ang) * this.len;
            const g  = ctx.createLinearGradient(tx, ty, this.x, this.y);
            g.addColorStop(0, `rgba(${this.col},0)`);
            g.addColorStop(1, `rgba(${this.col},${a * 0.8})`);
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = g;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
        }
    }

    const stars = Array.from({ length: 5 }, () => new Star());
    let starTimer = 0;
    function spawnStar() {
        const s = stars.find(s => !s.alive);
        if (s) s.spawn();
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawLines();
        particles.forEach(p => { p.update(); p.draw(); });
        starTimer++;
        if (starTimer % 160 === 0) spawnStar();
        stars.forEach(s => { s.update(); s.draw(); });
        raf = requestAnimationFrame(loop);
    }

    function init() {
        resize();
        particles = Array.from({ length: COUNT }, () => new Particle(true));
        loop();
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    init();
})();

/* ============================================
   2. SCROLL PROGRESS BAR
   ============================================ */
const progressBar = document.getElementById('scrollProgress');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
}

/* ============================================
   3. MOUSE SPOTLIGHT
   ============================================ */
const spotlight = document.getElementById('heroSpotlight');
if (spotlight) {
    window.addEventListener('mousemove', e => {
        spotlight.style.setProperty('--mx', e.clientX + 'px');
        spotlight.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
}

/* ============================================
   4. TYPING EFFECT — cycles through words
   ============================================ */
(function initTyping() {
    const target = document.getElementById('typingTarget');
    const cursor = document.getElementById('typingCursor');
    if (!target) return;

    const words = ['everyone!', 'developers!', 'your apps!', 'the future!', 'all of you!'];
    let wi = 0, ci = 0, deleting = false, pauseTimer = 0;

    function tick() {
        const word = words[wi];
        if (!deleting) {
            target.textContent = word.slice(0, ci + 1);
            ci++;
            if (ci === word.length) {
                deleting = true;
                pauseTimer = 38; // pause before deleting
            }
            setTimeout(tick, 95);
        } else {
            if (pauseTimer > 0) { pauseTimer--; setTimeout(tick, 50); return; }
            target.textContent = word.slice(0, ci - 1);
            ci--;
            if (ci === 0) {
                deleting = false;
                wi = (wi + 1) % words.length;
            }
            setTimeout(tick, 55);
        }
    }
    setTimeout(tick, 800);
})();

/* ============================================
   5. NAVBAR SCROLL
   ============================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

/* ============================================
   6. HAMBURGER MENU
   ============================================ */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(l =>
        l.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
        })
    );
}

/* ============================================
   7. ACTIVE NAV LINK ON SCROLL
   ============================================ */
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                const a = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
                if (a) a.classList.add('active');
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => obs.observe(s));
}

/* ============================================
   8. SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        /* Bare href="#" (placeholder link) is not a valid CSS selector —
           document.querySelector('#') throws. Skip those. */
        if (!href || href.length < 2) return;
        const t = document.querySelector(href);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

/* ============================================
   9. SCROLL REVEAL — all variants
   ============================================ */
const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-flip'];
const allReveals = document.querySelectorAll(revealClasses.join(','));

if (allReveals.length) {
    const rObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                rObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    allReveals.forEach(el => rObs.observe(el));
}

/* Auto-add reveal + stagger to grid children */
document.querySelectorAll('.features-grid, .infra-grid, .analytics-grid').forEach(grid => {
    grid.querySelectorAll(':scope > *').forEach((child, i) => {
        child.classList.add('reveal-scale');
        child.classList.add(`stagger-${Math.min(i + 1, 6)}`);
        child.style.transitionDelay = `${i * 0.07}s`;
    });
});

/* ============================================
   10. ANIMATED COUNTERS
   ============================================ */
function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M+';
    if (n >= 1000)    return (n / 1000).toFixed(0) + 'k+';
    return n.toLocaleString();
}

function runCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    const dur = 2000, start = performance.now();
    const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = formatNum(Math.floor(e * target));
        if (p < 1) requestAnimationFrame(tick);
        else {
            el.textContent = formatNum(target);
            el.classList.add('count-flash');
        }
    };
    requestAnimationFrame(tick);
}

const counterEls = document.querySelectorAll('[data-target]');
if (counterEls.length) {
    const cObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { runCounter(e.target); cObs.unobserve(e.target); }
        });
    }, { threshold: 0.6 });
    counterEls.forEach(el => cObs.observe(el));
}

/* ============================================
   11. TEAM CARD 3D TILT
   ============================================ */
document.querySelectorAll('.team-card').forEach(card => {
    const STRENGTH = 10;

    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rx =  dy * STRENGTH;
        const ry = -dx * STRENGTH;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s ease';
        setTimeout(() => { card.style.transition = ''; }, 500);
    });
});

/* ============================================
   12. FEATURE CARD SPOTLIGHT (mouse track glow)
   ============================================ */
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
        const y  = ((e.clientY - r.top ) / r.height * 100).toFixed(1) + '%';
        card.style.background = `radial-gradient(circle at ${x} ${y}, rgba(124,58,237,0.07) 0%, var(--surface) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.background = '';
    });
});

/* ============================================
   13. DASHBOARD SIDEBAR NAV
   ============================================ */
const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');
const pages        = document.querySelectorAll('.page[id^="page-"]');

if (sidebarLinks.length) {
    sidebarLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.dataset.page;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const bc = document.querySelector('.breadcrumb-current');
            if (bc) bc.textContent = link.querySelector('span').textContent.trim();
            pages.forEach(p => p.classList.remove('active'));
            const tp = document.getElementById(`page-${target}`);
            if (tp) tp.classList.add('active');
            const sb = document.getElementById('sidebar');
            if (window.innerWidth < 768 && sb) sb.classList.remove('open');
        });
    });
}

/* ---- Sidebar mobile toggle ---- */
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar       = document.getElementById('sidebar');
if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (window.innerWidth < 768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target))
            sidebar.classList.remove('open');
    });
}

/* ---- New App Modal ---- */
const newAppBtn   = document.getElementById('newAppBtn');
const newAppModal = document.getElementById('newAppModal');
const closeModal  = document.getElementById('closeModal');
const cancelModal = document.getElementById('cancelModal');
if (newAppBtn && newAppModal) {
    newAppBtn.addEventListener('click', () => { newAppModal.style.display = 'flex'; document.body.style.overflow = 'hidden'; });
    [closeModal, cancelModal].forEach(b => b?.addEventListener('click', () => { newAppModal.style.display = 'none'; document.body.style.overflow = ''; }));
    newAppModal.addEventListener('click', e => { if (e.target === newAppModal) { newAppModal.style.display = 'none'; document.body.style.overflow = ''; } });
}

/* ---- Generate Keys Panel ---- */
const genKeyBtn    = document.getElementById('genKeyBtn');
const genKeysPanel = document.getElementById('genKeysPanel');
const closeGenPanel= document.getElementById('closeGenPanel');
if (genKeyBtn && genKeysPanel) {
    genKeyBtn.addEventListener('click', () => { genKeysPanel.style.display = genKeysPanel.style.display === 'none' ? 'block' : 'none'; });
    closeGenPanel?.addEventListener('click', () => { genKeysPanel.style.display = 'none'; });
}

document.getElementById('doGenerateKeys')?.addEventListener('click', function() {
    const qty    = document.querySelector('#genKeysPanel input[type="number"]')?.value || 10;
    const prefix = document.querySelector('#genKeysPanel input[type="text"]')?.value || 'ZyrexSquad-';
    const dur    = document.querySelector('#genKeysPanel select')?.value || '30 Days';
    const app    = document.querySelector('#genKeysPanel select:first-of-type')?.value || 'App';
    const tbody  = document.getElementById('keysBody');
    if (!tbody) return;
    for (let i = 0; i < Math.min(parseInt(qty), 10); i++) {
        const key = prefix + genKey();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" aria-label="Select"></td>
            <td><code style="font-family:monospace;color:var(--purple-light);font-size:.78rem">${key}</code></td>
            <td>${app}</td><td style="color:var(--text3)">—</td>
            <td>${dur}</td><td>${new Date().toLocaleDateString()}</td>
            <td><span class="app-status unused">Unused</span></td>
            <td><div class="action-btns">
                <button class="action-btn" title="Copy" onclick="navigator.clipboard.writeText('${key}');showToast('Key copied!','info')"><i class="fas fa-copy"></i></button>
                <button class="action-btn danger" title="Delete"><i class="fas fa-trash"></i></button>
            </div></td>`;
        tbody.prepend(row);
    }
    genKeysPanel.style.display = 'none';
    showToast(`Generated ${qty} key(s)!`, 'success');
});

function genKey() {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length:4}, () => Array.from({length:4}, () => c[Math.random()*c.length|0]).join('')).join('-');
}

/* ============================================
   14. TOAST NOTIFICATION
   ============================================ */
function showToast(msg, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        Object.assign(container.style, {
            position:'fixed', bottom:'80px', right:'24px', zIndex:'9997',
            display:'flex', flexDirection:'column', gap:'9px', pointerEvents:'none'
        });
        document.body.appendChild(container);
    }
    const map = {
        success: { bg:'rgba(34,197,94,0.1)',   border:'rgba(34,197,94,0.25)',   color:'#86efac', icon:'fa-circle-check' },
        error:   { bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',   color:'#fca5a5', icon:'fa-circle-xmark' },
        info:    { bg:'rgba(124,58,237,0.12)', border:'rgba(124,58,237,0.3)',   color:'#c4b5fd', icon:'fa-circle-info'  },
    };
    const c = map[type] || map.info;
    const t = document.createElement('div');
    Object.assign(t.style, {
        display:'flex', alignItems:'center', gap:'9px',
        padding:'11px 16px',
        background: c.bg, border:`1px solid ${c.border}`,
        borderRadius:'10px', color: c.color,
        fontSize:'.83rem', fontWeight:'600',
        backdropFilter:'blur(12px)',
        boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
        animation:'fadeInUp 0.3s ease',
        pointerEvents:'all', maxWidth:'300px',
        fontFamily:'Inter, sans-serif',
    });
    t.innerHTML = `<i class="fas ${c.icon}"></i><span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.transition = 'opacity .3s, transform .3s';
        t.style.opacity = '0'; t.style.transform = 'translateX(16px)';
        setTimeout(() => t.remove(), 300);
    }, 3200);
}
window.showToast = showToast;

/* ============================================
   15. INJECT GLOBAL KEYFRAMES
   ============================================ */
const kf = document.createElement('style');
kf.textContent = `
    @keyframes fadeInUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spinRing  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;
document.head.appendChild(kf);

/* ============================================
   16. DASHBOARD CHART TAB BTNS
   ============================================ */
document.querySelectorAll('.card-actions .tab-btn, .filter-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.card-actions, .filter-tabs')
            ?.querySelectorAll('.tab-btn')
            .forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});
