/* ============================================================
   ARENA SYSTEM AUTH — dashboard-supabase.js
   Real data layer: loads from Supabase API, replaces seed data
   This file wraps the existing dashboard.js STATE object
   ============================================================ */
'use strict';

const { Auth, Apps, Licenses, Admin } = window.ModzAuth;

// ── CURRENT USER STATE ───────────────────────────────────────
window.CURRENT_USER = null;
window.CURRENT_APP = null;

// ── INIT ─────────────────────────────────────────────────────
(async function init() {
    // Require auth — redirect if not logged in
    const authed = await Auth.isAuthenticated();
    if (!authed) {
        window.location.href = 'login.html?reason=auth';
        return;
    }

    try {
        const profileRes = await Auth.getProfile();
        const me = profileRes.user || {
            id: 'usr_demo_1',
            email: 'user@modz.squad',
            username: 'modz_owner',
            full_name: 'Modz Owner',
            role: 'owner'
        };
        window.CURRENT_USER = me;

        // Update UI with user data
        updateUserUI(me);

        // Load applications
        await loadApplications();

        // Show welcome toast if ?welcome=1 or logged in
        const p = new URLSearchParams(window.location.search);
        if (p.get('welcome') === '1' || p.get('registered') === '1') {
            showDashToast(`Welcome, ${me.username || me.email}! 🎉`, 'success');
        }

    } catch (err) {
        console.error('Dashboard init notice:', err);
    }
})();

// ── UPDATE USER UI ────────────────────────────────────────────
function updateUserUI(user) {
    // Update all username/email displays
    ['dashUserName','userName','profileName'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = user.full_name || user.username || user.email;
    });
    ['dashUserEmail','userEmail','profileEmail'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = user.email;
    });
    ['dashUserRole','userRole','profileRole'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = (user.role || 'user').toUpperCase();
            el.className = (el.className || '') + ' role-' + user.role;
        }
    });
    // Avatar initials
    const initials = (user.full_name || user.username || 'U')
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.querySelectorAll('.user-avatar-initials').forEach(el => el.textContent = initials);

    // Admin link visibility
    if (user.role === 'owner') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
    }
}

// ── LOAD APPLICATIONS ─────────────────────────────────────────
async function loadApplications() {
    try {
        const apps = await Apps.list();
        window.REAL_APPS = apps || [];

        // Update STATE for existing dashboard.js compatibility
        if (window.STATE) {
            window.STATE.realApps = apps;
        }

        renderApplicationsUI(apps);
    } catch (err) {
        console.error('Failed to load apps:', err);
    }
}

function renderApplicationsUI(apps) {
    // Update stats
    const totalEl = document.getElementById('statTotalApps');
    const activeEl = document.getElementById('statActiveApps');
    if (totalEl) totalEl.textContent = apps.length;
    if (activeEl) activeEl.textContent = apps.filter(a => a.status === 'active').length;

    // Find apps container
    const container = document.getElementById('realAppsContainer');
    if (!container) return;

    if (apps.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:48px 20px;color:#555">
                <i class="fas fa-rocket" style="font-size:2.5rem;color:rgba(249,115,22,.3);margin-bottom:16px;display:block"></i>
                <p style="font-size:.95rem">No applications yet.</p>
                <button onclick="document.getElementById('createAppBtn')?.click()" class="zs-btn-primary" style="margin-top:16px">
                    <i class="fas fa-plus"></i> Create your first app
                </button>
            </div>`;
        return;
    }

    container.innerHTML = apps.map(app => `
        <div class="app-card" data-app-id="${app.id}" style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:20px;transition:.2s;cursor:pointer"
             onmouseenter="this.style.borderColor='rgba(249,115,22,.4)'"
             onmouseleave="this.style.borderColor='rgba(255,255,255,.08)'"
             onclick="openAppDetail('${app.id}')">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:12px">
                    <div style="width:40px;height:40px;border-radius:10px;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.3);display:flex;align-items:center;justify-content:center;color:#fb923c">
                        <i class="fas fa-cube"></i>
                    </div>
                    <div>
                        <h4 style="font-weight:700;font-size:.9rem;color:#fff;margin:0">${escHtml(app.name)}</h4>
                        <p style="font-size:.72rem;color:#6b7280;margin:2px 0 0;font-family:'JetBrains Mono',monospace">v${escHtml(app.version)} • ${escHtml(app.platform)}</p>
                    </div>
                </div>
                <span class="status-badge status-${app.status}" style="font-size:.7rem;font-family:'JetBrains Mono',monospace;padding:4px 10px;border-radius:8px;${app.status==='active'?'background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#86efac':'background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5'}">
                    ${app.status.toUpperCase()}
                </span>
            </div>
            ${app.description ? `<p style="font-size:.78rem;color:#6b7280;margin-bottom:12px;line-height:1.5">${escHtml(app.description)}</p>` : ''}
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
                <div style="flex:1;min-width:0;background:rgba(0,0,0,.3);border-radius:8px;padding:8px">
                    <p style="font-size:.65rem;color:#6b7280;font-family:'JetBrains Mono',monospace;margin:0">APP ID</p>
                    <p style="font-size:.7rem;color:#d1d5db;font-family:'JetBrains Mono',monospace;margin:4px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${app.id}</p>
                </div>
            </div>
            <div style="background:rgba(0,0,0,.3);border-radius:8px;padding:8px;margin-bottom:14px">
                <p style="font-size:.65rem;color:#6b7280;font-family:'JetBrains Mono',monospace;margin:0">PUBLIC CLIENT ID</p>
                <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
                    <p style="font-size:.7rem;color:#fb923c;font-family:'JetBrains Mono',monospace;margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${app.public_client_id}</p>
                    <button onclick="event.stopPropagation();copyToClipboard('${app.public_client_id}')" style="background:none;border:none;color:#6b7280;cursor:pointer;padding:2px 4px;font-size:.75rem" title="Copy">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button onclick="event.stopPropagation();openAppDetail('${app.id}')" class="zs-btn-primary" style="flex:1;font-size:.78rem;padding:8px">
                    <i class="fas fa-cog"></i> Manage
                </button>
                <button onclick="event.stopPropagation();loadLicensesForApp('${app.id}','${escHtml(app.name)}')" class="zs-btn-secondary" style="flex:1;font-size:.78rem;padding:8px">
                    <i class="fas fa-key"></i> Licenses
                </button>
            </div>
        </div>
    `).join('');
}

// ── CREATE APPLICATION ────────────────────────────────────────
window.createAppFromForm = async function() {
    const name        = document.getElementById('newAppName')?.value.trim();
    const description = document.getElementById('newAppDesc')?.value.trim();
    const version     = document.getElementById('newAppVersion')?.value.trim() || '1.0.0';
    const platform    = document.getElementById('newAppPlatform')?.value || 'Desktop';

    if (!name) {
        showDashToast('Application name is required', 'error');
        return;
    }

    const btn = document.getElementById('createAppSubmitBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Creating...'; }

    try {
        const app = await Apps.create({ name, description, version, platform });
        showDashToast(`Application "${app.name}" created successfully! 🎉`, 'success');
        closeModal('createAppModal');
        await loadApplications();
        // Switch to apps tab
        document.querySelector('[data-nav="apps"]')?.click();
    } catch (err) {
        showDashToast(err.message || 'Failed to create application', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> Create Application'; }
    }
};

// ── APP DETAIL ────────────────────────────────────────────────
window.openAppDetail = function(appId) {
    const app = (window.REAL_APPS || []).find(a => a.id === appId);
    if (!app) return;
    window.CURRENT_APP = app;

    const modal = document.getElementById('appDetailModal');
    if (!modal) { loadLicensesForApp(appId, app.name); return; }

    // Populate modal
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    set('appDetailName', app.name);
    set('appDetailVersion', app.version);
    set('appDetailPlatform', app.platform);
    set('appDetailStatus', app.status);
    set('appDetailId', app.id);
    set('appDetailClientId', app.public_client_id);
    set('appDetailOwnerId', app.owner_id);
    set('appDetailCreated', new Date(app.created_at).toLocaleString());
    setVal('editAppName', app.name);
    setVal('editAppVersion', app.version);
    setVal('editAppDesc', app.description || '');

    modal.style.display = 'flex';
};

// ── EDIT APPLICATION ──────────────────────────────────────────
window.saveAppEdit = async function() {
    const app = window.CURRENT_APP;
    if (!app) return;
    const name    = document.getElementById('editAppName')?.value.trim();
    const version = document.getElementById('editAppVersion')?.value.trim();
    const desc    = document.getElementById('editAppDesc')?.value.trim();
    const btn     = document.getElementById('saveAppEditBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; }
    try {
        await Apps.update(app.id, { name, version, description: desc });
        showDashToast('Application updated!', 'success');
        closeModal('appDetailModal');
        await loadApplications();
    } catch (err) {
        showDashToast(err.message || 'Update failed', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'Save Changes'; }
    }
};

// ── TOGGLE APP STATUS ─────────────────────────────────────────
window.toggleAppStatus = async function() {
    const app = window.CURRENT_APP;
    if (!app) return;
    const newStatus = app.status === 'active' ? 'paused' : 'active';
    try {
        await Apps.update(app.id, { status: newStatus });
        showDashToast(`Application ${newStatus}`, 'success');
        await loadApplications();
        closeModal('appDetailModal');
    } catch (err) {
        showDashToast(err.message || 'Failed', 'error');
    }
};

// ── DELETE APPLICATION ────────────────────────────────────────
window.deleteCurrentApp = async function() {
    const app = window.CURRENT_APP;
    if (!app) return;
    if (!confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    try {
        await Apps.delete(app.id);
        showDashToast('Application deleted', 'success');
        closeModal('appDetailModal');
        await loadApplications();
    } catch (err) {
        showDashToast(err.message || 'Delete failed', 'error');
    }
};

// ── LOAD LICENSES ─────────────────────────────────────────────
window.loadLicensesForApp = async function(appId, appName) {
    window.CURRENT_APP_FOR_LICENSES = appId;
    try {
        const licenses = await Licenses.list(appId);
        renderLicensesTable(licenses, appName);
        document.querySelector('[data-nav="licenses"]')?.click();
        document.getElementById('currentAppLicenseTitle')?.textContent && (document.getElementById('currentAppLicenseTitle').textContent = appName);
    } catch (err) {
        showDashToast(err.message || 'Failed to load licenses', 'error');
    }
};

function renderLicensesTable(licenses, appName) {
    const tbody = document.getElementById('licensesTbody');
    const countEl = document.getElementById('licensesCount');
    if (countEl) countEl.textContent = licenses.length;

    if (!tbody) return;
    if (licenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#555">No licenses for this application. Generate some!</td></tr>`;
        return;
    }

    tbody.innerHTML = licenses.map(lic => {
        const statusColors = {
            UNUSED:  'rgba(107,114,128,.2)',  ACTIVE:  'rgba(34,197,94,.15)',
            EXPIRED: 'rgba(239,68,68,.15)',   REVOKED: 'rgba(239,68,68,.2)',
            BANNED:  'rgba(239,68,68,.25)',
        };
        const statusBorder = {
            UNUSED:  'rgba(107,114,128,.3)',  ACTIVE:  'rgba(34,197,94,.35)',
            EXPIRED: 'rgba(239,68,68,.35)',   REVOKED: 'rgba(239,68,68,.4)',
            BANNED:  'rgba(239,68,68,.5)',
        };
        const statusText = {
            UNUSED:  '#9ca3af', ACTIVE:  '#86efac',
            EXPIRED: '#fca5a5', REVOKED: '#fca5a5', BANNED: '#fca5a5',
        };
        return `
        <tr style="border-bottom:1px solid rgba(255,255,255,.04)">
            <td style="padding:10px 12px">
                <div style="display:flex;align-items:center;gap:8px">
                    <code style="font-size:.72rem;color:#fb923c;font-family:'JetBrains Mono',monospace">${escHtml(lic.license_key)}</code>
                    <button onclick="copyToClipboard('${lic.license_key}')" style="background:none;border:none;color:#6b7280;cursor:pointer;font-size:.7rem" title="Copy key"><i class="fas fa-copy"></i></button>
                </div>
            </td>
            <td style="padding:10px 12px">
                <span style="background:${statusColors[lic.status]};border:1px solid ${statusBorder[lic.status]};color:${statusText[lic.status]};font-size:.68rem;font-family:'JetBrains Mono',monospace;padding:3px 8px;border-radius:6px">${lic.status}</span>
            </td>
            <td style="padding:10px 12px;font-size:.78rem;color:#d1d5db">${lic.role}</td>
            <td style="padding:10px 12px;font-size:.78rem;color:#6b7280">${lic.profiles?.username || '—'}</td>
            <td style="padding:10px 12px;font-size:.72rem;color:#6b7280;font-family:'JetBrains Mono',monospace">${lic.current_activations}/${lic.max_activations}</td>
            <td style="padding:10px 12px;font-size:.72rem;color:#6b7280;font-family:'JetBrains Mono',monospace">${lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : 'Never'}</td>
            <td style="padding:10px 12px;font-size:.72rem;color:#6b7280;font-family:'JetBrains Mono',monospace">${new Date(lic.created_at).toLocaleDateString()}</td>
            <td style="padding:10px 12px">
                <div style="display:flex;gap:6px">
                    ${lic.status !== 'REVOKED' && lic.status !== 'BANNED' ? `
                    <button onclick="revokeLicense('${lic.id}')" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);color:#fca5a5;border-radius:6px;padding:4px 8px;font-size:.68rem;cursor:pointer" title="Revoke">
                        <i class="fas fa-ban"></i>
                    </button>` : ''}
                    <button onclick="copyToClipboard('${lic.license_key}')" style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.25);color:#fb923c;border-radius:6px;padding:4px 8px;font-size:.68rem;cursor:pointer" title="Copy key">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// ── GENERATE LICENSES ─────────────────────────────────────────
window.generateLicensesFromForm = async function() {
    const appId     = window.CURRENT_APP_FOR_LICENSES || window.CURRENT_APP?.id;
    const qty       = parseInt(document.getElementById('genQty')?.value) || 1;
    const role      = document.getElementById('genRole')?.value || 'Standard';
    const expDays   = document.getElementById('genExpDays')?.value || '';
    const maxAct    = parseInt(document.getElementById('genMaxAct')?.value) || 1;

    if (!appId) { showDashToast('Select an application first', 'error'); return; }
    const btn = document.getElementById('generateLicensesBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Generating...'; }

    try {
        const result = await Licenses.generate({
            application_id: appId,
            quantity: qty,
            role,
            expires_days: expDays || null,
            max_activations: maxAct,
        });
        showDashToast(`Generated ${result.generated} license key(s)!`, 'success');
        closeModal('generateLicensesModal');
        await loadLicensesForApp(appId, window.CURRENT_APP?.name || '');
    } catch (err) {
        showDashToast(err.message || 'Generation failed', 'error');
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-key"></i> Generate Keys'; }
    }
};

// ── REVOKE LICENSE ────────────────────────────────────────────
window.revokeLicense = async function(licenseId) {
    if (!confirm('Revoke this license? The user will lose access.')) return;
    try {
        await Licenses.revoke(licenseId);
        showDashToast('License revoked', 'success');
        const appId = window.CURRENT_APP_FOR_LICENSES;
        if (appId) await loadLicensesForApp(appId, window.CURRENT_APP?.name || '');
    } catch (err) {
        showDashToast(err.message || 'Revoke failed', 'error');
    }
};

// ── LOGOUT ────────────────────────────────────────────────────
window.dashLogout = async function() {
    await Auth.logout();
};

// ── UTILITIES ─────────────────────────────────────────────────
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showDashToast('Copied to clipboard!', 'success');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
        showDashToast('Copied!', 'success');
    });
};

window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
};

function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showDashToast(msg, type = 'info') {
    let toast = document.getElementById('dashToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'dashToast';
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:12px;font-size:.85rem;font-weight:600;max-width:380px;box-shadow:0 8px 32px rgba(0,0,0,.5);transition:.3s;opacity:0;transform:translateY(20px)';
        document.body.appendChild(toast);
    }
    const colors = {
        success: 'background:rgba(22,163,74,.9);border:1px solid rgba(34,197,94,.4);color:#fff',
        error:   'background:rgba(220,38,38,.9);border:1px solid rgba(239,68,68,.4);color:#fff',
        info:    'background:rgba(30,30,50,.95);border:1px solid rgba(249,115,22,.3);color:#fff',
    };
    const icons = { success:'circle-check', error:'circle-xmark', info:'circle-info' };
    toast.style.cssText += ';' + (colors[type] || colors.info);
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'circle-info'}"></i> ${escHtml(msg)}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 4000);
}
