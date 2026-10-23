/* ============================================
   AUTHX DASHBOARD — dashboard.js
   Full data layer: tables, modals, nav, state
   ============================================ */

'use strict';

/* ============================================
   STATE
   ============================================ */
const STATE = {
    licenses:    [],
    users:       [],
    variables:   [],
    sessions:    [],
    logs:        [],
    resellers:   [],
    subscriptions: [],
    threats:     [],
    blacklist:   [],
    hwids:       [],
};

/* ============================================
   SEED DATA
   ============================================ */
function seedData() {
    /* Licenses */
    STATE.licenses = [
        { id:1, key:'ArenaSystem-A3K9-B7XP-C2MN-D4QR', user:'xXProGamerXx', level:'Elite',    duration:'Lifetime', created:'2026-08-01', expires:'Never',      status:'active'  },
        { id:2, key:'ArenaSystem-E5TW-F8VY-G1ZJ-H6LS', user:'dev_salim',    level:'Premium',   duration:'30 Days',  created:'2026-09-15', expires:'2026-10-15', status:'active'  },
        { id:3, key:'ArenaSystem-I9UO-J0PQ-K3RS-L7TU', user:'—',            level:'Standard',  duration:'7 Days',   created:'2026-10-01', expires:'2026-10-08', status:'unused'  },
        { id:4, key:'ArenaSystem-M2VW-N4XY-O6AB-P8CD', user:'karim_coder',  level:'Standard',  duration:'1 Year',   created:'2025-10-01', expires:'2026-10-01', status:'expired' },
        { id:5, key:'ArenaSystem-Q1EF-R5GH-S9IJ-T3KL', user:'hamza_dev',    level:'Premium',   duration:'7 Days',   created:'2026-09-25', expires:'2026-10-02', status:'active'  },
        { id:6, key:'ArenaSystem-U7MN-V2OP-W6QR-X0ST', user:'cheater_404',  level:'Standard',  duration:'30 Days',  created:'2026-09-10', expires:'2026-10-10', status:'banned'  },
        { id:7, key:'ArenaSystem-Y4UV-Z8WX-A2BC-B6DE', user:'aziz_dev',     level:'Elite',     duration:'1 Year',   created:'2026-01-15', expires:'2027-01-15', status:'active'  },
        { id:8, key:'ArenaSystem-C0FG-D4HI-E8JK-F2LM', user:'—',            level:'Premium',   duration:'90 Days',  created:'2026-10-03', expires:'2027-01-01', status:'unused'  },
    ];

    /* Users */
    STATE.users = [
        { id:1, username:'xXProGamerXx', email:'pro@gamer.io',    key:'ArenaSystem-A3K9-...', hwid:'4F3A-B2C1-D9E8', ip:'185.220.101.42', level:'Elite',   lastLogin:'2 min ago',  status:'active' },
        { id:2, username:'dev_salim',    email:'salim@dev.ma',    key:'ArenaSystem-E5TW-...', hwid:'1A2B-3C4D-5E6F', ip:'91.108.4.200',  level:'Premium', lastLogin:'5 min ago',  status:'active' },
        { id:3, username:'hamza_dev',    email:'hamza@mail.com',  key:'ArenaSystem-Q1EF-...', hwid:'7G8H-9I0J-1K2L', ip:'77.83.199.78',  level:'Premium', lastLogin:'1 hr ago',   status:'active' },
        { id:4, username:'aziz_dev',     email:'aziz@coder.ma',  key:'ArenaSystem-Y4UV-...', hwid:'3M4N-5O6P-7Q8R', ip:'103.145.80.90', level:'Elite',   lastLogin:'3 hr ago',   status:'active' },
        { id:5, username:'karim_coder',  email:'karim@mail.com', key:'ArenaSystem-M2VW-...', hwid:'9S0T-1U2V-3W4X', ip:'192.168.1.105', level:'Standard',lastLogin:'2 days ago', status:'expired'},
        { id:6, username:'cheater_404',  email:'cheat@dark.net', key:'ArenaSystem-U7MN-...', hwid:'5Y6Z-7A8B-9C0D', ip:'94.102.49.20',  level:'Standard',lastLogin:'5 days ago', status:'banned' },
    ];

    /* Variables */
    STATE.variables = [
        { id:1, name:'app_version',   type:'String',  value:'2.6.0',        encrypted:false, updated:'2026-10-01' },
        { id:2, name:'secret_key',    type:'String',  value:'••••••••••••', encrypted:true,  updated:'2026-09-28' },
        { id:3, name:'max_users',     type:'Integer', value:'10000',        encrypted:false, updated:'2026-09-15' },
        { id:4, name:'debug_mode',    type:'Boolean', value:'false',        encrypted:false, updated:'2026-10-02' },
        { id:5, name:'config_json',   type:'JSON',    value:'{"key":"val"}',encrypted:true,  updated:'2026-10-03' },
    ];

    /* Sessions */
    STATE.sessions = [
        { user:'xXProGamerXx', ip:'185.220.101.42', hwid:'4F3A-B2C1', nonce:'0xA3F9...', started:'14:32:01', duration:'8m 12s', status:'active' },
        { user:'dev_salim',    ip:'91.108.4.200',   hwid:'1A2B-3C4D', nonce:'0xB7C2...', started:'14:28:44', duration:'11m 50s', status:'active' },
        { user:'hamza_dev',    ip:'77.83.199.78',   hwid:'7G8H-9I0J', nonce:'0xD1E4...', started:'14:10:09', duration:'30m 05s', status:'active' },
    ];

    /* Logs */
    STATE.logs = [
        { ts:'14:40:12', event:'LOGIN',        user:'xXProGamerXx', ip:'185.220.101.42', details:'HWID match OK',            result:'success' },
        { ts:'14:39:50', event:'LOGIN',        user:'dev_salim',    ip:'91.108.4.200',   details:'HWID match OK',            result:'success' },
        { ts:'14:38:21', event:'REGISTER',     user:'newuser_99',   ip:'178.62.194.12',  details:'Key ArenaSystem-I9UO activated', result:'success' },
        { ts:'14:35:44', event:'BAN',          user:'cheater_404',  ip:'94.102.49.20',   details:'HWID ban applied',         result:'warn'    },
        { ts:'14:30:09', event:'KEY_GEN',      user:'MasterAdmin',  ip:'127.0.0.1',      details:'Batch: 8 keys generated',  result:'success' },
        { ts:'14:22:33', event:'LOGIN_FAIL',   user:'unknown',      ip:'45.33.32.156',   details:'Invalid key attempt',      result:'error'   },
        { ts:'14:15:00', event:'LOGOUT',       user:'karim_coder',  ip:'192.168.1.105',  details:'Session ended',            result:'success' },
        { ts:'14:10:44', event:'VAR_UPDATE',   user:'MasterAdmin',  ip:'127.0.0.1',      details:'secret_key updated',       result:'success' },
        { ts:'13:55:12', event:'LOGIN_FAIL',   user:'unknown',      ip:'198.51.100.22',  details:'Brute force detected',     result:'error'   },
        { ts:'13:40:00', event:'SETTINGS',     user:'MasterAdmin',  ip:'127.0.0.1',      details:'HWID lock enabled',        result:'success' },
    ];

    /* Resellers */
    STATE.resellers = [
        { id:1, name:'ResellerOne',  email:'reseller1@mail.com', quotaUsed:45, quotaTotal:100, sold:45, joined:'2026-07-01', status:'active' },
        { id:2, name:'DarkSeller',   email:'dark@sell.net',      quotaUsed:12, quotaTotal:50,  sold:12, joined:'2026-08-15', status:'active' },
        { id:3, name:'KeyMaster_MA', email:'km@keys.ma',         quotaUsed:80, quotaTotal:100, sold:80, joined:'2026-06-10', status:'active' },
    ];

    /* Subscriptions */
    STATE.subscriptions = [
        { name:'Standard', duration:'30 Days',  price:'$2.99', activeKeys:3, hwid:true,  status:'active' },
        { name:'Premium',  duration:'90 Days',  price:'$7.99', activeKeys:3, hwid:true,  status:'active' },
        { name:'Elite',    duration:'Lifetime', price:'$24.99',activeKeys:2, hwid:true,  status:'active' },
    ];

    /* Threats */
    STATE.threats = [
        { time:'14:22:33', threat:'Brute Force',        ip:'45.33.32.156',   user:'unknown',     severity:'high',   action:'IP blocked'      },
        { time:'13:55:12', threat:'Repeated Fail Auth', ip:'198.51.100.22',  user:'unknown',     severity:'medium', action:'Logged'          },
        { time:'12:10:44', threat:'Debugger Detected',  ip:'103.21.55.19',   user:'test_user_1', severity:'high',   action:'Session killed'  },
    ];
}

/* ============================================
   HELPERS
   ============================================ */
/* ============================================
   KEY GENERATOR — UNICODE PREFIX + LEVELS
   ============================================ */

/* Unicode bold char maps */
const BOLD_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    .split('').reduce((m, c, i) => {
        const bases = [0x1D400, 0x1D41A, 0x1D7CE]; // bold upper, bold lower, bold digit
        if      (i < 26) m[c] = String.fromCodePoint(0x1D400 + i);
        else if (i < 52) m[c] = String.fromCodePoint(0x1D41A + (i - 26));
        else             m[c] = String.fromCodePoint(0x1D7CE + (i - 52));
        return m;
    }, {});

function toBold(str) {
    return str.split('').map(c => BOLD_UPPER[c] || c).join('');
}

/* Level config */
const LEVEL_CONFIG = {
    Standard: { prefix: toBold('ArenaSystem') + '-', color: 'key-standard', icon:'🔑' },
    Premium:  { prefix: toBold('ArenaSystem') + '-', color: 'key-premium',  icon:'⭐' },
    Extreme:  { prefix: toBold('XTRM')  + '-', color: 'key-extreme',  icon:'⚡' },
    Complex:  { prefix: toBold('COMPL') + '-', color: 'key-complex',  icon:'💎' },
    Custom:   { prefix: '',                     color: 'key-custom',   icon:'✏️' },
};

/* Char sets */
const CHAR_SETS = {
    alphanum: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    upper:    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:    'abcdefghijklmnopqrstuvwxyz',
    numbers:  '0123456789',
    hex:      '0123456789ABCDEF',
};

/**
 * Generate one key
 * @param {string} prefix   — full prefix including dash e.g. "𝐆𝐳𝐞𝐧𝐨𝐌𝐨𝐝𝐳-"
 * @param {number} segLen   — chars per segment (4|5|6)
 * @param {number} segCount — number of segments (3|4|5)
 * @param {string} charSet  — key of CHAR_SETS
 */
function genKey(prefix = toBold('ArenaSystem') + '-', segLen = 5, segCount = 4, charSet = 'alphanum') {
    const chars = CHAR_SETS[charSet] || CHAR_SETS.alphanum;
    const segments = Array.from({ length: segCount }, () =>
        Array.from({ length: segLen }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join('')
    );
    return prefix + segments.join('-');
}

function statusBadge(s) {
    const map = {
        active:  '<span class="badge badge-green">Active</span>',
        unused:  '<span class="badge badge-yellow">Unused</span>',
        expired: '<span class="badge badge-gray">Expired</span>',
        banned:  '<span class="badge badge-red">Banned</span>',
    };
    return map[s] || `<span class="badge badge-gray">${s}</span>`;
}
function levelBadge(l) {
    const map = {
        Elite:    '<span class="badge badge-green">Elite</span>',
        Premium:  '<span class="badge badge-blue">Premium</span>',
        Standard: '<span class="badge badge-gray">Standard</span>',
    };
    return map[l] || `<span class="badge badge-gray">${l}</span>`;
}
function resultBadge(r) {
    const map = {
        success: '<span class="badge badge-green">OK</span>',
        error:   '<span class="badge badge-red">Fail</span>',
        warn:    '<span class="badge badge-yellow">Warn</span>',
    };
    return map[r] || `<span class="badge badge-gray">${r}</span>`;
}
function copyText(text) {
    navigator.clipboard?.writeText(text);
    showDashToast('Copied to clipboard!', 'success');
}
function userAvatar(name) {
    const colors = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444'];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    const bg = colors[Math.abs(h) % colors.length];
    return `<div style="width:28px;height:28px;border-radius:6px;background:${bg};display:inline-flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:900;color:#000;flex-shrink:0">${name.slice(0,2).toUpperCase()}</div>`;
}

/* ============================================
   COUNTERS UPDATE
   ============================================ */
function updateCounters() {
    const active  = STATE.licenses.filter(l => l.status === 'active').length;
    const unused  = STATE.licenses.filter(l => l.status === 'unused').length;
    const banned  = STATE.licenses.filter(l => l.status === 'banned').length;
    const expired = STATE.licenses.filter(l => l.status === 'expired').length;

    setText('ov-total-keys',   STATE.licenses.length);
    setText('ov-active-keys',  active);
    setText('ov-unused-keys',  unused + ' Unused');
    setText('ov-banned-keys',  banned);
    setText('ov-sessions',     STATE.sessions.length);
    setText('ov-vars',         STATE.variables.length);
    setText('ov-secret-vars',  STATE.variables.filter(v => v.encrypted).length);
    setText('ov-switches',     STATE.variables.filter(v => v.type === 'Boolean').length);
    setText('ov-resellers',    STATE.resellers.length);

    /* Sidebar counts */
    setText('cnt-licenses',  STATE.licenses.length);
    setText('cnt-subs',      STATE.subscriptions.length);
    setText('cnt-vars',      STATE.variables.length);
    setText('cnt-users',     STATE.users.length);
    setText('cnt-sessions',  STATE.sessions.length);
    setText('cnt-logs',      STATE.logs.length);
    setText('cnt-sec',       STATE.threats.length);
    setText('cnt-resellers', STATE.resellers.length);
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ============================================
   RENDER TABLES
   ============================================ */

/* --- LICENSES --- */
function renderLicenses(filter = 'all', query = '') {
    const tbody = document.getElementById('licensesBody');
    const empty = document.getElementById('licensesEmpty');
    if (!tbody) return;

    let data = STATE.licenses;
    if (filter !== 'all') data = data.filter(l => l.status === filter);
    if (query) data = data.filter(l =>
        l.key.toLowerCase().includes(query) ||
        l.user.toLowerCase().includes(query)
    );

    if (!data.length) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = data.map(l => `
        <tr>
            <td><input type="checkbox" aria-label="Select"></td>
            <td>
                <span class="cell-copy cell-mono" onclick="copyText('${l.key}')" title="Click to copy">
                    ${l.key.slice(0,18)}... <i class="fas fa-copy" style="font-size:.6rem;opacity:.5"></i>
                </span>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:7px">
                    ${l.user !== '—' ? userAvatar(l.user) : ''}
                    <span class="cell-bold">${l.user}</span>
                </div>
            </td>
            <td>${levelBadge(l.level)}</td>
            <td class="cell-mono cell-dim">${l.duration}</td>
            <td class="cell-mono cell-dim">${l.created}</td>
            <td class="cell-mono cell-dim">${l.expires}</td>
            <td>${statusBadge(l.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="row-btn success" title="Activate" onclick="setLicenseStatus(${l.id},'active')"><i class="fas fa-check"></i></button>
                    <button class="row-btn" title="Copy full key" onclick="copyText('${l.key}')"><i class="fas fa-copy"></i></button>
                    <button class="row-btn danger" title="Ban" onclick="setLicenseStatus(${l.id},'banned')"><i class="fas fa-ban"></i></button>
                    <button class="row-btn danger" title="Delete" onclick="deleteLicense(${l.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

window.setLicenseStatus = function(id, status) {
    const lic = STATE.licenses.find(l => l.id === id);
    if (!lic) return;
    lic.status = status;
    renderLicenses();
    updateCounters();
    showDashToast(`Key ${status === 'banned' ? 'banned' : 'activated'}`, status === 'banned' ? 'error' : 'success');
};
window.deleteLicense = function(id) {
    if (!confirm('Delete this license key?')) return;
    STATE.licenses = STATE.licenses.filter(l => l.id !== id);
    renderLicenses();
    updateCounters();
    showDashToast('License deleted', 'error');
};

/* --- USERS --- */
function renderUsers(filter = 'all', query = '') {
    const tbody = document.getElementById('usersBody');
    const empty = document.getElementById('usersEmpty');
    if (!tbody) return;

    let data = STATE.users;
    if (filter !== 'all') data = data.filter(u => u.status === filter);
    if (query) data = data.filter(u =>
        u.username.toLowerCase().includes(query) ||
        u.ip.toLowerCase().includes(query) ||
        u.hwid.toLowerCase().includes(query)
    );

    if (!data.length) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = data.map(u => `
        <tr>
            <td><input type="checkbox" aria-label="Select"></td>
            <td>
                <div style="display:flex;align-items:center;gap:8px">
                    ${userAvatar(u.username)}
                    <div>
                        <div class="cell-bold" style="font-size:.8rem">${u.username}</div>
                        <div class="cell-dim" style="font-size:.68rem;font-family:var(--mono)">${u.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="cell-mono" style="font-size:.7rem;color:var(--green)">${u.key}</span></td>
            <td><span class="cell-mono cell-dim" style="font-size:.7rem">${u.hwid}</span></td>
            <td><span class="cell-mono cell-dim" style="font-size:.7rem">${u.ip}</span></td>
            <td>${levelBadge(u.level)}</td>
            <td class="cell-dim" style="font-size:.72rem">${u.lastLogin}</td>
            <td>${statusBadge(u.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="row-btn" title="View user"
                            onclick="showDashToast('Viewing ${u.username}','success')">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${u.status === 'banned'
                        ? `<button class="row-btn success" title="Unban user" onclick="banUser(${u.id})"
                                style="color:var(--green);border-color:var(--green-border);background:var(--green-dim)">
                                <i class="fas fa-lock-open"></i>
                           </button>`
                        : `<button class="row-btn danger" title="Ban user" onclick="banUser(${u.id})">
                                <i class="fas fa-ban"></i>
                           </button>`
                    }
                    <button class="row-btn danger" title="Delete user" onclick="deleteUser(${u.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}

window.banUser = function(id) {
    const u = STATE.users.find(u => u.id === id);
    if (!u) return;
    u.status = u.status === 'banned' ? 'active' : 'banned';
    renderUsers();
    updateCounters();
    showDashToast(u.status === 'banned' ? `${u.username} banned` : `${u.username} unbanned`,
        u.status === 'banned' ? 'error' : 'success');
};
window.deleteUser = function(id) {
    if (!confirm('Delete this user?')) return;
    STATE.users = STATE.users.filter(u => u.id !== id);
    renderUsers();
    updateCounters();
    showDashToast('User deleted', 'error');
};

/* --- VARIABLES --- */
function renderVariables() {
    const tbody = document.getElementById('varsBody');
    if (!tbody) return;
    tbody.innerHTML = STATE.variables.map(v => `
        <tr>
            <td class="cell-bold cell-mono" style="color:var(--green)">${v.name}</td>
            <td><span class="badge badge-blue">${v.type}</span></td>
            <td class="cell-mono cell-dim" style="font-size:.72rem;max-width:200px;overflow:hidden;text-overflow:ellipsis">${v.value}</td>
            <td>${v.encrypted ? '<span class="badge badge-green"><i class="fas fa-lock" style="font-size:.55rem"></i> Yes</span>' : '<span class="badge badge-gray">No</span>'}</td>
            <td class="cell-dim" style="font-size:.72rem">${v.updated}</td>
            <td>
                <div class="row-actions">
                    <button class="row-btn" title="Edit" onclick="showDashToast('Edit coming soon','success')"><i class="fas fa-pen"></i></button>
                    <button class="row-btn danger" title="Delete" onclick="deleteVar(${v.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}
window.deleteVar = function(id) {
    if (!confirm('Delete this variable?')) return;
    STATE.variables = STATE.variables.filter(v => v.id !== id);
    renderVariables();
    updateCounters();
    showDashToast('Variable deleted', 'error');
};

/* --- SESSIONS --- */
function renderSessions() {
    const tbody = document.getElementById('sessionsBody');
    const empty = document.getElementById('sessionsEmpty');
    if (!tbody) return;
    if (!STATE.sessions.length) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = STATE.sessions.map((s, i) => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:7px">
                    ${userAvatar(s.user)}
                    <span class="cell-bold">${s.user}</span>
                </div>
            </td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${s.ip}</td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${s.hwid}</td>
            <td class="cell-mono" style="font-size:.7rem;color:var(--green)">${s.nonce}</td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${s.started}</td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${s.duration}</td>
            <td><span class="badge badge-green">Live</span></td>
            <td>
                <button class="row-btn danger" title="Kill session" onclick="killSession(${i})"><i class="fas fa-power-off"></i></button>
            </td>
        </tr>`).join('');
}
window.killSession = function(i) {
    const s = STATE.sessions[i];
    if (!confirm(`Kill session for ${s.user}?`)) return;
    STATE.sessions.splice(i, 1);
    renderSessions();
    updateCounters();
    showDashToast(`Session killed: ${s.user}`, 'error');
};

/* --- LOGS --- */
function renderLogs() {
    const tbody = document.getElementById('logsBody');
    if (!tbody) return;
    const eventBadge = e => {
        const map = {
            LOGIN:      '<span class="badge badge-green">LOGIN</span>',
            LOGOUT:     '<span class="badge badge-gray">LOGOUT</span>',
            REGISTER:   '<span class="badge badge-blue">REGISTER</span>',
            BAN:        '<span class="badge badge-red">BAN</span>',
            KEY_GEN:    '<span class="badge badge-yellow">KEY_GEN</span>',
            LOGIN_FAIL: '<span class="badge badge-red">FAIL</span>',
            VAR_UPDATE: '<span class="badge badge-blue">VAR</span>',
            SETTINGS:   '<span class="badge badge-gray">SETTINGS</span>',
        };
        return map[e] || `<span class="badge badge-gray">${e}</span>`;
    };
    tbody.innerHTML = STATE.logs.map(l => `
        <tr>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${l.ts}</td>
            <td>${eventBadge(l.event)}</td>
            <td>
                <div style="display:flex;align-items:center;gap:7px">
                    ${l.user !== 'unknown' ? userAvatar(l.user) : '<span style="width:28px;height:28px;border-radius:6px;background:var(--surface3);display:inline-flex;align-items:center;justify-content:center;font-size:.6rem;color:var(--text3)">?</span>'}
                    <span class="cell-bold">${l.user}</span>
                </div>
            </td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${l.ip}</td>
            <td class="cell-dim" style="font-size:.72rem">${l.details}</td>
            <td>${resultBadge(l.result)}</td>
        </tr>`).join('');
}

/* --- RESELLERS --- */
function renderResellers() {
    const tbody = document.getElementById('resellersBody');
    const empty = document.getElementById('resellersEmpty');
    if (!tbody) return;
    if (!STATE.resellers.length) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';
    tbody.innerHTML = STATE.resellers.map(r => `
        <tr>
            <td>
                <div style="display:flex;align-items:center;gap:8px">
                    ${userAvatar(r.name)}
                    <span class="cell-bold">${r.name}</span>
                </div>
            </td>
            <td class="cell-mono cell-dim" style="font-size:.7rem">${r.email}</td>
            <td>
                <div style="display:flex;align-items:center;gap:7px">
                    <div style="flex:1;height:4px;background:var(--surface3);border-radius:99px;overflow:hidden;min-width:60px">
                        <div style="height:100%;width:${(r.quotaUsed/r.quotaTotal*100).toFixed(0)}%;background:var(--green);border-radius:99px;box-shadow:0 0 5px var(--green-glow)"></div>
                    </div>
                    <span class="cell-mono cell-dim" style="font-size:.7rem">${r.quotaUsed}/${r.quotaTotal}</span>
                </div>
            </td>
            <td class="cell-mono cell-dim">${r.quotaTotal}</td>
            <td class="cell-mono cell-dim">${r.sold}</td>
            <td class="cell-dim" style="font-size:.72rem">${r.joined}</td>
            <td>${statusBadge(r.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="row-btn success" title="Grant quota" onclick="showDashToast('Grant quota: coming soon','success')"><i class="fas fa-plus"></i></button>
                    <button class="row-btn danger" title="Remove" onclick="deleteReseller(${r.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}
window.deleteReseller = function(id) {
    if (!confirm('Remove this reseller?')) return;
    STATE.resellers = STATE.resellers.filter(r => r.id !== id);
    renderResellers();
    updateCounters();
    showDashToast('Reseller removed', 'error');
};

/* --- SUBSCRIPTIONS --- */
function renderSubscriptions() {
    const tbody = document.getElementById('subsBody');
    if (!tbody) return;
    tbody.innerHTML = STATE.subscriptions.map(s => `
        <tr>
            <td class="cell-bold">${s.name}</td>
            <td class="cell-mono cell-dim">${s.duration}</td>
            <td class="cell-mono" style="color:var(--green)">${s.price}</td>
            <td class="cell-mono">${s.activeKeys}</td>
            <td>${s.hwid ? '<span class="badge badge-green">Enabled</span>' : '<span class="badge badge-gray">Off</span>'}</td>
            <td>${statusBadge(s.status)}</td>
            <td>
                <div class="row-actions">
                    <button class="row-btn" title="Edit"><i class="fas fa-pen"></i></button>
                    <button class="row-btn danger" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>`).join('');
}

/* --- SECURITY --- */
function renderSecurity() {
    /* Threats */
    const threatsBody = document.getElementById('threatsBody');
    if (threatsBody) {
        threatsBody.innerHTML = STATE.threats.map(t => `
            <tr>
                <td class="cell-mono cell-dim" style="font-size:.7rem">${t.time}</td>
                <td class="cell-bold">${t.threat}</td>
                <td class="cell-mono cell-dim" style="font-size:.7rem">${t.ip}</td>
                <td class="cell-bold">${t.user}</td>
                <td>${t.severity === 'high' ? '<span class="badge badge-red">HIGH</span>' : '<span class="badge badge-yellow">MEDIUM</span>'}</td>
                <td class="cell-dim" style="font-size:.72rem">${t.action}</td>
            </tr>`).join('');
    }
    /* Empty states */
    const blEmpty = document.getElementById('blacklistEmpty');
    if (blEmpty) blEmpty.style.display = 'block';
    const hwEmpty = document.getElementById('hwidEmpty');
    if (hwEmpty) hwEmpty.style.display = 'block';
}

/* ============================================
   SIDEBAR NAV
   ============================================ */
function initNav() {
    const links = document.querySelectorAll('.sidebar-link[data-page]');
    const quickItems = document.querySelectorAll('.quick-action-item[data-page]');
    const statLinks  = document.querySelectorAll('.stat-card-link[data-page]');

    function navigate(page) {
        /* Deactivate all */
        links.forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        /* Activate target */
        const link = document.querySelector(`.sidebar-link[data-page="${page}"]`);
        const pageEl = document.getElementById(`page-${page}`);
        if (link) link.classList.add('active');
        if (pageEl) pageEl.classList.add('active');

        /* Breadcrumb */
        const bc = document.getElementById('breadcrumbCurrent');
        if (bc && link) bc.textContent = link.querySelector('.sidebar-link-text')?.textContent || page;

        /* Render page data */
        switch(page) {
            case 'licenses':      renderLicenses(); break;
            case 'users':         renderUsers(); break;
            case 'variables':     renderVariables(); break;
            case 'sessions':      renderSessions(); break;
            case 'logs':          renderLogs(); break;
            case 'resellers':     renderResellers(); break;
            case 'subscriptions': renderSubscriptions(); break;
            case 'security':      renderSecurity(); break;
        }

        /* Mobile close */
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 768 && sidebar) sidebar.classList.remove('open');
    }

    links.forEach(l => l.addEventListener('click', e => { e.preventDefault(); navigate(l.dataset.page); }));
    quickItems.forEach(i => i.addEventListener('click', () => navigate(i.dataset.page)));
    statLinks.forEach(l => l.addEventListener('click', e => { e.preventDefault(); navigate(l.dataset.page); }));

    /* Sidebar toggle mobile */
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (toggle && sidebar) {
        toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.addEventListener('click', e => {
            if (window.innerWidth < 768 && !sidebar.contains(e.target) && !toggle.contains(e.target))
                sidebar.classList.remove('open');
        });
    }
}

/* ============================================
   GENERATE KEYS
   ============================================ */
function initGenerate() {
    /* Inline panel toggle */
    const toggleBtn  = document.getElementById('toggleGenPanel');
    const panel      = document.getElementById('genPanel');
    const closePanel = document.getElementById('closeGenPanel');
    const doGen      = document.getElementById('doGenerate');

    if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));
        closePanel?.addEventListener('click', () => panel.classList.remove('open'));
        doGen?.addEventListener('click', () => {
            generateKeys(
                parseInt(document.getElementById('genQty').value) || 1,
                document.getElementById('genDuration').value,
                document.getElementById('genPrefix').value || 'ArenaSystem-',
                document.getElementById('genLevel').value
            );
            panel.classList.remove('open');
        });
    }

    /* Modal */
    const openModal    = document.getElementById('openGenModal');
    const modal        = document.getElementById('genModal');
    const closeModal   = document.getElementById('closeGenModal');
    const cancelModal  = document.getElementById('cancelGenModal');
    const confirmModal = document.getElementById('confirmGenModal');

    openModal?.addEventListener('click',  () => { modal.style.display = 'flex'; });
    closeModal?.addEventListener('click', () => { modal.style.display = 'none'; });
    cancelModal?.addEventListener('click',() => { modal.style.display = 'none'; });
    modal?.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    confirmModal?.addEventListener('click', () => {
        generateKeys(
            parseInt(document.getElementById('modalQty').value) || 1,
            document.getElementById('modalDuration').value,
            document.getElementById('modalPrefix').value || 'ArenaSystem-',
            document.getElementById('modalLevel').value
        );
        modal.style.display = 'none';
    });
}

function generateKeys(qty, duration, prefix, level) {
    qty = Math.min(qty, 100);
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < qty; i++) {
        STATE.licenses.push({
            id:       Date.now() + i,
            key:      genKey(prefix),
            user:     '—',
            level,
            duration,
            created:  today,
            expires:  duration === 'Lifetime' ? 'Never' : 'Calculated',
            status:   'unused',
        });
    }
    renderLicenses();
    updateCounters();
    showDashToast(`Generated ${qty} key${qty > 1 ? 's' : ''} successfully!`, 'success');
}

/* ============================================
   ADD USER MODAL
   ============================================ */
function initAddUser() {
    const open    = document.getElementById('openAddUserModal');
    const modal   = document.getElementById('addUserModal');
    const close   = document.getElementById('closeAddUserModal');
    const cancel  = document.getElementById('cancelAddUserModal');
    const confirm = document.getElementById('confirmAddUser');

    open?.addEventListener('click',   () => { modal.style.display = 'flex'; });
    close?.addEventListener('click',  () => { modal.style.display = 'none'; });
    cancel?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal?.addEventListener('click',  e => { if (e.target === modal) modal.style.display = 'none'; });

    confirm?.addEventListener('click', () => {
        const username = document.getElementById('newUsername').value.trim();
        const key      = document.getElementById('newUserKey').value.trim();
        const email    = document.getElementById('newUserEmail').value.trim();
        if (!username) { showDashToast('Username is required', 'error'); return; }
        STATE.users.push({
            id: Date.now(), username, email: email || '—', key: key || '—',
            hwid: 'Not set', ip: 'Unknown', level: 'Standard',
            lastLogin: 'Never', status: 'active',
        });
        renderUsers();
        updateCounters();
        modal.style.display = 'none';
        document.getElementById('newUsername').value = '';
        document.getElementById('newUserKey').value  = '';
        document.getElementById('newUserEmail').value = '';
        showDashToast(`User "${username}" added!`, 'success');
    });
}

/* ============================================
   ADD VARIABLE MODAL
   ============================================ */
function initAddVar() {
    const open    = document.getElementById('openAddVarModal');
    const modal   = document.getElementById('addVarModal');
    const close   = document.getElementById('closeAddVarModal');
    const cancel  = document.getElementById('cancelAddVarModal');
    const confirm = document.getElementById('confirmAddVar');

    open?.addEventListener('click',   () => { modal.style.display = 'flex'; });
    close?.addEventListener('click',  () => { modal.style.display = 'none'; });
    cancel?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal?.addEventListener('click',  e => { if (e.target === modal) modal.style.display = 'none'; });

    confirm?.addEventListener('click', () => {
        const name      = document.getElementById('varName').value.trim();
        const type      = document.getElementById('varType').value;
        const value     = document.getElementById('varValue').value.trim();
        const encrypted = document.getElementById('varEncrypted').checked;
        if (!name) { showDashToast('Variable name is required', 'error'); return; }
        STATE.variables.push({
            id: Date.now(), name, type,
            value: encrypted ? '••••••••••••' : value,
            encrypted,
            updated: new Date().toISOString().split('T')[0],
        });
        renderVariables();
        updateCounters();
        modal.style.display = 'none';
        document.getElementById('varName').value  = '';
        document.getElementById('varValue').value = '';
        showDashToast(`Variable "${name}" saved!`, 'success');
    });
}

/* ============================================
   KILL ALL SESSIONS
   ============================================ */
function initSessions() {
    document.getElementById('killAllSessions')?.addEventListener('click', () => {
        if (!STATE.sessions.length) { showDashToast('No active sessions', 'success'); return; }
        if (!confirm(`Kill all ${STATE.sessions.length} active sessions?`)) return;
        STATE.sessions = [];
        renderSessions();
        updateCounters();
        showDashToast('All sessions terminated', 'error');
    });
}

/* ============================================
   SEARCH FILTERS
   ============================================ */
function initFilters() {
    /* License search */
    document.getElementById('searchLicenses')?.addEventListener('input', function() {
        const active = document.querySelector('#page-licenses .filter-tab.active')?.dataset.filter || 'all';
        renderLicenses(active, this.value.toLowerCase());
    });
    /* License filter tabs */
    document.querySelectorAll('#page-licenses .filter-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#page-licenses .filter-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const q = document.getElementById('searchLicenses')?.value.toLowerCase() || '';
            renderLicenses(this.dataset.filter || 'all', q);
        });
    });

    /* User search */
    document.getElementById('searchUsers')?.addEventListener('input', function() {
        const active = document.querySelector('#page-users .filter-tab.active')?.dataset.filter || 'all';
        renderUsers(active, this.value.toLowerCase());
    });
    /* User filter tabs */
    document.querySelectorAll('#page-users .filter-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#page-users .filter-tab').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const q = document.getElementById('searchUsers')?.value.toLowerCase() || '';
            renderUsers(this.dataset.filter || 'all', q);
        });
    });
}

/* ============================================
   SETTINGS SAVE
   ============================================ */
function initSettings() {
    document.getElementById('saveSettings')?.addEventListener('click', () => {
        showDashToast('Settings saved successfully!', 'success');
    });
}

/* ============================================
   TOAST
   ============================================ */
function showDashToast(msg, type = 'success') {
    let container = document.getElementById('dashToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'dashToastContainer';
        Object.assign(container.style, {
            position:'fixed', bottom:'20px', right:'20px', zIndex:'9999',
            display:'flex', flexDirection:'column', gap:'8px', pointerEvents:'none',
        });
        document.body.appendChild(container);
    }
    const map = {
        success: { border:'var(--green-border)', color:'var(--green)', icon:'fa-circle-check' },
        error:   { border:'rgba(239,68,68,0.3)', color:'var(--red)',   icon:'fa-circle-xmark' },
        info:    { border:'rgba(59,130,246,0.3)', color:'var(--blue)', icon:'fa-circle-info'  },
    };
    const c = map[type] || map.success;
    const t = document.createElement('div');
    Object.assign(t.style, {
        display:'flex', alignItems:'center', gap:'8px',
        padding:'9px 14px',
        background:'var(--bg2)',
        border:`1px solid ${c.border}`,
        borderRadius:'8px',
        color: c.color,
        fontSize:'.75rem', fontWeight:'700',
        fontFamily:'var(--mono)',
        boxShadow:'0 6px 20px rgba(0,0,0,0.5)',
        animation:'pageFadeIn .2s ease',
        pointerEvents:'all',
    });
    t.innerHTML = `<i class="fas ${c.icon}"></i><span style="color:var(--text2);font-weight:600">${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.transition = 'opacity .25s, transform .25s';
        t.style.opacity = '0'; t.style.transform = 'translateX(10px)';
        setTimeout(() => t.remove(), 250);
    }, 2800);
}
window.showDashToast = showDashToast;
window.showToast = showDashToast; /* compat */

/* ============================================
   LIVE CLOCK
   ============================================ */
function initClock() {
    const el = document.getElementById('breadcrumbCurrent');
    /* Just update session durations every 10s */
    setInterval(() => {
        STATE.sessions.forEach(s => {
            /* Simple tick — just a visual indicator */
            const parts = s.duration.match(/(\d+)m (\d+)s/);
            if (parts) {
                let m = parseInt(parts[1]), sc = parseInt(parts[2]) + 10;
                if (sc >= 60) { m++; sc -= 60; }
                s.duration = `${m}m ${sc.toString().padStart(2,'0')}s`;
            }
        });
        const active = document.getElementById('page-sessions');
        if (active?.classList.contains('active')) renderSessions();
    }, 10000);
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    seedData();
    updateCounters();
    initNav();
    initGenerate();
    initAddUser();
    initAddVar();
    initSessions();
    initFilters();
    initSettings();
    initClock();

    /* Inject CSS var for mono font if not in main.css */
    document.documentElement.style.setProperty('--mono', "'JetBrains Mono', 'Courier New', monospace");
});

/* ============================================
   NOTIFICATIONS SYSTEM
   ============================================ */

const NOTIF_STATE = {
    items: [],
    nextId: 1,
};

/* Default seed notifications */
function seedNotifications() {
    const now = Date.now();
    NOTIF_STATE.items = [
        {
            id: NOTIF_STATE.nextId++,
            type: 'ban',
            icon: 'fa-ban',
            iconClass: 'ni-red',
            title: 'User Banned',
            desc: 'cheater_404 was banned — HWID locked',
            time: '2 min ago',
            ts: now - 2 * 60000,
            unread: true,
        },
        {
            id: NOTIF_STATE.nextId++,
            type: 'login',
            icon: 'fa-right-to-bracket',
            iconClass: 'ni-green',
            title: 'New Login',
            desc: 'xXProGamerXx authenticated successfully',
            time: '5 min ago',
            ts: now - 5 * 60000,
            unread: true,
        },
        {
            id: NOTIF_STATE.nextId++,
            type: 'keygen',
            icon: 'fa-key',
            iconClass: 'ni-yellow',
            title: 'Keys Generated',
            desc: '8 Elite license keys generated by MasterAdmin',
            time: '12 min ago',
            ts: now - 12 * 60000,
            unread: true,
        },
        {
            id: NOTIF_STATE.nextId++,
            type: 'warn',
            icon: 'fa-triangle-exclamation',
            iconClass: 'ni-yellow',
            title: 'Brute Force Detected',
            desc: 'IP 45.33.32.156 — 12 failed attempts blocked',
            time: '22 min ago',
            ts: now - 22 * 60000,
            unread: true,
        },
        {
            id: NOTIF_STATE.nextId++,
            type: 'register',
            icon: 'fa-user-plus',
            iconClass: 'ni-blue',
            title: 'New Registration',
            desc: 'newuser_99 registered with key ArenaSystem-I9UO-...',
            time: '38 min ago',
            ts: now - 38 * 60000,
            unread: false,
        },
        {
            id: NOTIF_STATE.nextId++,
            type: 'system',
            icon: 'fa-gear',
            iconClass: 'ni-blue',
            title: 'Settings Updated',
            desc: 'HWID Locking was enabled by MasterAdmin',
            time: '1 hr ago',
            ts: now - 60 * 60000,
            unread: false,
        },
    ];
}

/* Add a notification programmatically */
function pushNotification(type, icon, iconClass, title, desc) {
    NOTIF_STATE.items.unshift({
        id: NOTIF_STATE.nextId++,
        type, icon, iconClass, title, desc,
        time: 'just now',
        ts: Date.now(),
        unread: true,
    });
    renderNotifications();
    /* Shake bell */
    const bell = document.getElementById('notifBell');
    if (bell) {
        bell.style.animation = 'bellShake 0.5s ease';
        setTimeout(() => { bell.style.animation = ''; }, 500);
    }
}

/* Render the dropdown list */
function renderNotifications() {
    const list     = document.getElementById('notifList');
    const countEl  = document.getElementById('notifCount');
    const badgeEl  = document.getElementById('notifUnreadBadge');
    const bellBtn  = document.getElementById('notifBell');
    if (!list) return;

    const unread = NOTIF_STATE.items.filter(n => n.unread).length;

    /* Count badge */
    if (countEl) {
        countEl.textContent = unread > 9 ? '9+' : unread;
        countEl.classList.toggle('hidden', unread === 0);
    }
    if (badgeEl) badgeEl.textContent = unread + ' new';
    if (bellBtn) bellBtn.classList.toggle('has-unread', unread > 0);

    if (!NOTIF_STATE.items.length) {
        list.innerHTML = `
            <div class="notif-empty">
                <i class="fas fa-bell-slash"></i>
                No notifications yet
            </div>`;
        return;
    }

    list.innerHTML = NOTIF_STATE.items.map(n => `
        <div class="notif-item ${n.unread ? 'unread' : ''}"
             data-id="${n.id}"
             onclick="markNotifRead(${n.id})">
            <div class="notif-icon-wrap ${n.iconClass}">
                <i class="fas ${n.icon}"></i>
            </div>
            <div class="notif-body">
                <div class="notif-title">${n.title}</div>
                <div class="notif-desc">${n.desc}</div>
            </div>
            <div>
                <div class="notif-time">${n.time}</div>
                <button class="notif-dismiss"
                        onclick="dismissNotif(event,${n.id})"
                        title="Dismiss"
                        aria-label="Dismiss notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>`).join('');
}

/* Mark one as read */
window.markNotifRead = function(id) {
    const n = NOTIF_STATE.items.find(n => n.id === id);
    if (n) { n.unread = false; renderNotifications(); }
};

/* Dismiss */
window.dismissNotif = function(event, id) {
    event.stopPropagation();
    NOTIF_STATE.items = NOTIF_STATE.items.filter(n => n.id !== id);
    renderNotifications();
};

/* Mark all read */
function markAllRead() {
    NOTIF_STATE.items.forEach(n => n.unread = false);
    renderNotifications();
    showDashToast('All notifications marked as read', 'success');
}

/* Init notification bell toggle */
function initNotifications() {
    seedNotifications();
    renderNotifications();

    const bell     = document.getElementById('notifBell');
    const dropdown = document.getElementById('notifDropdown');
    const markAll  = document.getElementById('notifMarkAll');
    const viewAll  = document.getElementById('notifViewAll');

    if (!bell || !dropdown) return;

    /* Toggle open/close */
    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
        /* Mark unread as read after 1.5s of viewing */
        if (dropdown.classList.contains('open')) {
            setTimeout(() => {
                NOTIF_STATE.items.forEach(n => { if (n.unread) n.unread = false; });
                renderNotifications();
            }, 1500);
        }
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
        if (!bell.closest('.notif-wrap').contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    markAll?.addEventListener('click', (e) => { e.stopPropagation(); markAllRead(); });

    /* View all → navigate to logs */
    viewAll?.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.remove('open');
        document.querySelector('.sidebar-link[data-page="logs"]')?.click();
    });

    /* Inject bell shake keyframe */
    if (!document.getElementById('bellStyle')) {
        const s = document.createElement('style');
        s.id = 'bellStyle';
        s.textContent = `
            @keyframes bellShake {
                0%,100%{transform:rotate(0)}
                20%{transform:rotate(-18deg)}
                40%{transform:rotate(18deg)}
                60%{transform:rotate(-10deg)}
                80%{transform:rotate(10deg)}
            }`;
        document.head.appendChild(s);
    }
}

/* Hook new events into notifications automatically */
function notifOnEvent(type, msg) {
    const map = {
        welcome:        { icon:'fa-wand-magic-sparkles',  cls:'ni-purple', title:'Welcome Back'        },
        login:          { icon:'fa-right-to-bracket',     cls:'ni-green',  title:'New Login'           },
        ban:            { icon:'fa-ban',                  cls:'ni-red',    title:'User Banned'          },
        keygen:         { icon:'fa-key',                  cls:'ni-yellow', title:'Keys Generated'       },
        register:       { icon:'fa-user-plus',            cls:'ni-blue',   title:'New Registration'     },
        delete:         { icon:'fa-trash',                cls:'ni-red',    title:'Item Deleted'         },
        warn:           { icon:'fa-triangle-exclamation', cls:'ni-yellow', title:'Warning'              },
        success:        { icon:'fa-circle-check',         cls:'ni-green',  title:'Action Completed'     },
        setting:        { icon:'fa-gear',                 cls:'ni-blue',   title:'Settings Updated'     },
        create_app:     { icon:'fa-cube',                 cls:'ni-purple', title:'Application Created'  },
        delete_app:     { icon:'fa-trash-can',            cls:'ni-red',    title:'Application Deleted'  },
        rename_app:     { icon:'fa-pen-to-square',        cls:'ni-blue',   title:'Application Renamed'  },
        pause_app:      { icon:'fa-circle-pause',         cls:'ni-yellow', title:'Application Paused'   },
        resume_app:     { icon:'fa-circle-play',          cls:'ni-green',  title:'Application Resumed'  },
        refresh_secret: { icon:'fa-arrows-rotate',        cls:'ni-yellow', title:'Secret Regenerated'   },
        select_app:     { icon:'fa-bullseye',             cls:'ni-blue',   title:'Application Switched' },
    };
    const t = map[type] || map.success;
    pushNotification(type, t.icon, t.cls, t.title, msg);
}
window.notifOnEvent = notifOnEvent;

/* ============================================
   APP SETTINGS — API / SECRET / OWNERID / VERSION
   ============================================ */

/* Chars for key generation */
const KEY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function randStr(len) {
    return Array.from({ length: len }, () =>
        KEY_CHARS[Math.floor(Math.random() * KEY_CHARS.length)]
    ).join('');
}

/* Toggle visibility of masked input */
window.toggleConfigVis = function(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isHidden = input.classList.contains('masked');
    input.classList.toggle('masked', !isHidden);
    const icon = btn.querySelector('i');
    if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
    /* Briefly show value if unmasking */
    if (isHidden) {
        input.style.letterSpacing = 'normal';
    } else {
        input.style.letterSpacing = '2px';
    }
};

/* Copy config value to clipboard */
window.copyConfigVal = function(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const val = input.value || input.textContent;
    navigator.clipboard?.writeText(val);
    showDashToast('Copied to clipboard!', 'success');
};

/* Regenerate API or Secret key */
window.regenKey = function(inputId, prefix) {
    if (!confirm('Regenerate this key? Old key will stop working immediately.')) return;
    const input = document.getElementById(inputId);
    if (!input) return;
    const newKey = prefix + randStr(32);
    input.value = newKey;
    /* Save to localStorage */
    const saved = getSavedConfig();
    saved[inputId] = newKey;
    saveConfig(saved);
    notifOnEvent('setting', `${inputId.replace('cfg-','').replace('-','_').toUpperCase()} was regenerated`);
    showDashToast('Key regenerated — update your integration!', 'success');
};

/* Regenerate Owner ID */
window.regenOwner = function() {
    if (!confirm('Regenerate Owner ID? This breaks existing integrations!')) return;
    const el = document.getElementById('cfg-owner-id');
    if (!el) return;
    const newId = 'OWN-' + randStr(8).toUpperCase() + '-' + randStr(6).toUpperCase() + '-' + randStr(4).toUpperCase();
    el.textContent = newId;
    const saved = getSavedConfig();
    saved['cfg-owner-id'] = newId;
    saveConfig(saved);
    notifOnEvent('setting', 'Owner ID was regenerated');
    showDashToast('Owner ID regenerated!', 'success');
};

/* Save toggle state */
window.saveToggle = function(key, btn) {
    const saved = getSavedConfig();
    saved['tog-' + key] = btn.classList.contains('on');
    saveConfig(saved);
    notifOnEvent('setting', `${key.charAt(0).toUpperCase() + key.slice(1)} toggled ${btn.classList.contains('on') ? 'ON' : 'OFF'}`);
};

/* localStorage helpers */
function getSavedConfig() {
    try { return JSON.parse(localStorage.getItem('authx_config') || '{}'); }
    catch { return {}; }
}
function saveConfig(obj) {
    try { localStorage.setItem('authx_config', JSON.stringify(obj)); }
    catch {}
}

/* Load saved config on page load */
function loadSavedConfig() {
    const saved = getSavedConfig();

    /* API key */
    const apiInput = document.getElementById('cfg-api-key');
    if (apiInput && saved['cfg-api-key']) apiInput.value = saved['cfg-api-key'];

    /* Secret key */
    const secInput = document.getElementById('cfg-secret-key');
    if (secInput && saved['cfg-secret-key']) secInput.value = saved['cfg-secret-key'];

    /* Owner ID */
    const ownerEl = document.getElementById('cfg-owner-id');
    if (ownerEl && saved['cfg-owner-id']) ownerEl.textContent = saved['cfg-owner-id'];

    /* Version */
    const verInput = document.getElementById('cfg-version-input');
    const verDisp  = document.getElementById('cfg-version-display');
    if (verInput && saved['cfg-version']) {
        verInput.value = saved['cfg-version'];
        if (verDisp) verDisp.textContent = 'v' + saved['cfg-version'];
    }

    /* Toggles */
    ['hwid','antidebug','vmdetect','forceupdate'].forEach(key => {
        const tog = document.getElementById('tog-' + key);
        if (tog && saved['tog-' + key] !== undefined) {
            tog.classList.toggle('on', saved['tog-' + key]);
        }
    });
}

/* Save all settings at once */
function initSettingsSave() {
    document.getElementById('saveSettings')?.addEventListener('click', () => {
        const saved = getSavedConfig();

        /* Collect values */
        const apiKey = document.getElementById('cfg-api-key')?.value;
        const secKey = document.getElementById('cfg-secret-key')?.value;
        const ownId  = document.getElementById('cfg-owner-id')?.textContent;
        const ver    = document.getElementById('cfg-version-input')?.value;
        const wh     = document.getElementById('cfg-webhook-url')?.value;
        const name   = document.getElementById('cfg-app-name')?.value;

        if (apiKey) saved['cfg-api-key']     = apiKey;
        if (secKey) saved['cfg-secret-key']  = secKey;
        if (ownId)  saved['cfg-owner-id']    = ownId;
        if (ver)    saved['cfg-version']     = ver;
        if (wh)     saved['cfg-webhook-url'] = wh;
        if (name)   saved['cfg-app-name']    = name;

        /* Save toggles */
        ['hwid','antidebug','vmdetect','forceupdate'].forEach(key => {
            const tog = document.getElementById('tog-' + key);
            if (tog) saved['tog-' + key] = tog.classList.contains('on');
        });

        saveConfig(saved);

        /* Update sidebar version badge */
        if (ver) {
            const badge = document.querySelector('.sidebar-logo-badge');
            if (badge) badge.textContent = 'v' + ver;
        }

        notifOnEvent('setting', 'App settings saved by MasterAdmin');
        showDashToast('Settings saved successfully!', 'success');
    });

    /* Export config as JSON */
    document.getElementById('exportConfig')?.addEventListener('click', () => {
        const cfg = getSavedConfig();
        const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'authx-config.json';
        a.click();
        showDashToast('Config exported!', 'success');
    });
}

/* ============================================
   KEY COLORS BY LEVEL
   ============================================ */
function keyColorClass(level) {
    switch ((level || '').toLowerCase()) {
        case 'elite':    return 'key-elite';
        case 'premium':  return 'key-premium';
        default:         return 'key-standard';
    }
}
function levelBadgeColored(level) {
    switch ((level || '').toLowerCase()) {
        case 'elite':
            return `<span class="badge level-elite"><i class="fas fa-crown" style="font-size:.55rem"></i> Elite</span>`;
        case 'premium':
            return `<span class="badge level-premium"><i class="fas fa-star" style="font-size:.55rem"></i> Premium</span>`;
        default:
            return `<span class="badge level-standard">Standard</span>`;
    }
}

/* Override the old levelBadge function */
window.levelBadge = levelBadgeColored;

/* ============================================
   PATCH renderLicenses to use colored keys
   ============================================ */
const _origRenderLicenses = window.renderLicenses;

/* Redefine renderLicenses with colored keys */
function renderLicenses(filter = 'all', query = '') {
    const tbody = document.getElementById('licensesBody');
    const empty = document.getElementById('licensesEmpty');
    if (!tbody) return;

    let data = STATE.licenses;
    if (filter !== 'all') data = data.filter(l => l.status === filter);
    if (query) data = data.filter(l =>
        l.key.toLowerCase().includes(query) ||
        l.user.toLowerCase().includes(query)
    );

    if (!data.length) {
        tbody.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = data.map(l => `
        <tr>
            <td><input type="checkbox" aria-label="Select"></td>
            <td>
                <span class="cell-copy cell-mono ${keyColorClass(l.level)}"
                      onclick="copyText('${l.key}')" title="Click to copy"
                      style="display:inline-flex;align-items:center;gap:5px;cursor:pointer">
                    ${l.key.slice(0, 22)}...
                    <i class="fas fa-copy" style="font-size:.58rem;opacity:.5"></i>
                </span>
            </td>
            <td>
                <div style="display:flex;align-items:center;gap:7px">
                    ${l.user !== '—' ? userAvatar(l.user) : '<span style="color:var(--text3);font-size:.72rem">—</span>'}
                    <span class="cell-bold">${l.user}</span>
                </div>
            </td>
            <td>${levelBadgeColored(l.level)}</td>
            <td class="cell-mono cell-dim" style="font-size:.72rem">${l.duration}</td>
            <td class="cell-mono cell-dim" style="font-size:.72rem">${l.created}</td>
            <td class="cell-mono cell-dim" style="font-size:.72rem">${l.expires}</td>
            <td>${statusBadge(l.status)}</td>
            <td>
                <div class="row-actions">
                    ${l.status !== 'banned'
                        ? `<button class="row-btn success" title="Activate key"
                                  onclick="setLicenseStatus(${l.id},'active')"
                                  style="color:var(--green);border-color:var(--green-border);background:var(--green-dim)">
                               <i class="fas fa-check"></i>
                           </button>`
                        : `<button class="row-btn success" title="Unban key"
                                  onclick="setLicenseStatus(${l.id},'active')"
                                  style="color:var(--green);border-color:var(--green-border);background:var(--green-dim)">
                               <i class="fas fa-lock-open"></i>
                           </button>`
                    }
                    <button class="row-btn" title="Copy full key"
                            onclick="copyText('${l.key}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    ${l.status === 'banned'
                        ? `<button class="row-btn danger" title="Already banned" disabled
                                  style="opacity:.35;cursor:not-allowed">
                               <i class="fas fa-ban"></i>
                           </button>`
                        : `<button class="row-btn danger" title="Ban key"
                                  onclick="setLicenseStatus(${l.id},'banned')">
                               <i class="fas fa-ban"></i>
                           </button>`
                    }
                    <button class="row-btn danger" title="Delete key"
                            onclick="deleteLicense(${l.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
}
window.renderLicenses = renderLicenses;

/* ============================================
   PATCH generateKeys to push notification
   ============================================ */
const _origGenerateKeys = window.generateKeys;
function generateKeys(qty, duration, prefix, level) {
    qty = Math.min(qty, 100);
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < qty; i++) {
        STATE.licenses.push({
            id: Date.now() + i,
            key: genKey(prefix),
            user: '—', level, duration,
            created: today,
            expires: duration === 'Lifetime' ? 'Never' : 'Calculated',
            status: 'unused',
        });
    }
    renderLicenses();
    updateCounters();
    notifOnEvent('keygen', `${qty} ${level} key${qty > 1 ? 's' : ''} generated`);
    showDashToast(`Generated ${qty} key${qty > 1 ? 's' : ''}!`, 'success');
}
window.generateKeys = generateKeys;

/* ============================================
   PATCH banUser / setLicenseStatus to push notif
   ============================================ */
const _origBanUser = window.banUser;
window.banUser = function(id) {
    const u = STATE.users.find(u => u.id === id);
    if (!u) return;
    u.status = u.status === 'banned' ? 'active' : 'banned';
    renderUsers();
    updateCounters();
    if (u.status === 'banned') {
        notifOnEvent('ban', `${u.username} was banned — HWID locked`);
        showDashToast(`${u.username} banned`, 'error');
    } else {
        notifOnEvent('success', `${u.username} was unbanned`);
        showDashToast(`${u.username} unbanned`, 'success');
    }
};

const _origSetLicenseStatus = window.setLicenseStatus;
window.setLicenseStatus = function(id, status) {
    const lic = STATE.licenses.find(l => l.id === id);
    if (!lic) return;
    lic.status = status;
    renderLicenses();
    updateCounters();
    if (status === 'banned') {
        notifOnEvent('ban', `Key ${lic.key.slice(0,14)}... was banned`);
        showDashToast('Key banned', 'error');
    } else {
        notifOnEvent('success', `Key ${lic.key.slice(0,14)}... activated`);
        showDashToast('Key activated', 'success');
    }
};

/* ============================================
   EXTEND DOMContentLoaded
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    /* Notifications */
    initNotifications();

    /* Settings */
    loadSavedConfig();
    initSettingsSave();

    /* Re-render licenses with colors after data is ready */
    setTimeout(() => {
        if (STATE.licenses.length) renderLicenses();
    }, 100);
}, { once: false });
/* Note: DOMContentLoaded already fired the first listener in dashboard.js —
   this second one runs after that, so all STATE is already seeded.         */

/* ============================================
   CUSTOM CONFIRM DIALOG ENGINE
   ============================================ */

/**
 * showConfirm(options) → Promise<'confirm'|'cancel'|'more'|null>
 *
 * options = {
 *   type:    'danger' | 'warn' | 'success' | 'info'  (default: 'danger')
 *   icon:    FontAwesome class  e.g. 'fa-trash'
 *   title:   string
 *   desc:    string  (supports <strong>)
 *   info:    string  (optional small info box)
 *   confirmText: string   (default 'Confirm')
 *   cancelText:  string   (default 'Cancel')
 *   moreText:    string   (optional 3rd button — set to null/'' to hide)
 *   moreIcon:    string   (icon for 3rd button)
 * }
 */
function showConfirm(options = {}) {
    return new Promise((resolve) => {
        const type        = options.type        || 'danger';
        const icon        = options.icon        || 'fa-circle-question';
        const title       = options.title       || 'Are you sure?';
        const desc        = options.desc        || 'This action cannot be undone.';
        const info        = options.info        || null;
        const confirmText = options.confirmText || 'Confirm';
        const confirmIcon = options.confirmIcon || 'fa-check';
        const cancelText  = options.cancelText  || 'Cancel';
        const moreText    = options.moreText    !== undefined ? options.moreText : null;
        const moreIcon    = options.moreIcon    || 'fa-ellipsis';

        /* Icon style map */
        const iconClsMap = {
            danger:  'ci-danger',
            warn:    'ci-warn',
            success: 'ci-success',
            info:    'ci-info',
        };
        const iconCls = iconClsMap[type] || 'ci-danger';

        /* Build HTML */
        const hasMote   = !!moreText;
        const colClass  = hasMote ? 'three-col' : 'two-col';

        const moreBtn = hasMote ? `
            <button class="confirm-btn confirm-btn-more" id="cdMore">
                <i class="fas ${moreIcon}"></i> ${moreText}
            </button>` : '';

        const infoBox = info ? `
            <div class="confirm-info-box">
                <i class="fas fa-circle-info"></i>${info}
            </div>` : '';

        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';
        overlay.id = 'confirmOverlay';
        overlay.innerHTML = `
            <div class="confirm-dialog type-${type}" role="dialog"
                 aria-modal="true" aria-labelledby="cdTitle">
                <div class="confirm-icon-row">
                    <div class="confirm-icon ${iconCls}">
                        <i class="fas ${icon}"></i>
                    </div>
                </div>
                <div class="confirm-body">
                    <div class="confirm-title" id="cdTitle">${title}</div>
                    <div class="confirm-desc">${desc}${infoBox}</div>
                </div>
                <div class="confirm-divider"></div>
                <div class="confirm-btns ${colClass}">
                    <button class="confirm-btn confirm-btn-cancel" id="cdCancel">
                        <i class="fas fa-times"></i> ${cancelText}
                    </button>
                    ${moreBtn}
                    <button class="confirm-btn confirm-btn-action" id="cdConfirm">
                        <i class="fas ${confirmIcon}"></i> ${confirmText}
                    </button>
                </div>
            </div>`;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        /* Focus trap — confirm button */
        setTimeout(() => overlay.querySelector('#cdConfirm')?.focus(), 50);

        function close(result) {
            overlay.style.animation = 'confirmFadeIn 0.15s ease reverse';
            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                resolve(result);
            }, 140);
        }

        overlay.querySelector('#cdConfirm')?.addEventListener('click', () => close('confirm'));
        overlay.querySelector('#cdCancel')?.addEventListener('click',  () => close('cancel'));
        overlay.querySelector('#cdMore')?.addEventListener('click',    () => close('more'));

        /* Close on overlay backdrop click */
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) close('cancel');
        });

        /* Keyboard: Enter → confirm, Escape → cancel */
        function onKey(e) {
            if (e.key === 'Enter')  { close('confirm'); document.removeEventListener('keydown', onKey); }
            if (e.key === 'Escape') { close('cancel');  document.removeEventListener('keydown', onKey); }
        }
        document.addEventListener('keydown', onKey);
    });
}

window.showConfirm = showConfirm;

/* ============================================
   REPLACE ALL confirm() CALLS
   ============================================ */

/* --- Delete License --- */
window.deleteLicense = async function(id) {
    const lic = STATE.licenses.find(l => l.id === id);
    if (!lic) return;
    const result = await showConfirm({
        type:        'danger',
        icon:        'fa-trash',
        title:       'Delete License Key?',
        desc:        `This will permanently delete the key<br><strong>${lic.key.slice(0,22)}...</strong>`,
        info:        'Assigned users will lose access immediately.',
        confirmText: 'Delete',
        confirmIcon: 'fa-trash',
        moreText:    'Ban Instead',
        moreIcon:    'fa-ban',
    });
    if (result === 'confirm') {
        STATE.licenses = STATE.licenses.filter(l => l.id !== id);
        renderLicenses(); updateCounters();
        notifOnEvent('delete', `Key ${lic.key.slice(0,14)}... deleted`);
        showDashToast('License deleted', 'error');
    } else if (result === 'more') {
        lic.status = 'banned';
        renderLicenses(); updateCounters();
        notifOnEvent('ban', `Key ${lic.key.slice(0,14)}... banned`);
        showDashToast('Key banned instead', 'success');
    }
};

/* --- Set License Status (ban) --- */
window.setLicenseStatus = async function(id, status) {
    const lic = STATE.licenses.find(l => l.id === id);
    if (!lic) return;
    if (status === 'banned') {
        const result = await showConfirm({
            type:        'warn',
            icon:        'fa-ban',
            title:       'Ban This License?',
            desc:        `Key <strong>${lic.key.slice(0,18)}...</strong> will be blocked immediately.`,
            info:        'User will be kicked from active sessions.',
            confirmText: 'Ban Key',
            confirmIcon: 'fa-ban',
            moreText:    'Delete Instead',
            moreIcon:    'fa-trash',
        });
        if (result === 'confirm') {
            lic.status = 'banned';
            renderLicenses(); updateCounters();
            notifOnEvent('ban', `Key ${lic.key.slice(0,14)}... banned`);
            showDashToast('Key banned', 'error');
        } else if (result === 'more') {
            STATE.licenses = STATE.licenses.filter(l => l.id !== id);
            renderLicenses(); updateCounters();
            notifOnEvent('delete', `Key ${lic.key.slice(0,14)}... deleted`);
            showDashToast('Key deleted', 'error');
        }
    } else {
        const result = await showConfirm({
            type:        'success',
            icon:        'fa-check-circle',
            title:       'Activate This Key?',
            desc:        `Key <strong>${lic.key.slice(0,18)}...</strong> will become active.`,
            confirmText: 'Activate',
            confirmIcon: 'fa-check',
        });
        if (result === 'confirm') {
            lic.status = 'active';
            renderLicenses(); updateCounters();
            notifOnEvent('success', `Key ${lic.key.slice(0,14)}... activated`);
            showDashToast('Key activated', 'success');
        }
    }
};

/* --- Delete User --- */
window.deleteUser = async function(id) {
    const u = STATE.users.find(u => u.id === id);
    if (!u) return;
    const result = await showConfirm({
        type:        'danger',
        icon:        'fa-user-slash',
        title:       'Delete User?',
        desc:        `<strong>${u.username}</strong> will be permanently removed.`,
        info:        'All associated sessions will be terminated.',
        confirmText: 'Delete User',
        confirmIcon: 'fa-trash',
        moreText:    'Ban Instead',
        moreIcon:    'fa-ban',
    });
    if (result === 'confirm') {
        STATE.users = STATE.users.filter(u => u.id !== id);
        renderUsers(); updateCounters();
        notifOnEvent('delete', `User ${u.username} deleted`);
        showDashToast('User deleted', 'error');
    } else if (result === 'more') {
        u.status = 'banned';
        renderUsers(); updateCounters();
        notifOnEvent('ban', `${u.username} was banned`);
        showDashToast(`${u.username} banned`, 'error');
    }
};

/* --- Ban User --- */
window.banUser = async function(id) {
    const u = STATE.users.find(u => u.id === id);
    if (!u) return;
    const isBanned = u.status === 'banned';
    if (isBanned) {
        const result = await showConfirm({
            type:        'success',
            icon:        'fa-user-check',
            title:       'Unban User?',
            desc:        `Restore access for <strong>${u.username}</strong>.`,
            confirmText: 'Unban',
            confirmIcon: 'fa-user-check',
        });
        if (result === 'confirm') {
            u.status = 'active';
            renderUsers(); updateCounters();
            notifOnEvent('success', `${u.username} was unbanned`);
            showDashToast(`${u.username} unbanned`, 'success');
        }
    } else {
        const result = await showConfirm({
            type:        'warn',
            icon:        'fa-user-slash',
            title:       'Ban This User?',
            desc:        `<strong>${u.username}</strong> will be blocked from all sessions.`,
            info:        `IP: ${u.ip} · HWID: ${u.hwid}`,
            confirmText: 'Ban User',
            confirmIcon: 'fa-ban',
            moreText:    'Delete Instead',
            moreIcon:    'fa-trash',
        });
        if (result === 'confirm') {
            u.status = 'banned';
            renderUsers(); updateCounters();
            notifOnEvent('ban', `${u.username} was banned — HWID locked`);
            showDashToast(`${u.username} banned`, 'error');
        } else if (result === 'more') {
            STATE.users = STATE.users.filter(u => u.id !== id);
            renderUsers(); updateCounters();
            notifOnEvent('delete', `User ${u.username} deleted`);
            showDashToast(`${u.username} deleted`, 'error');
        }
    }
};

/* --- Delete Variable --- */
window.deleteVar = async function(id) {
    const v = STATE.variables.find(v => v.id === id);
    if (!v) return;
    const result = await showConfirm({
        type:        'danger',
        icon:        'fa-database',
        title:       'Delete Variable?',
        desc:        `Variable <strong>${v.name}</strong> will be permanently removed.`,
        info:        v.encrypted ? '⚠ This is an encrypted variable.' : null,
        confirmText: 'Delete',
        confirmIcon: 'fa-trash',
    });
    if (result === 'confirm') {
        STATE.variables = STATE.variables.filter(v => v.id !== id);
        renderVariables(); updateCounters();
        notifOnEvent('delete', `Variable "${v.name}" deleted`);
        showDashToast('Variable deleted', 'error');
    }
};

/* --- Kill Single Session --- */
window.killSession = async function(i) {
    const s = STATE.sessions[i];
    if (!s) return;
    const result = await showConfirm({
        type:        'warn',
        icon:        'fa-power-off',
        title:       'Kill Session?',
        desc:        `Terminate active session for <strong>${s.user}</strong>.`,
        info:        `IP: ${s.ip} · Duration: ${s.duration}`,
        confirmText: 'Kill Session',
        confirmIcon: 'fa-power-off',
        moreText:    'Ban User Too',
        moreIcon:    'fa-ban',
    });
    if (result === 'confirm' || result === 'more') {
        STATE.sessions.splice(i, 1);
        renderSessions(); updateCounters();
        notifOnEvent('warn', `Session for ${s.user} terminated`);
        showDashToast(`Session killed: ${s.user}`, 'error');
        if (result === 'more') {
            const u = STATE.users.find(u => u.username === s.user);
            if (u) { u.status = 'banned'; renderUsers(); updateCounters(); }
            notifOnEvent('ban', `${s.user} banned after session kill`);
            showDashToast(`${s.user} also banned`, 'error');
        }
    }
};

/* --- Kill All Sessions --- */
(function patchKillAll() {
    const oldEl = document.getElementById('killAllSessions');
    if (!oldEl) return;
    const newEl = oldEl.cloneNode(true);
    oldEl.parentNode.replaceChild(newEl, oldEl);
    newEl.addEventListener('click', async () => {
        if (!STATE.sessions.length) {
            showDashToast('No active sessions', 'success');
            return;
        }
        const result = await showConfirm({
            type:        'danger',
            icon:        'fa-power-off',
            title:       'Kill All Sessions?',
            desc:        `Terminate all <strong>${STATE.sessions.length} active sessions</strong> immediately.`,
            info:        'All connected users will be disconnected.',
            confirmText: 'Kill All',
            confirmIcon: 'fa-power-off',
        });
        if (result === 'confirm') {
            const count = STATE.sessions.length;
            STATE.sessions = [];
            renderSessions(); updateCounters();
            notifOnEvent('warn', `All ${count} sessions terminated`);
            showDashToast('All sessions terminated', 'error');
        }
    });
})();

/* --- Delete Reseller --- */
window.deleteReseller = async function(id) {
    const r = STATE.resellers.find(r => r.id === id);
    if (!r) return;
    const result = await showConfirm({
        type:        'danger',
        icon:        'fa-people-arrows',
        title:       'Remove Reseller?',
        desc:        `<strong>${r.name}</strong> will lose all quota and access.`,
        info:        `Keys sold: ${r.sold} · Quota used: ${r.quotaUsed}/${r.quotaTotal}`,
        confirmText: 'Remove',
        confirmIcon: 'fa-trash',
    });
    if (result === 'confirm') {
        STATE.resellers = STATE.resellers.filter(r => r.id !== id);
        renderResellers(); updateCounters();
        notifOnEvent('delete', `Reseller ${r.name} removed`);
        showDashToast('Reseller removed', 'error');
    }
};

/* --- Regen API Key --- */
window.regenKey = async function(inputId, prefix) {
    const label = inputId.includes('secret') ? 'Secret Key' : 'API Key';
    const result = await showConfirm({
        type:        'warn',
        icon:        'fa-rotate',
        title:       `Regenerate ${label}?`,
        desc:        `Your current <strong>${label}</strong> will be invalidated immediately.`,
        info:        'All integrations using the old key will stop working.',
        confirmText: 'Regenerate',
        confirmIcon: 'fa-rotate',
    });
    if (result !== 'confirm') return;
    const input = document.getElementById(inputId);
    if (!input) return;
    const newKey = prefix + randStr(32);
    input.value = newKey;
    const saved = getSavedConfig();
    saved[inputId] = newKey;
    saveConfig(saved);
    notifOnEvent('setting', `${label} was regenerated`);
    showDashToast(`${label} regenerated — update your app!`, 'success');
};

/* --- Regen Owner ID --- */
window.regenOwner = async function() {
    const result = await showConfirm({
        type:        'danger',
        icon:        'fa-fingerprint',
        title:       'Regenerate Owner ID?',
        desc:        'This will break <strong>all existing integrations</strong> using the current Owner ID.',
        info:        'Only do this if you are absolutely sure.',
        confirmText: 'Regenerate',
        confirmIcon: 'fa-fingerprint',
    });
    if (result !== 'confirm') return;
    const el = document.getElementById('cfg-owner-id');
    if (!el) return;
    const newId = 'OWN-' + randStr(8).toUpperCase() + '-' + randStr(6).toUpperCase() + '-' + randStr(4).toUpperCase();
    el.textContent = newId;
    const saved = getSavedConfig();
    saved['cfg-owner-id'] = newId;
    saveConfig(saved);
    notifOnEvent('setting', 'Owner ID was regenerated');
    showDashToast('Owner ID regenerated!', 'success');
};

/* ============================================
   LEVEL SELECTOR + KEY PREVIEW LOGIC
   ============================================ */

function getGenOptions() {
    const segLen   = parseInt(document.getElementById('genSegLen')?.value   || '5');
    const segCount = parseInt(document.getElementById('genSegCount')?.value || '4');
    const charSet  = document.getElementById('genCharSet')?.value || 'alphanum';
    const level    = document.getElementById('genLevel')?.value   || 'Premium';
    const prefix   = document.getElementById('genActivePrefixHidden')?.value
                     || LEVEL_CONFIG[level]?.prefix
                     || toBold('ArenaSystem') + '-';
    return { segLen, segCount, charSet, level, prefix };
}

function refreshKeyPreview() {
    const preview = document.getElementById('keyPreview');
    if (!preview) return;
    const { prefix, segLen, segCount, charSet, level } = getGenOptions();
    const newKey = genKey(prefix, segLen, segCount, charSet);
    preview.textContent = newKey;
    preview.className = 'key-preview';
    /* apply level color class */
    const cfg = LEVEL_CONFIG[level];
    if (cfg) preview.classList.add(cfg.color);
    /* flash animation */
    requestAnimationFrame(() => preview.classList.add('flash'));
}

function initLevelSelector() {
    const btns = document.querySelectorAll('.level-btn');
    const levelHidden  = document.getElementById('genLevel');
    const prefixHidden = document.getElementById('genActivePrefixHidden');
    const customField  = document.getElementById('customPrefixField');
    const customInput  = document.getElementById('genPrefix');

    if (!btns.length) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            /* deactivate all */
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const level  = btn.dataset.level;
            const prefix = btn.dataset.prefix;

            /* update hidden inputs */
            if (levelHidden)  levelHidden.value  = level;
            if (prefixHidden) prefixHidden.value = prefix;

            /* show/hide custom prefix field */
            if (customField) {
                customField.style.display = level === 'Custom' ? 'flex' : 'none';
            }

            refreshKeyPreview();
        });
    });

    /* Custom prefix live update */
    customInput?.addEventListener('input', function() {
        const prefixHidden = document.getElementById('genActivePrefixHidden');
        if (prefixHidden) prefixHidden.value = this.value;
        refreshKeyPreview();
    });

    /* Live refresh on any option change */
    ['genSegLen','genSegCount','genCharSet'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', refreshKeyPreview);
    });

    /* Refresh button */
    document.getElementById('keyPreviewRefresh')?.addEventListener('click', refreshKeyPreview);

    /* Initial preview */
    refreshKeyPreview();
}

/* Patch initGenerate to use new options */
const _origInitGenerate = window.initGenerate;
function initGenerate() {
    const toggleBtn  = document.getElementById('toggleGenPanel');
    const panel      = document.getElementById('genPanel');
    const closePanel = document.getElementById('closeGenPanel');
    const doGen      = document.getElementById('doGenerate');

    if (toggleBtn && panel) {
        toggleBtn.addEventListener('click', () => {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) refreshKeyPreview();
        });
        closePanel?.addEventListener('click', () => panel.classList.remove('open'));
        doGen?.addEventListener('click', () => {
            const { prefix, segLen, segCount, charSet, level } = getGenOptions();
            const qty      = parseInt(document.getElementById('genQty')?.value)     || 1;
            const duration = document.getElementById('genDuration')?.value || '30 Days';
            generateKeys(qty, duration, prefix, level, segLen, segCount, charSet);
            panel.classList.remove('open');
        });
    }

    /* Modal */
    const openModal    = document.getElementById('openGenModal');
    const modal        = document.getElementById('genModal');
    const closeModal   = document.getElementById('closeGenModal');
    const cancelModal  = document.getElementById('cancelGenModal');
    const confirmModal = document.getElementById('confirmGenModal');

    openModal?.addEventListener('click',  () => { modal.style.display = 'flex'; });
    closeModal?.addEventListener('click', () => { modal.style.display = 'none'; });
    cancelModal?.addEventListener('click',() => { modal.style.display = 'none'; });
    modal?.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    confirmModal?.addEventListener('click', () => {
        const qty      = parseInt(document.getElementById('modalQty')?.value)     || 1;
        const duration = document.getElementById('modalDuration')?.value || '30 Days';
        const prefix   = document.getElementById('modalPrefix')?.value  || toBold('ArenaSystem') + '-';
        const level    = document.getElementById('modalLevel')?.value   || 'Premium';
        generateKeys(qty, duration, prefix, level);
        modal.style.display = 'none';
    });
}

/* Updated generateKeys with new params */
window.generateKeys = function generateKeys(qty, duration, prefix, level, segLen=5, segCount=4, charSet='alphanum') {
    qty = Math.min(qty, 100);
    const today = new Date().toISOString().split('T')[0];
    for (let i = 0; i < qty; i++) {
        STATE.licenses.push({
            id:      Date.now() + i,
            key:     genKey(prefix, segLen, segCount, charSet),
            user:    '—', level, duration,
            created: today,
            expires: duration === 'Lifetime' ? 'Never' : 'Calculated',
            status:  'unused',
        });
    }
    renderLicenses();
    updateCounters();
    notifOnEvent('keygen', `${qty} ${level} key${qty > 1 ? 's' : ''} generated`);
    showDashToast(`Generated ${qty} ${level} key${qty > 1 ? 's' : ''}!`, 'success');
};

/* Updated levelBadge with Extreme/Complex support */
window.levelBadge = function levelBadgeColored(level) {
    switch ((level || '').toLowerCase()) {
        case 'elite':
            return `<span class="badge level-elite"><i class="fas fa-crown" style="font-size:.5rem"></i> Elite</span>`;
        case 'premium':
            return `<span class="badge level-premium">⭐ Premium</span>`;
        case 'extreme':
            return `<span class="badge level-extreme">Extreme</span>`;
        case 'complex':
            return `<span class="badge level-complex">Complex</span>`;
        case 'custom':
            return `<span class="badge level-custom">Custom</span>`;
        default:
            return `<span class="badge level-standard">🔑 Standard</span>`;
    }
};

/* keyColorClass updated */
window.keyColorClass = function(level) {
    switch ((level || '').toLowerCase()) {
        case 'elite':    return 'key-elite';
        case 'premium':  return 'key-premium';
        case 'extreme':  return 'key-extreme';
        case 'complex':  return 'key-complex';
        case 'custom':   return 'key-custom';
        default:         return 'key-standard';
    }
};

/* Hook into DOMContentLoaded for level selector init */
document.addEventListener('DOMContentLoaded', () => {
    initLevelSelector();
    initGenerate();       /* overrides the earlier initGenerate call */
}, { once: false });

/* ============================================
   SDK TAB SWITCHER & CODE COPY
   ============================================ */
window.switchSdkTab = function switchSdkTab(btn, sdk) {
    if (!btn) return;
    const parent = btn.parentElement;
    if (parent) {
        parent.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');
    ['csharp', 'python', 'js', 'curl'].forEach(s => {
        const el = document.getElementById('sdk-' + s);
        if (el) el.style.display = (s === sdk) ? 'block' : 'none';
    });
};

window.copyCodeBlock = function copyCodeBlock() {
    ['csharp', 'python', 'js', 'curl'].forEach(s => {
        const el = document.getElementById('sdk-' + s);
        if (el && el.style.display !== 'none') {
            const text = el.innerText || el.textContent;
            navigator.clipboard?.writeText(text);
            if (typeof showDashToast === 'function') {
                showDashToast('Code snippet copied to clipboard!', 'success');
            }
        }
    });
};

/* ============================================
   KEYAUTH APP MANAGER LOGIC
   ============================================ */

let USER_APPS = [];
let CURRENT_APP = null;
let CURRENT_LANG = 'cpp';

const LANG_EXAMPLES = {
    cpp: (app) => `std::string name = skCrypt("${app.name}").decrypt();
std::string ownerid = skCrypt("${app.ownerId}").decrypt();
std::string secret = skCrypt("${app.secret}").decrypt();
std::string version = skCrypt("${app.version}").decrypt();
std::string url = skCrypt("https://localhost/api/1.2/").decrypt(); // change if self-hosting`,

    csharp: (app) => `public static api KeyAuthApp = new api(
    name: "${app.name}",
    ownerid: "${app.ownerId}",
    secret: "${app.secret}",
    version: "${app.version}"
);`,

    python: (app) => `keyauthapp = api(
    name = "${app.name}",
    ownerid = "${app.ownerId}",
    secret = "${app.secret}",
    version = "${app.version}",
    hash_to_check = getchecksum()
)`,

    php: (app) => `$name = "${app.name}";
$ownerid = "${app.ownerId}";
$secret = "${app.secret}";
$version = "${app.version}";`,

    javascript: (app) => `const KeyAuthApp = new KeyAuth(
    "${app.name}",
    "${app.ownerId}",
    "${app.secret}",
    "${app.version}"
);`,

    java: (app) => `private static String ownerid = "${app.ownerId}";
private static String appname = "${app.name}";
private static String secret = "${app.secret}";
private static String version = "${app.version}";`,

    vbnet: (app) => `Public Shared KeyAuthApp As New api(
    name:="${app.name}",
    ownerid:="${app.ownerId}",
    secret:="${app.secret}",
    version:="${app.version}"
)`,

    rust: (app) => `let mut keyauthapp = KeyAuth::new(
    "${app.name}",
    "${app.ownerId}",
    "${app.secret}",
    "${app.version}",
);`,

    go: (app) => `var KeyAuthApp = keyauth.Init(
    "${app.name}",
    "${app.ownerId}",
    "${app.secret}",
    "${app.version}",
);`,

    lua: (app) => `local KeyAuthApp = KeyAuth:new({
    name = "${app.name}",
    ownerid = "${app.ownerId}",
    secret = "${app.secret}",
    version = "${app.version}"
})`,

    ruby: (app) => `keyauth_app = KeyAuth.new(
  name: "${app.name}",
  ownerid: "${app.ownerId}",
  secret: "${app.secret}",
  version: "${app.version}"
)`,

    perl: (app) => `my $keyauth = KeyAuth->new(
    name => "${app.name}",
    ownerid => "${app.ownerId}",
    secret => "${app.secret}",
    version => "${app.version}"
);`
};

/* Demo app used whenever the server has nothing to give us (not signed in on
   the Express side, API down, or a brand-new account with no apps yet).
   Without this the credentials box stayed stuck on the
   "// Loading application credentials..." placeholder forever, because a
   401 JSON response does NOT throw — it just fails the `data.success`
   check below, so the old `catch`-only fallback never ran.               */
function seedLocalApp() {
    USER_APPS = [{
        id: 'app_arenasystem',
        name: 'arenasystem',
        ownerId: 'LZD7Rnmh6Y',
        secret: 'ed139aad09998d2b1ebf0ced706ddbff7be9802fa489e460d900528eead4b0d8',
        version: '1.0',
        status: 'active',
        createdAt: new Date().toISOString()
    }];
    CURRENT_APP = USER_APPS[0];
    renderAppManager();
}

window.loadUserApps = async function() {
    try {
        const res = await fetch('/api/apps');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (data.success && Array.isArray(data.apps) && data.apps.length) {
            USER_APPS = data.apps;
            if (!CURRENT_APP || !USER_APPS.find(a => a.id === CURRENT_APP.id)) {
                CURRENT_APP = USER_APPS[0] || null;
            }
            renderAppManager();
            return;
        }
        // API answered but handed back no apps -> fall through to the demo app
        if (!USER_APPS.length) seedLocalApp();
    } catch (e) {
        console.warn('Failed to load apps from server', e);
        if (!USER_APPS.length) seedLocalApp();
    }
};

window.renderAppManager = function() {
    if (!CURRENT_APP && USER_APPS.length > 0) {
        CURRENT_APP = USER_APPS[0];
    }
    if (!CURRENT_APP) return;

    const tagEl = document.getElementById('keyauthCurrentTag');
    const titleEl = document.getElementById('keyauthAppTitle');
    const sideNameEl = document.getElementById('currentAppName');
    if (tagEl) tagEl.textContent = CURRENT_APP.name;
    if (titleEl) titleEl.textContent = CURRENT_APP.name;
    if (sideNameEl) sideNameEl.textContent = CURRENT_APP.name;

    const drop = document.getElementById('appSelectDropdown');
    if (drop) {
        drop.innerHTML = USER_APPS.map(a => 
            `<option value="${a.id}" ${a.id === CURRENT_APP.id ? 'selected' : ''}>${a.name} (${a.version})</option>`
        ).join('');
        drop.onchange = (e) => {
            const selected = USER_APPS.find(a => a.id === e.target.value);
            if (selected) {
                CURRENT_APP = selected;
                renderAppManager();
            }
        };
    }

    const pauseBtn = document.getElementById('btnTogglePauseApp');
    if (pauseBtn) {
        if (CURRENT_APP.status === 'paused') {
            pauseBtn.innerHTML = `<i class="fas fa-play-circle"></i> Resume Application`;
            pauseBtn.className = 'ka-btn ka-btn-green';
        } else {
            pauseBtn.innerHTML = `<i class="fas fa-pause-circle"></i> Pause Application & Users`;
            pauseBtn.className = 'ka-btn ka-btn-orange';
        }
    }

    updateCodeSnippet();

    const tbody = document.getElementById('appsTableBody');
    const badge = document.getElementById('appsCountBadge');
    const cntApps = document.getElementById('cnt-apps');
    if (badge) badge.textContent = `${USER_APPS.length} App${USER_APPS.length > 1 ? 's' : ''}`;
    if (cntApps) cntApps.textContent = USER_APPS.length;
    
    if (tbody) {
        tbody.innerHTML = USER_APPS.map(a => `
            <tr style="${a.id === CURRENT_APP.id ? 'background:rgba(124,58,237,0.08);' : ''}">
                <td>
                    <div style="display:flex;align-items:center;gap:8px">
                        <i class="fas fa-cube" style="color:${a.id === CURRENT_APP.id ? '#a78bfa' : '#666'}"></i>
                        <span class="cell-bold">${a.name}</span>
                        ${a.id === CURRENT_APP.id ? '<span class="badge badge-purple" style="font-size:0.55rem;padding:1px 5px">ACTIVE</span>' : ''}
                    </div>
                </td>
                <td><span class="badge badge-blue">v${a.version}</span></td>
                <td><span class="cell-mono cell-dim" style="font-size:0.75rem">${a.ownerId}</span></td>
                <td>
                    <span class="cell-mono cell-dim" style="font-size:0.7rem" title="${a.secret}">
                        ${a.secret.slice(0, 14)}...
                    </span>
                </td>
                <td>
                    ${a.status === 'active' 
                        ? '<span class="badge badge-green">Active</span>' 
                        : '<span class="badge badge-yellow">Paused</span>'}
                </td>
                <td>
                    <div class="row-actions">
                        <button class="row-btn" title="Select App" onclick="selectApp('${a.id}')">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="row-btn danger" title="Delete App" onclick="deleteAppById('${a.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
};

window.switchKeyauthLang = function(lang) {
    CURRENT_LANG = lang;
    document.querySelectorAll('.lang-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    const label = document.getElementById('currentLangLabel');
    if (label) {
        const nameMap = { cpp: 'C++', csharp: 'C#', python: 'Python', php: 'PHP', javascript: 'JavaScript', java: 'Java', vbnet: 'VB.Net', rust: 'Rust', go: 'Go', lua: 'Lua', ruby: 'Ruby', perl: 'Perl' };
        label.textContent = nameMap[lang] || lang.toUpperCase();
    }
    updateCodeSnippet();
};

function updateCodeSnippet() {
    if (!CURRENT_APP) return;
    const codeEl = document.getElementById('keyauthCodeContent');
    if (codeEl) {
        const fn = LANG_EXAMPLES[CURRENT_LANG] || LANG_EXAMPLES.cpp;
        codeEl.textContent = fn(CURRENT_APP);
    }
}

window.copyCredsCode = function() {
    if (!CURRENT_APP) return;
    const fn = LANG_EXAMPLES[CURRENT_LANG] || LANG_EXAMPLES.cpp;
    const codeText = fn(CURRENT_APP);
    navigator.clipboard.writeText(codeText);
    showDashToast('Application credentials copied to clipboard!', 'success');
};

window.viewLangExample = function() {
    showDashToast(`Viewing ${CURRENT_LANG.toUpperCase()} example template!`, 'success');
};

window.selectApp = function(appId) {
    const selected = USER_APPS.find(a => a.id === appId);
    if (selected) {
        CURRENT_APP = selected;
        renderAppManager();
        if (typeof notifOnEvent === 'function') {
            notifOnEvent('select_app', `Active application switched to "${selected.name}"`);
        }
        showDashToast(`Selected application: ${selected.name}`, 'success');
    }
};

window.openCreateAppModal = function() {
    const modal = document.getElementById('createAppModal');
    if (modal) modal.style.display = 'flex';
};

window.closeCreateAppModal = function() {
    const modal = document.getElementById('createAppModal');
    if (modal) modal.style.display = 'none';
};

window.submitCreateApp = async function() {
    const nameInput = document.getElementById('newAppNameInput');
    const verInput = document.getElementById('newAppVersionInput');
    const name = nameInput ? nameInput.value.trim() : '';
    const version = verInput ? verInput.value.trim() : '1.0';

    if (!name) {
        showDashToast('Please enter an application name!', 'error');
        return;
    }

    try {
        const res = await fetch('/api/apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, version })
        });
        const data = await res.json();
        if (data.success && data.app) {
            USER_APPS.push(data.app);
            CURRENT_APP = data.app;
            renderAppManager();
            closeCreateAppModal();
            if (nameInput) nameInput.value = '';
            if (typeof notifOnEvent === 'function') {
                notifOnEvent('create_app', `Application "${data.app.name}" (v${data.app.version}) created successfully`);
            }
            showDashToast(`Application "${name}" created successfully!`, 'success');
        } else {
            showDashToast(data.error || 'Failed to create application', 'error');
        }
    } catch(e) {
        showDashToast('Server error creating app', 'error');
    }
};

window.openRenameAppModal = function() {
    if (!CURRENT_APP) return;
    const input = document.getElementById('renameAppNameInput');
    if (input) input.value = CURRENT_APP.name;
    const modal = document.getElementById('renameAppModal');
    if (modal) modal.style.display = 'flex';
};

window.closeRenameAppModal = function() {
    const modal = document.getElementById('renameAppModal');
    if (modal) modal.style.display = 'none';
};

window.submitRenameApp = async function() {
    if (!CURRENT_APP) return;
    const input = document.getElementById('renameAppNameInput');
    const newName = input ? input.value.trim() : '';
    if (!newName) {
        showDashToast('Please enter a valid application name', 'error');
        return;
    }
    const oldName = CURRENT_APP.name;

    try {
        const res = await fetch(`/api/apps/${CURRENT_APP.id}/rename`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });
        const data = await res.json();
        if (data.success && data.app) {
            CURRENT_APP.name = newName;
            renderAppManager();
            closeRenameAppModal();
            if (typeof notifOnEvent === 'function') {
                notifOnEvent('rename_app', `Application "${oldName}" renamed to "${newName}"`);
            }
            showDashToast('Application renamed successfully!', 'success');
        }
    } catch(e) {
        showDashToast('Failed to rename application', 'error');
    }
};

window.togglePauseApp = async function() {
    if (!CURRENT_APP) return;
    try {
        const res = await fetch(`/api/apps/${CURRENT_APP.id}/toggle-pause`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.app) {
            CURRENT_APP.status = data.app.status;
            renderAppManager();
            const isPaused = CURRENT_APP.status === 'paused';
            if (typeof notifOnEvent === 'function') {
                notifOnEvent(isPaused ? 'pause_app' : 'resume_app', `Application "${CURRENT_APP.name}" was ${isPaused ? 'paused' : 'resumed'}`);
            }
            showDashToast(`Application ${isPaused ? 'paused' : 'resumed'}!`, 
                isPaused ? 'warn' : 'success');
        }
    } catch(e) {
        showDashToast('Failed to update app status', 'error');
    }
};

window.refreshAppSecret = async function() {
    if (!CURRENT_APP) return;
    if (!confirm('Regenerate application secret? Existing integrations will stop working until updated.')) return;
    try {
        const res = await fetch(`/api/apps/${CURRENT_APP.id}/refresh-secret`, { method: 'POST' });
        const data = await res.json();
        if (data.success && data.app) {
            CURRENT_APP.secret = data.app.secret;
            renderAppManager();
            if (typeof notifOnEvent === 'function') {
                notifOnEvent('refresh_secret', `Secret for application "${CURRENT_APP.name}" was regenerated`);
            }
            showDashToast('Application secret refreshed!', 'success');
        }
    } catch(e) {
        showDashToast('Failed to refresh secret', 'error');
    }
};

window.deleteCurrentApp = function() {
    if (!CURRENT_APP) return;
    deleteAppById(CURRENT_APP.id);
};

window.deleteAppById = async function(appId) {
    const target = USER_APPS.find(a => a.id === appId);
    if (!target) return;
    if (!confirm(`Are you sure you want to delete application "${target.name}"?`)) return;

    try {
        const res = await fetch(`/api/apps/${appId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            USER_APPS = USER_APPS.filter(a => a.id !== appId);
            CURRENT_APP = USER_APPS[0] || null;
            renderAppManager();
            if (typeof notifOnEvent === 'function') {
                notifOnEvent('delete_app', `Application "${target.name}" was deleted`);
            }
            showDashToast(`Application "${target.name}" deleted!`, 'error');
        }
    } catch(e) {
        showDashToast('Failed to delete application', 'error');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadUserApps();
});



/* ============================================
   LICENSE SYNC WITH SERVER
   ============================================ */

/**
 * Load licenses from server and merge into STATE.licenses
 * Keeps any local-only entries (generated before server was ready)
 */
async function loadLicensesFromServer() {
    try {
        const res = await fetch('/api/v1/licenses');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.success || !data.licenses) return;

        // Build a map of server keys for quick lookup
        const serverMap = new Map(data.licenses.map(l => [l.key, l]));

        // Update existing STATE entries with server status
        STATE.licenses.forEach(l => {
            if (serverMap.has(l.key)) {
                const s = serverMap.get(l.key);
                l.status = s.status;
                l.level  = s.level;
                l.expires = s.expires;
                l.hwid   = s.hwid || '';
            }
        });

        // Add server keys not yet in STATE
        data.licenses.forEach(s => {
            if (!STATE.licenses.find(l => l.key === s.key)) {
                STATE.licenses.push({
                    id:      Date.now() + Math.random(),
                    key:     s.key,
                    user:    s.hwid ? 'bound' : '—',
                    level:   s.level,
                    duration:'—',
                    created: '—',
                    expires: s.expires,
                    status:  s.status,
                    hwid:    s.hwid || '',
                });
            }
        });

        renderLicenses();
        updateCounters();
    } catch (e) {
        console.warn('[Modz] Could not sync licenses from server:', e.message);
    }
}

/**
 * Patch generateKeys to also POST to server so keys work for verify
 */
const _zsOrigGenerate = window.generateKeys;
window.generateKeys = async function generateKeys(qty, duration, prefix, level, segLen, segCount, charSet) {
    // Call original to update STATE.licenses & render
    _zsOrigGenerate(qty, duration, prefix, level, segLen, segCount, charSet);

    // Get the keys just added (last qty items)
    const newKeys = STATE.licenses.slice(-qty);

    try {
        const res = await fetch('/api/v1/licenses/generate', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                count:   qty,
                level:   level   || 'Standard',
                expires: duration === 'Lifetime' ? 'Never' : duration,
                prefix:  prefix  || 'Modz',
            }),
        });
        const data = await res.json();
        if (data.success && data.licenses) {
            // Replace the locally generated keys with the server-issued ones
            STATE.licenses.splice(-qty, qty);
            data.licenses.forEach((l, i) => {
                STATE.licenses.push({
                    id:      Date.now() + i,
                    key:     l.key,
                    user:    '—',
                    level:   l.level,
                    duration: duration,
                    created: new Date().toISOString().split('T')[0],
                    expires: l.expires,
                    status:  'unused',
                    hwid:    '',
                });
            });
            renderLicenses();
            updateCounters();
        }
    } catch (e) {
        console.warn('[Modz] Could not sync generated keys to server:', e.message);
    }
};

/**
 * Patch setLicenseStatus to also update server
 */
const _zsOrigSetStatus = window.setLicenseStatus;
window.setLicenseStatus = async function setLicenseStatus(id, status) {
    const lic = STATE.licenses.find(l => l.id === id);
    if (!lic) return;
    _zsOrigSetStatus(id, status);
    try {
        await fetch(`/api/v1/licenses/${encodeURIComponent(lic.key)}/status`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status }),
        });
    } catch (e) {
        console.warn('[Modz] Could not sync status to server:', e.message);
    }
};

/**
 * Patch deleteLicense to also delete from server
 */
const _zsOrigDelete = window.deleteLicense;
window.deleteLicense = async function deleteLicense(id) {
    const lic = STATE.licenses.find(l => l.id === id);
    _zsOrigDelete(id);
    if (!lic) return;
    try {
        await fetch(`/api/v1/licenses/${encodeURIComponent(lic.key)}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.warn('[Modz] Could not delete key from server:', e.message);
    }
};

// Load server licenses on page ready
document.addEventListener('DOMContentLoaded', () => {
    loadLicensesFromServer();
}, { once: true });
