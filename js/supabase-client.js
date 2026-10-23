/* ============================================================
   ARENA SYSTEM AUTH — supabase-client.js
   Shared Supabase client + auth helpers with automatic fallback

   IMPORTANT: the whole body below is wrapped in an IIFE so that
   internal names (Auth, Apps, Licenses, Admin, User, apiCall,
   SUPABASE_URL, _supabase …) never leak into the global scope.

   auth-supabase.js / dashboard-supabase.js do, at the top level
   of a classic <script>:

       const { Auth } = window.ModzAuth;

   With a global `const Auth` here that threw

       SyntaxError: Identifier 'Auth' has already been declared

   which aborted those entire files (login / register /
   reset-password / dashboard data layer). window.ModzAuth is the
   only public surface of this module.
   ============================================================ */

(function () {
'use strict';

// ── CONFIG (public values only — safe to expose) ──────────────
const SUPABASE_URL  = window.__ENV__?.SUPABASE_URL  || 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = window.__ENV__?.SUPABASE_ANON || 'YOUR_ANON_KEY';
const API_BASE      = window.__ENV__?.API_BASE       || `${SUPABASE_URL}/functions/v1/api`;

const IS_PLACEHOLDER = !SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT');

// ── SUPABASE CLIENT ───────────────────────────────────────────
let _supabase = null;
try {
    const { createClient } = supabase;
    _supabase = createClient(
        IS_PLACEHOLDER ? 'https://demo-project.supabase.co' : SUPABASE_URL,
        IS_PLACEHOLDER ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.demo' : SUPABASE_ANON
    );
} catch (e) {
    console.warn('Supabase JS SDK init notice:', e);
}

// ── API HELPER ────────────────────────────────────────────────
async function apiCall(method, endpoint, body = null, requireAuth = false) {
    if (IS_PLACEHOLDER) {
        // Return local mock data when Supabase is not connected yet
        return getMockResponse(endpoint, method, body);
    }

    const headers = { 'Content-Type': 'application/json' };

    if (requireAuth && _supabase) {
        try {
            const { data: { session } } = await _supabase.auth.getSession();
            if (session) {
                headers['Authorization'] = `Bearer ${session.access_token}`;
            }
        } catch (_) {}
    }

    const opts = { method, headers };
    if (body && method !== 'GET') opts.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, opts);
        const json = await res.json();
        if (!json.success) {
            throw Object.assign(new Error(json.error?.message || json.message || 'API error'), { code: json.error?.code });
        }
        return json.data || json;
    } catch (err) {
        if (err.name === 'TypeError' || err.message?.includes('fetch')) {
            console.warn('Network connection error to Edge Function. Falling back to local mode.', err);
            return getMockResponse(endpoint, method, body);
        }
        throw err;
    }
}

// ── MOCK DATA FALLBACK FOR LOCAL TESTING ───────────────────────
function getMockResponse(endpoint, method, body) {
    const savedUser = JSON.parse(localStorage.getItem('modz_local_user') || 'null');
    const localUser = savedUser || {
        id: 'usr_demo_123',
        email: 'user@modz.squad',
        username: 'modz_owner',
        full_name: 'Modz Owner',
        role: 'owner',
        created_at: new Date().toISOString()
    };

    if (endpoint.startsWith('/auth/register') || endpoint.startsWith('/auth/login')) {
        return { success: true, token: 'demo_token_' + Date.now(), user: localUser };
    }
    if (endpoint.startsWith('/auth/me') || endpoint.startsWith('/user/profile')) {
        return { success: true, user: localUser };
    }
    if (endpoint.startsWith('/applications')) {
        const savedApps = JSON.parse(localStorage.getItem('modz_local_apps') || '[]');
        if (method === 'POST') {
            const newApp = {
                id: 'app_' + Math.random().toString(36).substring(2, 11),
                name: body?.name || 'My Application',
                version: body?.version || '1.0.0',
                client_id: 'app_client_' + Math.random().toString(36).substring(2, 11),
                client_secret: 'app_secret_' + Math.random().toString(36).substring(2, 11),
                created_at: new Date().toISOString()
            };
            savedApps.push(newApp);
            localStorage.setItem('modz_local_apps', JSON.stringify(savedApps));
            return newApp;
        }
        return savedApps;
    }
    if (endpoint.startsWith('/licenses')) {
        const savedKeys = JSON.parse(localStorage.getItem('modz_local_keys') || '[]');
        if (method === 'POST') {
            const amount = body?.amount || 1;
            const generated = [];
            for (let i = 0; i < amount; i++) {
                const key = 'ArenaSystem-' + Array.from({length: 4}, () => Math.random().toString(36).substring(2, 7).toUpperCase()).join('-');
                const item = {
                    id: 'lic_' + Math.random().toString(36).substring(2, 9),
                    license_key: key,
                    status: 'UNUSED',
                    app_id: body?.app_id || 'app_1',
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + (body?.duration_days || 30) * 86400000).toISOString()
                };
                generated.push(item);
                savedKeys.push(item);
            }
            localStorage.setItem('modz_local_keys', JSON.stringify(savedKeys));
            return generated;
        }
        return savedKeys;
    }
    return { success: true, data: [] };
}

// ── SERVER SESSION (passport cookie) ──────────────────────────
/* The dashboard, admin panel and native SDK all authenticate against the
   express-session passport cookie created by server.js (POST /auth/local).
   The localStorage "demo" login below never created that cookie, so the
   login page and the dashboard disagreed about whether you were signed in
   and bounced each other forever (/login <-> /dashboard). These helpers
   make the server the single source of truth; localStorage is only a
   display cache / offline-demo fallback. */
async function serverLogin(email, password) {
    const res = await fetch('/auth/local', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body:        JSON.stringify({ email, password })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success !== false, status: res.status, data };
}
async function serverMe() {
    try {
        const res = await fetch('/api/me', { credentials: 'same-origin' });
        if (!res.ok) return null;               /* server answered, but not JSON/ok */
        return await res.json();
    } catch (_) { return null; }                /* server unreachable */
}

// ── AUTH FUNCTIONS ────────────────────────────────────────────
const Auth = {
    // Register
    async register({ email, password, username, full_name }) {
        /* The local server has no separate register route — POST /auth/local
           creates the account on first sign-in and establishes the passport
           session the dashboard requires. Do that first. */
        try {
            const s = await serverLogin(email, password);
            if (s.ok) {
                const me   = await serverMe();
                const user = me?.user || { email, role: s.data.role, username: username || email.split('@')[0], full_name };
                window.CURRENT_USER = user;
                return { user, session: { access_token: 'server_session' } };
            }
            if (s.status === 400) {
                throw Object.assign(new Error(s.data.error || 'Invalid input.'), { code: 'INVALID_INPUT' });
            }
            console.warn('Auth.register: /auth/local returned ' + s.status + ' — falling back.');
        } catch (err) {
            if (err.code) throw err;
            console.warn('Auth.register: server unreachable — falling back.', err);
        }

        if (!IS_PLACEHOLDER && _supabase) {
            try {
                const { data, error } = await _supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username, full_name }
                    }
                });
                if (error && !error.message.includes('fetch')) throw error;
                if (data?.user) {
                    const localUser = {
                        id: data.user.id,
                        email: data.user.email,
                        username: username || email.split('@')[0],
                        full_name: full_name || username || email.split('@')[0],
                        role: 'owner',
                        created_at: data.user.created_at || new Date().toISOString()
                    };
                    localStorage.setItem('modz_local_user', JSON.stringify(localUser));
                    localStorage.setItem('modz_local_token', data.session?.access_token || 'demo_token');
                    window.CURRENT_USER = localUser;
                    return { user: localUser, session: data.session };
                }
            } catch (err) {
                console.warn('Real Supabase Auth notice:', err);
            }
        }

        /* FINAL FALLBACK — no fake session (same loop as Auth.login). */
        throw Object.assign(
            new Error('Auth server unreachable. Make sure server.js is running.'),
            { code: 'SERVER_UNREACHABLE' }
        );
    },

    // Login
    async login({ email, password }) {
        /* PRIMARY: create a real server passport session via /auth/local.
           This is what the dashboard (/api/me) and the native panel validate
           against — a localStorage-only "login" never actually worked. */
        try {
            const s = await serverLogin(email, password);
            if (s.ok) {
                /* Pull the authoritative user the server now knows about. */
                const me   = await serverMe();
                const user = me?.user || { email, role: s.data.role };
                window.CURRENT_USER = user;
                return { user, session: { access_token: 'server_session' } };
            }
            /* Server answered but rejected the credentials → surface it.
               Do NOT silently fall back to a fake localStorage session. */
            if (s.status === 401 || s.status === 400) {
                throw Object.assign(new Error(s.data.error || 'Invalid email or password.'),
                                    { code: s.status === 401 ? 'INVALID_CREDENTIALS' : 'INVALID_INPUT' });
            }
            /* Other status (e.g. 404 on a stale server) → fall through to the
               Supabase / demo paths below so a not-yet-restarted server still
               gives a usable experience. */
            console.warn('Auth.login: /auth/local returned ' + s.status + ' — falling back.');
        } catch (err) {
            /* Network failure reaching the server → fall through to fallbacks. */
            if (err.code) throw err;
            console.warn('Auth.login: server unreachable — falling back.', err);
        }

        if (!IS_PLACEHOLDER && _supabase) {
            try {
                const { data, error } = await _supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error && !error.message.includes('fetch')) throw error;
                if (data?.session && data?.user) {
                    const localUser = {
                        id: data.user.id,
                        email: data.user.email,
                        username: data.user.user_metadata?.username || email.split('@')[0],
                        full_name: data.user.user_metadata?.full_name || '',
                        role: data.user.user_metadata?.role || 'owner',
                        created_at: data.user.created_at
                    };
                    localStorage.setItem('modz_local_user', JSON.stringify(localUser));
                    localStorage.setItem('modz_local_token', data.session.access_token);
                    window.CURRENT_USER = localUser;
                    return { user: localUser, session: data.session };
                }
            } catch (err) {
                console.warn('Supabase login notice:', err);
                if (err.message && !err.message.includes('fetch')) throw err;
            }
        }

        /* FINAL FALLBACK — no fake session.
           The dashboard gates on /api/me (server passport session). Writing a
           localStorage-only user here is what caused the infinite
           /login <-> /dashboard redirect loop: the login page believed it
           (localStorage) while the server did not. If we got this far the
           server is unreachable or rejected the login, so fail loudly. */
        throw Object.assign(
            new Error('Auth server unreachable or rejected the login. Make sure server.js is running.'),
            { code: 'SERVER_UNREACHABLE' }
        );
    },

    // Logout
    async logout() {
        /* Destroy the server passport session too — clearing localStorage
           alone left /api/me still "authenticated", so the dashboard would
           happily reload. */
        try { await fetch('/auth/logout', { credentials: 'same-origin' }); } catch (_) {}
        localStorage.removeItem('modz_local_user');
        localStorage.removeItem('modz_local_token');
        delete window.CURRENT_USER;
        if (_supabase) {
            try { await _supabase.auth.signOut(); } catch (_) {}
        }
        window.location.href = 'login.html?logged_out=1';
    },

    // Reset password
    async resetPassword(email) {
        if (!IS_PLACEHOLDER && _supabase) {
            try {
                const { error } = await _supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/reset-password.html'
                });
                if (error) throw error;
                return { success: true };
            } catch (err) {
                if (err.message && !err.message.includes('fetch')) throw err;
            }
        }
        return { success: true, message: 'Password reset email sent (Demo Mode).' };
    },

    // Get Profile
    async getProfile() {
        /* Prefer the live server session over any cached localStorage copy. */
        const me = await serverMe();
        if (me?.authenticated && me.user) {
            window.CURRENT_USER = me.user;
            return { success: true, user: me.user };
        }

        if (!IS_PLACEHOLDER && _supabase) {
            try {
                const { data: { user } } = await _supabase.auth.getUser();
                if (user) {
                    const u = {
                        id: user.id,
                        email: user.email,
                        username: user.user_metadata?.username || user.email.split('@')[0],
                        full_name: user.user_metadata?.full_name || '',
                        role: user.user_metadata?.role || 'owner',
                        created_at: user.created_at
                    };
                    window.CURRENT_USER = u;
                    return { success: true, user: u };
                }
            } catch (_) {}
        }

        return { success: false, error: 'NOT_AUTHENTICATED' };
    },

    // Get me
    async getMe() {
        const p = await this.getProfile();
        if (p.success) return p.user;
        throw new Error('NOT_AUTHENTICATED');
    },

    // Check if authenticated
    async isAuthenticated() {
        /* SERVER FIRST — the passport session is the source of truth. The old
           check read localStorage only, which the demo fallback kept
           populated, so the login page thought you were signed in and
           redirected to the dashboard, whose /api/me check said otherwise.
           That disagreement was the infinite redirect loop. */
        const me = await serverMe();
        if (me && typeof me.authenticated === 'boolean') return me.authenticated;

        /* Server unreachable → fall back to a real Supabase session only. */
        if (!IS_PLACEHOLDER && _supabase) {
            try {
                const { data: { session } } = await _supabase.auth.getSession();
                return !!session;
            } catch (_) {}
        }
        return false;
    },

    // Redirect if not authed
    async requireAuth(redirectTo = 'login.html') {
        const authed = await this.isAuthenticated();
        if (!authed) window.location.href = redirectTo;
        return authed;
    },

    // Redirect if authed
    async redirectIfAuthenticated(to = 'dashboard.html') {
        const authed = await this.isAuthenticated();
        if (authed) window.location.href = to;
    },

    // Get Token
    async getToken() {
        return localStorage.getItem('modz_local_token') || 'demo_token';
    },
};

// ── APPLICATIONS API ──────────────────────────────────────────
const Apps = {
    async list()                { return apiCall('GET',    '/applications', null, true); },
    async create(data)          { return apiCall('POST',   '/applications', data, true); },
    async update(id, data)      { return apiCall('PUT',    `/applications/${id}`, data, true); },
    async delete(id)            { return apiCall('DELETE', `/applications/${id}`, null, true); },
    async getStatus(clientId)   { return apiCall('GET',    `/application/status?client_id=${clientId}`); },
    async getVersion(clientId)  { return apiCall('GET',    `/application/version?client_id=${clientId}`); },
};

// ── LICENSES API ──────────────────────────────────────────────
const Licenses = {
    async list(appId)           { return apiCall('GET',    `/licenses?app_id=${appId}`, null, true); },
    async generate(data)        { return apiCall('POST',   '/licenses/generate', data, true); },
    async validate(licenseKey, clientId) {
        return apiCall('POST', '/license/validate', { license_key: licenseKey, client_id: clientId });
    },
    async activate(licenseKey, clientId, hwid) {
        return apiCall('POST', '/license/activate', { license_key: licenseKey, client_id: clientId, hwid }, true);
    },
    async revoke(licenseId)     { return apiCall('POST',   '/license/revoke', { license_id: licenseId }, true); },
};

// ── ADMIN API ─────────────────────────────────────────────────
const Admin = {
    async listUsers()           { return apiCall('GET',  '/admin/users', null, true); },
    async setRole(id, role)     { return apiCall('PUT',  `/admin/users/${id}/role`, { role }, true); },
    async setBan(id, banned)    { return apiCall('PUT',  `/admin/users/${id}/ban`, { banned }, true); },
    async listApps()            { return apiCall('GET',  '/admin/applications', null, true); },
    async listLogs()            { return apiCall('GET',  '/admin/logs', null, true); },
};

// ── USER API ──────────────────────────────────────────────────
const User = {
    async getStatus()           { return apiCall('GET', '/user/status', null, true); },
    async getRole()             { return apiCall('GET', '/user/role', null, true); },
};

// Expose to global scope (the ONLY global this file creates)
window.ModzAuth = { _supabase, apiCall, Auth, Apps, Licenses, Admin, User };

})(); /* end IIFE */
