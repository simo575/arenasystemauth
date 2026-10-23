/* ============================================================
   ARENA SYSTEM — ADMIN PANEL CONTROLLER
   Owner-only system administration & management logic
   ============================================================ */

let allUsers = [];
let allApps = [];
let allLogs = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initAdmin();
});

async function initAdmin() {
    try {
        const authed = await ModzAuth.Auth.isAuthenticated();
        if (!authed) {
            window.location.href = 'login.html';
            return;
        }

        const profileRes = await ModzAuth.Auth.getProfile();
        if (!profileRes.success || !profileRes.user) {
            showToast('Failed to load session info.', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        const u = profileRes.user;
        if (u.role !== 'owner') {
            alert('Access Denied: Owner permissions required.');
            window.location.href = 'dashboard.html';
            return;
        }

        const nameEl = document.getElementById('adminName');
        const avatarEl = document.getElementById('adminAvatar');
        if (nameEl) nameEl.textContent = u.full_name || u.username || u.email;
        if (avatarEl) avatarEl.textContent = (u.full_name || u.email || 'A')[0].toUpperCase();

        await refreshAllData();

    } catch (err) {
        console.error('Admin init error:', err);
        showToast('Failed to initialize Admin Console.', 'error');
    }
}

async function refreshAllData() {
    await Promise.all([
        loadUsers(),
        loadApps(),
        loadLogs()
    ]);
}

async function loadUsers() {
    const res = await ModzAuth.Admin.listUsers();
    if (res.success && Array.isArray(res.users)) {
        allUsers = res.users;
        document.getElementById('statTotalUsers').textContent = allUsers.length;
        renderUsersTable(allUsers);
    } else {
        showToast(res.error || 'Failed to fetch users', 'error');
    }
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No registered users found.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        const isBanned = u.role === 'banned';
        const roleClass = isBanned ? 'role-banned' : (u.role === 'owner' ? 'role-owner' : (u.role === 'seller' ? 'role-seller' : 'role-user'));
        const joinedDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A';

        return `
            <tr>
                <td>
                    <div style="font-weight:600;color:#fff">${escapeHtml(u.full_name || u.username || 'N/A')}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">ID: ${u.id.substring(0, 8)}...</div>
                </td>
                <td>${escapeHtml(u.email || 'N/A')}</td>
                <td><span class="role-badge ${roleClass}">${u.role || 'user'}</span></td>
                <td>${joinedDate}</td>
                <td>
                    <button class="btn-sm btn-action-role" onclick="promptChangeRole('${u.id}', '${u.role}')" title="Change Role">
                        <i class="fas fa-user-tag"></i> Role
                    </button>
                    ${isBanned 
                        ? `<button class="btn-sm btn-action-unban" onclick="toggleBan('${u.id}', false)" title="Unban User"><i class="fas fa-check"></i> Unban</button>`
                        : `<button class="btn-sm btn-action-ban" onclick="toggleBan('${u.id}', true)" title="Ban User"><i class="fas fa-ban"></i> Ban</button>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

function filterUsersTable() {
    const query = (document.getElementById('userSearchInput')?.value || '').toLowerCase();
    const filtered = allUsers.filter(u => 
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.full_name && u.full_name.toLowerCase().includes(query)) ||
        (u.username && u.username.toLowerCase().includes(query))
    );
    renderUsersTable(filtered);
}

async function promptChangeRole(userId, currentRole) {
    const newRole = prompt('Enter new role for user (owner, seller, premium, elite, user):', currentRole);
    if (!newRole || newRole.trim() === currentRole) return;

    const validRoles = ['owner', 'seller', 'premium', 'elite', 'user', 'banned'];
    if (!validRoles.includes(newRole.trim().toLowerCase())) {
        alert('Invalid role specified. Allowed: ' + validRoles.join(', '));
        return;
    }

    const res = await ModzAuth.Admin.setRole(userId, newRole.trim().toLowerCase());
    if (res.success) {
        showToast('User role updated successfully.', 'success');
        await loadUsers();
    } else {
        showToast(res.error || 'Failed to update role', 'error');
    }
}

async function toggleBan(userId, banState) {
    const confirmMsg = banState ? 'Are you sure you want to BAN this user?' : 'Are you sure you want to UNBAN this user?';
    if (!confirm(confirmMsg)) return;

    const res = await ModzAuth.Admin.setBan(userId, banState);
    if (res.success) {
        showToast(`User ${banState ? 'banned' : 'unbanned'} successfully.`, 'success');
        await loadUsers();
    } else {
        showToast(res.error || 'Operation failed', 'error');
    }
}

async function loadApps() {
    const res = await ModzAuth.Admin.listApps();
    if (res.success && Array.isArray(res.applications)) {
        allApps = res.applications;
        document.getElementById('statTotalApps').textContent = allApps.length;
        renderAppsTable(allApps);
    } else {
        showToast(res.error || 'Failed to fetch applications', 'error');
    }
}

function renderAppsTable(apps) {
    const tbody = document.getElementById('appsTableBody');
    if (!tbody) return;

    if (apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No applications registered in system.</td></tr>`;
        return;
    }

    tbody.innerHTML = apps.map(app => `
        <tr>
            <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--orange-primary)">${app.id}</td>
            <td style="font-weight:600;color:#fff">${escapeHtml(app.name)}</td>
            <td style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted)">${app.user_id}</td>
            <td>${app.created_at ? new Date(app.created_at).toLocaleString() : 'N/A'}</td>
        </tr>
    `).join('');
}

async function loadLogs() {
    const res = await ModzAuth.Admin.listLogs();
    if (res.success && Array.isArray(res.logs)) {
        allLogs = res.logs;
        document.getElementById('statTotalLogs').textContent = allLogs.length;
        renderLogsTable(allLogs);
    } else {
        showToast(res.error || 'Failed to fetch audit logs', 'error');
    }
}

function renderLogsTable(logs) {
    const overviewBody = document.getElementById('overviewLogsTable');
    const fullBody = document.getElementById('fullLogsTableBody');

    if (logs.length === 0) {
        const emptyRow = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No audit logs recorded yet.</td></tr>`;
        if (overviewBody) overviewBody.innerHTML = emptyRow;
        if (fullBody) fullBody.innerHTML = emptyRow;
        return;
    }

    const rowsHtml = logs.map(log => `
        <tr>
            <td style="font-size:0.8rem;color:var(--text-muted)">${log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
            <td style="font-family:var(--font-mono);font-size:0.75rem">${log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}</td>
            <td><span style="color:var(--orange-primary);font-weight:600">${escapeHtml(log.action)}</span></td>
            <td style="font-size:0.85rem;color:#d1d5db">${escapeHtml(JSON.stringify(log.details || {}))}</td>
        </tr>
    `).join('');

    if (overviewBody) overviewBody.innerHTML = logs.slice(0, 5).map(log => `
        <tr>
            <td style="font-size:0.8rem;color:var(--text-muted)">${log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
            <td style="font-family:var(--font-mono);font-size:0.75rem">${log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}</td>
            <td><span style="color:var(--orange-primary);font-weight:600">${escapeHtml(log.action)}</span></td>
            <td style="font-size:0.85rem;color:#d1d5db">${escapeHtml(JSON.stringify(log.details || {}))}</td>
        </tr>
    `).join('');

    if (fullBody) fullBody.innerHTML = rowsHtml;
}

function switchTab(tabId, btn) {
    document.querySelectorAll('.nav-item button').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');

    const titles = {
        overview: 'Admin Overview',
        users: 'User Management',
        apps: 'Application Directory',
        logs: 'Global Audit Trail'
    };
    document.getElementById('pageTitle').textContent = titles[tabId] || 'Admin Console';
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${escapeHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, match => {
        const escapes = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return escapes[match];
    });
}
