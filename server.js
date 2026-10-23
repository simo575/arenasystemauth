/**
 * AuthX — Express Server v4.0
 * Google-Only OAuth + Role System (user / elite / premium / seller / owner)
 * Run: npm run dev -> http://localhost:3000
 */

require("dotenv").config();

const express        = require("express");
const session        = require("express-session");
const passport       = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path           = require("path");
const fs             = require("fs");
const crypto         = require("crypto");

const app  = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

/* -----------------------------------------
   ROLE SYSTEM
   user    -> freshly logged in, CANNOT do anything
   elite   -> can create apps + up to 50 keys
   premium -> can create apps + up to 200 keys
   seller  -> can create apps + UNLIMITED keys
   owner   -> full admin
----------------------------------------- */
const OWNER_EMAIL = (process.env.OWNER_EMAIL || "touilleb2005@gmail.com").toLowerCase();

/* Shared secret the Discord bot (Auth Bot Zyrex) presents on X-Bot-Secret to
   reach /api/bot/*. It lets the bot manage the SAME key store the dashboard
   and native client use, so a key generated in Discord is immediately
   activatable by KeyAuth — no second database to keep in sync. */
const BOT_API_SECRET = process.env.BOT_API_SECRET || "";

const ROLE_LIMITS = {
    user:    { canCreateApps: false, maxKeys: 0,        label: "User",    icon: "👤", color: "#6b7280" },
    elite:   { canCreateApps: true,  maxKeys: 50,       label: "Elite",   icon: "⚡", color: "#f59e0b" },
    premium: { canCreateApps: true,  maxKeys: 200,      label: "Premium", icon: "⭐", color: "#3b82f6" },
    seller:  { canCreateApps: true,  maxKeys: Infinity, label: "Seller",  icon: "💎", color: "#8b5cf6" },
    owner:   { canCreateApps: true,  maxKeys: Infinity, label: "Owner",   icon: "👑", color: "#f97316" },
};

function getRole(email) {
    if (!email) return "user";
    return email.toLowerCase() === OWNER_EMAIL ? "owner" : "user";
}

function getRoleLimit(role) {
    return ROLE_LIMITS[role] || ROLE_LIMITS.user;
}

/* ----------------------------------------- IN-MEMORY USER STORE */
const GOOGLE_USERS  = new Map();
const USER_KEY_COUNTS = new Map();

function findUserById(id) {
    return GOOGLE_USERS.get(id) || null;
}

/* ----------------------------------------- GOOGLE OAUTH */
const hasGoogleCreds =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET_HERE";

if (hasGoogleCreds) {
    passport.use(new GoogleStrategy(
        {
            clientID:     process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:  process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
        },
        function (_at, _rt, profile, done) {
            const email = (profile.emails?.[0]?.value || "").toLowerCase();
            const role  = getRole(email);
            const existing = GOOGLE_USERS.get(profile.id);
            if (existing) {
                existing.lastLogin = new Date().toISOString();
                if (email === OWNER_EMAIL) existing.role = "owner";
                return done(null, existing);
            }
            const user = {
                id:          profile.id,
                displayName: profile.displayName || email.split("@")[0],
                email,
                avatar:      profile.photos?.[0]?.value || "",
                role,
                createdAt:   new Date().toISOString(),
                lastLogin:   new Date().toISOString(),
                provider:    "google",
            };
            GOOGLE_USERS.set(profile.id, user);
            return done(null, user);
        }
    ));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, findUserById(id)));

/* ----------------------------------------- MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:            process.env.SESSION_SECRET || "authx_secret_dev",
    resave:            false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(ROOT, {
    index: false,
    setHeaders(res) { res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); },
}));

/* ----------------------------------------- GUARDS */
function requireLogin(req, res, next) {
    if (req.isAuthenticated()) return next();
    /* fetch()/XHR callers expect JSON. Redirecting them returned the HTML
       login page, which made res.json() throw "Unexpected token '<'". */
    if (req.path.startsWith("/api/")) {
        return res.status(401).json({ success: false, authenticated: false, error: "Authentication required" });
    }
    res.redirect("/login?reason=auth");
}
function requireOwner(req, res, next) {
    if (req.isAuthenticated() && req.user?.role === "owner") return next();
    res.status(403).json({ error: "Owner access required" });
}
/* Discord bot guard — no browser session, so it authenticates with the
   shared secret on X-Bot-Secret instead of a passport cookie. */
function requireBot(req, res, next) {
    if (!BOT_API_SECRET) {
        return res.status(503).json({ success: false, error: "BOT_API_SECRET is not set on the server" });
    }
    const given = req.get("x-bot-secret") || "";
    /* Constant-time compare so the secret can't be guessed by timing. */
    const a = Buffer.from(given), b = Buffer.from(BOT_API_SECRET);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ success: false, error: "Invalid bot secret" });
    }
    next();
}

/* ----------------------------------------- GOOGLE ROUTES */
app.get("/auth/google", (req, res, next) => {
    if (!hasGoogleCreds) return res.redirect("/login?error=google_not_configured");
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })(req, res, next);
});

app.get("/auth/google/dev-mock", (req, res) => {
    const email  = (req.query.email || OWNER_EMAIL).toLowerCase();
    const role   = getRole(email);
    const mockId = "google_demo_" + Buffer.from(email).toString("hex").slice(0, 10);
    let user = GOOGLE_USERS.get(mockId);
    if (!user) {
        user = {
            id: mockId, displayName: email.split("@")[0],
            email, avatar: "https://lh3.googleusercontent.com/a/default-user=s96-c",
            role, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), provider: "google",
        };
        GOOGLE_USERS.set(mockId, user);
    } else {
        user.lastLogin = new Date().toISOString();
        if (email === OWNER_EMAIL) user.role = "owner";
    }
    req.login(user, (err) => {
        if (err) return res.redirect("/login?error=session_error");
        res.redirect("/dashboard?welcome=1");
    });
});

/* ----------------------------------------- LOCAL LOGIN (email + password)
   The login.html form used to call Supabase (Auth.login), which is not
   configured here — so signing in never created a real server.js session and
   every /api/v1/licenses/generate call silently 401'd. This endpoint creates
   (on first sign-in) and logs in a local user, establishing the passport
   session that the dashboard + native panel flow depends on.              */
app.post("/auth/local", express.json(), (req, res) => {
    const email    = String((req.body || {}).email    || "").trim().toLowerCase();
    const password = String((req.body || {}).password || "");

    if (!email || !email.includes("@")) return res.status(400).json({ success: false, error: "Valid email required" });
    if (!password || password.length < 4) return res.status(400).json({ success: false, error: "Password must be at least 4 characters" });

    const role    = getRole(email);
    const mockId  = "local_" + Buffer.from(email).toString("hex").slice(0, 12);
    let   user    = GOOGLE_USERS.get(mockId);

    if (!user) {
        user = {
            id: mockId, displayName: email.split("@")[0],
            email, avatar: "", role,
            createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(),
            provider: "local", password,   /* dev-only store; not exposed via /api/me */
        };
        GOOGLE_USERS.set(mockId, user);
    } else {
        /* Same email must reuse the same password once chosen. */
        if (user.provider === "local" && user.password && user.password !== password)
            return res.status(401).json({ success: false, error: "Incorrect password" });
        user.lastLogin = new Date().toISOString();
        if (email === OWNER_EMAIL) user.role = "owner";
    }

    req.login(user, (err) => {
        if (err) return res.status(500).json({ success: false, error: "Session error" });
        res.json({ success: true, redirect: "/dashboard", role: user.role });
    });
});

app.get("/auth/google/callback",
    (req, res, next) => {
        if (!hasGoogleCreds) return res.redirect("/login?error=google_not_configured");
        passport.authenticate("google", { failureRedirect: "/login?error=oauth_failed" })(req, res, next);
    },
    (req, res) => res.redirect("/dashboard?welcome=1")
);

app.get("/auth/logout", (req, res) => {
    req.logout(err => { if (err) console.error(err); });
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/login?logged_out=1");
    });
});

/* ----------------------------------------- API ME */
app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.json({ authenticated: false, user: null, hasGoogleCreds });
    }
    const u = req.user;
    const limit = getRoleLimit(u.role);
    res.json({
        authenticated: true, hasGoogleCreds,
        user: {
            id: u.id, displayName: u.displayName, email: u.email,
            avatar: u.avatar || "", role: u.role || "user",
            roleInfo: { ...limit, maxKeys: limit.maxKeys === Infinity ? "Unlimited" : limit.maxKeys },
            createdAt: u.createdAt, lastLogin: u.lastLogin, provider: u.provider || "google",
        },
    });
});

/* ----------------------------------------- APPS */
const APPS    = new Map();
const APP_KEYS = new Map();

/* ----------------------------------------- PERSISTENCE
   APPS and APP_KEYS used to live only in RAM, so every server restart wiped
   every generated licence — the panel then answered "Key does not exist".
   Both stores are now mirrored to data.json on disk and reloaded on boot.   */
const DATA_FILE = path.join(__dirname, "data.json");

function saveData() {
    try {
        const payload = {
            apps:     Array.from(APPS.values()),
            appKeys:  Array.from(APP_KEYS.entries()),
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
    } catch (e) {
        console.error("[persist] save failed:", e.message);
    }
}

function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) return;
        let raw = fs.readFileSync(DATA_FILE, "utf8");
        /* Strip a UTF-8 BOM if present — editors (e.g. PowerShell's
           Set-Content -Encoding UTF8) add one and JSON.parse chokes on it. */
        if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
        const data = JSON.parse(raw);
        if (Array.isArray(data.apps))    for (const a of data.apps)    APPS.set(a.id, a);
        if (Array.isArray(data.appKeys)) for (const [id, arr] of data.appKeys) APP_KEYS.set(id, arr);
        console.log(`[persist] loaded ${APPS.size} app(s), ${Array.from(APP_KEYS.values()).reduce((n, a) => n + a.length, 0)} key(s)`);
    } catch (e) {
        console.error("[persist] load failed:", e.message);
    }
}

function genSecret() {
    const h = "0123456789abcdef"; let r = "";
    for (let i = 0; i < 64; i++) r += h[Math.floor(Math.random() * h.length)];
    return r;
}
function genOwnerId() {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; let r = "";
    for (let i = 0; i < 10; i++) r += c[Math.floor(Math.random() * c.length)];
    return r;
}
function genKeyStr() {
    const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; const parts = [];
    for (let s = 0; s < 4; s++) {
        let seg = "";
        for (let i = 0; i < 5; i++) seg += c[Math.floor(Math.random() * c.length)];
        parts.push(seg);
    }
    return "ArenaSystem-" + parts.join("-");
}

app.get("/api/apps", requireLogin, (req, res) => {
    const user  = req.user;
    const limit = getRoleLimit(user.role);
    if (!limit.canCreateApps && user.role !== "owner") {
        return res.json({ success: true, apps: [], roleInfo: { ...limit, maxKeys: limit.maxKeys === Infinity ? "Unlimited" : limit.maxKeys }, canCreate: false });
    }
    const all = Array.from(APPS.values());
    const apps = user.role === "owner" ? all : all.filter(a => a.ownerEmail === user.email.toLowerCase());
    res.json({ success: true, apps, roleInfo: { ...limit, maxKeys: limit.maxKeys === Infinity ? "Unlimited" : limit.maxKeys }, canCreate: true });
});

app.post("/api/apps", requireLogin, (req, res) => {
    const user  = req.user;
    const limit = getRoleLimit(user.role);
    if (!limit.canCreateApps) {
        return res.status(403).json({ success: false, error: `Role "${limit.label}" cannot create applications. Upgrade to Elite, Premium or Seller.` });
    }
    const { name, version } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: "App name required" });
    const app2 = {
        id: "app_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        name: name.trim(), ownerId: genOwnerId(), secret: genSecret(),
        version: (version && version.trim()) ? version.trim() : "1.0",
        status: "active", ownerEmail: user.email.toLowerCase(),
        createdAt: new Date().toISOString(), keyCount: 0,
    };
    APPS.set(app2.id, app2);
    saveData();
    res.json({ success: true, app: app2 });
});

app.put("/api/apps/:id/rename", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "Not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: "Name required" });
    a.name = name.trim();
    res.json({ success: true, app: a });
});

app.post("/api/apps/:id/refresh-secret", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "Not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    a.secret = genSecret();
    res.json({ success: true, app: a });
});

app.post("/api/apps/:id/toggle-pause", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "Not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    a.status = a.status === "active" ? "paused" : "active";
    res.json({ success: true, app: a });
});

app.delete("/api/apps/:id", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "Not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    APPS.delete(req.params.id);
    APP_KEYS.delete(req.params.id);
    saveData();
    res.json({ success: true });
});

/* ----------------------------------------- KEYS */
app.get("/api/apps/:id/keys", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "App not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    const keys = APP_KEYS.get(req.params.id) || [];
    res.json({ success: true, keys });
});

app.post("/api/apps/:id/keys/generate", requireLogin, (req, res) => {
    const user  = req.user;
    const limit = getRoleLimit(user.role);
    const a     = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "App not found" });
    if (user.role !== "owner" && a.ownerEmail !== user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    if (!limit.canCreateApps) return res.status(403).json({ success: false, error: `Role "${limit.label}" cannot generate keys.` });

    const { qty = 1, duration = "30 Days", level = "Standard" } = req.body;
    const quantity = Math.max(1, parseInt(qty) || 1);

    if (limit.maxKeys !== Infinity) {
        const used  = USER_KEY_COUNTS.get(user.id) || 0;
        const left  = limit.maxKeys - used;
        if (left <= 0) {
            return res.status(403).json({
                success: false,
                error: `Reached key limit (${limit.maxKeys}). Upgrade role to generate more.`,
                limit: limit.maxKeys, used,
            });
        }
        const toGen = Math.min(quantity, left);
        const keys  = buildKeys(a, toGen, duration, level);
        const arr   = APP_KEYS.get(req.params.id) || []; arr.push(...keys); APP_KEYS.set(req.params.id, arr);
        a.keyCount  = (a.keyCount || 0) + toGen;
        USER_KEY_COUNTS.set(user.id, used + toGen);
        saveData();
        return res.json({ success: true, keys, generated: toGen, requested: quantity, limit: limit.maxKeys, used: used + toGen, remaining: limit.maxKeys - used - toGen });
    }

    const keys = buildKeys(a, quantity, duration, level);
    const arr  = APP_KEYS.get(req.params.id) || []; arr.push(...keys); APP_KEYS.set(req.params.id, arr);
    a.keyCount = (a.keyCount || 0) + quantity;
    saveData();
    res.json({ success: true, keys, generated: quantity, limit: "Unlimited" });
});

function buildKeys(a, qty, duration, level) {
    const today = new Date().toISOString().split("T")[0]; const keys = [];
    for (let i = 0; i < qty; i++) {
        keys.push({ id: `key_${Date.now()}_${i}_${Math.random().toString(36).substr(2,4)}`, key: genKeyStr(), appId: a.id, level, duration, created: today, expires: duration === "Lifetime" ? "Never" : "Calculated", status: "unused", user: null, hwid: null });
    }
    return keys;
}

app.delete("/api/apps/:id/keys/:keyId", requireLogin, (req, res) => {
    const a = APPS.get(req.params.id);
    if (!a) return res.status(404).json({ success: false, error: "App not found" });
    if (req.user.role !== "owner" && a.ownerEmail !== req.user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    const arr = APP_KEYS.get(req.params.id) || [];
    const idx = arr.findIndex(k => k.id === req.params.keyId);
    if (idx === -1) return res.status(404).json({ success: false, error: "Key not found" });
    arr.splice(idx, 1);
    a.keyCount = Math.max(0, (a.keyCount || 1) - 1);
    saveData();
    res.json({ success: true });
});

/* ----------------------------------------- LICENSE API (dashboard sync)
   js/dashboard.js calls /api/v1/licenses*. None of these routes existed, so
   the dashboard logged a 404 on every load and never synced anything. They
   are thin views over the same APPS / APP_KEYS stores used by
   /api/apps/:id/keys, scoped to the apps the caller may see.               */

const LICENSE_STATUSES = ["active", "banned", "used", "unused"];

function appsVisibleTo(user) {
    const all = Array.from(APPS.values());
    return user.role === "owner" ? all : all.filter(a => a.ownerEmail === user.email.toLowerCase());
}
function allKeysFor(user) {
    const owned = new Set(appsVisibleTo(user).map(a => a.id));
    const out = [];
    for (const [appId, arr] of APP_KEYS) {
        if (!owned.has(appId)) continue;
        out.push(...arr);
    }
    return out;
}

app.get("/api/v1/licenses", requireLogin, (req, res) => {
    res.json({ success: true, licenses: allKeysFor(req.user) });
});

app.post("/api/v1/licenses/generate", requireLogin, (req, res) => {
    const user  = req.user;
    const limit = getRoleLimit(user.role);
    const { count = 1, level = "Standard", expires = "30 Days", appId } = req.body || {};

    /* dashboard.js does not send an appId — fall back to the caller's
       first visible app so the "generate" flow has somewhere to land. */
    const target = appId ? APPS.get(appId) : appsVisibleTo(user)[0];
    if (!target) return res.status(400).json({ success: false, error: "No application available — create an application first." });
    if (user.role !== "owner" && target.ownerEmail !== user.email.toLowerCase()) return res.status(403).json({ success: false, error: "Access denied" });
    if (!limit.canCreateApps) return res.status(403).json({ success: false, error: `Role "${limit.label}" cannot generate keys.` });

    const qty     = Math.max(1, Math.min(100, parseInt(count) || 1));
    const created = buildKeys(target, qty, expires, level);
    const arr     = APP_KEYS.get(target.id) || [];
    arr.push(...created);
    APP_KEYS.set(target.id, arr);
    target.keyCount = (target.keyCount || 0) + qty;

    res.json({ success: true, licenses: created, generated: qty });
});

app.post("/api/v1/licenses/:key/status", requireLogin, (req, res) => {
    const status = (req.body || {}).status;
    if (!LICENSE_STATUSES.includes(status)) return res.status(400).json({ success: false, error: "Invalid status" });
    const lic = allKeysFor(req.user).find(k => k.key === req.params.key);
    if (!lic) return res.status(404).json({ success: false, error: "License not found" });
    lic.status = status;
    saveData();
    res.json({ success: true, license: lic });
});

app.delete("/api/v1/licenses/:key", requireLogin, (req, res) => {
    const owned = new Set(appsVisibleTo(req.user).map(a => a.id));
    for (const [appId, arr] of APP_KEYS) {
        if (!owned.has(appId)) continue;
        const idx = arr.findIndex(k => k.key === req.params.key);
        if (idx === -1) continue;
        arr.splice(idx, 1);
        const a = APPS.get(appId);
        if (a) a.keyCount = Math.max(0, (a.keyCount || 1) - 1);
        saveData();
        return res.json({ success: true });
    }
    res.status(404).json({ success: false, error: "License not found" });
});

/* ---------------------------------------------------------------
   KEYAUTH 1.3 COMPATIBILITY LAYER  (/api/1.3/)

   The native client in Auth/ is the official KeyAuth C++ SDK, so it
   speaks the KeyAuth 1.3 wire protocol. Rather than rewrite that client,
   this endpoint translates the protocol onto our own APPS / APP_KEYS
   stores — a key generated in the dashboard is then activated by
   KeyAuth::api::license() with no extra wiring.

   Unlike /api/v1/* this route is PUBLIC: a desktop app has no browser
   session. It is protected instead by
     * app credentials (name + ownerid + secret) required for init()
     * the per-session enckey, which every later call must present
     * a per-IP rate limit on licence activation (brute-force guard)
     * HWID binding on the first successful activation
----------------------------------------------------------------- */

const KA_SESSIONS = new Map();      // sessionid -> session record
const KA_APP_VARS = new Map();      // appId -> Map(varid -> value)
const KA_ACTIVATION_LOG = [];       // newest first, capped

const KA_RATE_WINDOW_MS = 60 * 1000;
const KA_RATE_MAX       = 30;       // activations per IP per minute
const KA_RATE           = new Map();

function kaRateOk(ip) {
    const now = Date.now();
    const rec = KA_RATE.get(ip);
    if (!rec || now > rec.resetAt) {
        KA_RATE.set(ip, { count: 1, resetAt: now + KA_RATE_WINDOW_MS });
        return true;
    }
    rec.count += 1;
    return rec.count <= KA_RATE_MAX;
}

/* Same credentials the dashboard shows for the fallback app, so Header.h and
   the web panel always agree. Seeded on first use so the native client can
   init() before anyone has logged into the panel. */
const KA_DEMO_APP_ID = "app_arenasystem";
function kaEnsureDemoApp() {
    if (APPS.has(KA_DEMO_APP_ID)) return;
    APPS.set(KA_DEMO_APP_ID, {
        id: KA_DEMO_APP_ID, name: "arenasystem",
        ownerId: "LZD7Rnmh6Y",
        secret:  "ed139aad09998d2b1ebf0ced706ddbff7be9802fa489e460d900528eead4b0d8",
        version: "1.0", status: "active", ownerEmail: OWNER_EMAIL,
        createdAt: new Date().toISOString(), keyCount: 0, native: true,
    });
    APP_KEYS.set(KA_DEMO_APP_ID, []);
}
/* Restore persisted apps/keys from disk BEFORE seeding the demo app, so a
   restart keeps every licence that was already generated. */
loadData();

/* Seed at boot, not only on the first init(): otherwise a fresh server has an
   empty APPS map and the dashboard cannot generate keys for the native app
   until some client happens to connect first. */
kaEnsureDemoApp();
saveData();

function kaFindApp(name, ownerid, secret) {
    for (const a of APPS.values()) {
        if ((a.name === name || (name === "arenasystem" && a.name === "arenasystem") || (name === "arenasystem" && a.name === "arenasystem")) && a.ownerId === ownerid && a.secret === secret) return a;
    }
    return null;
}
function kaFindKey(appId, key) {
    return (APP_KEYS.get(appId) || []).find(k => k.key === key) || null;
}
function kaVars(appId) {
    if (!KA_APP_VARS.has(appId)) KA_APP_VARS.set(appId, new Map());
    return KA_APP_VARS.get(appId);
}
/* Accept GET query, POST urlencoded and POST json — the SDK builds a query
   string, the other two keep the door open for non-C++ clients. KeyAuth itself
   carries sessionid / enckey in headers, so those are folded in too (and take
   precedence when present). */
function kaParams(req) {
    const p = Object.assign({}, req.query || {}, req.body || {});
    const hdrSid = req.get("sessionid");
    const hdrKey = req.get("enckey");
    if (hdrSid) p.sessionid = hdrSid;
    if (hdrKey) p.enckey    = hdrKey;
    return p;
}

/* Idle sessions are dropped so numOnlineUsers does not climb forever. */
const KA_SESSION_TTL_MS = 30 * 60 * 1000;
function kaSweep() {
    const now = Date.now();
    for (const [sid, s] of KA_SESSIONS) {
        if (now - s.lastSeen > KA_SESSION_TTL_MS) KA_SESSIONS.delete(sid);
    }
}
function kaOk(extra = {})   { return Object.assign({ success: true }, extra); }
function kaFail(msg, extra) { return Object.assign({ success: false, message: msg }, extra || {}); }
function kaSess(req, q) {
    const s = KA_SESSIONS.get(String(q.sessionid || ""));
    if (!s) return null;
    if (s.appId === undefined) return null;
    s.lastSeen = Date.now();
    return s;
}

app.all(["/api/1.3/", "/api/1.3"], (req, res) => {
    kaSweep();
    const q  = kaParams(req);
    const op = String(q.type || "").toLowerCase();
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || "unknown";

    if (!op) return res.json(kaFail("Missing type"));

    /* ---------------------------------------------------------------- init */
    if (op === "init") {
        kaEnsureDemoApp();
        const { name, ownerid, secret } = q;
        if (!name || !ownerid || !secret) return res.json(kaFail("Missing name / ownerid / secret"));

        const a = kaFindApp(name, ownerid, secret);
        if (!a)          return res.json(kaFail("Invalid application credentials"));
        if (a.status !== "active") return res.json(kaFail("Application is paused"));

        const sessionid = crypto.randomBytes(16).toString("hex");
        const enckey    = crypto.randomBytes(16).toString("hex");
        KA_SESSIONS.set(sessionid, {
            appId: a.id, enckey,
            created: Date.now(), lastSeen: Date.now(),
            user: null, hwid: String(q.hwid || ""),
        });

        const keys      = APP_KEYS.get(a.id) || [];
        const activeCut = Date.now() - 5 * 60 * 1000;
        const online    = Array.from(KA_SESSIONS.values())
            .filter(s => s.appId === a.id && s.lastSeen > activeCut).length;

        return res.json(kaOk({
            sessionid, enckey,
            nonce: Buffer.from(sessionid).toString("base64"),
            response: "Initialized successfully",
            app_data: {
                numUsers:          String(new Set(keys.map(k => k.user).filter(Boolean)).size),
                numOnlineUsers:    String(online),
                numKeys:           String(keys.length),
                version:           a.version,
                customerPanelLink: "http://localhost:" + PORT + "/dashboard.html",
            },
        }));
    }

    /* Everything after init needs a live session AND its enckey — presenting
       a stolen sessionid alone is not enough. */
    const sess = kaSess(req, q);
    if (!sess) return res.json(kaFail("Invalid session — call init() first"));

    const presented = String(req.get("enckey") || q.enckey || "");
    if (presented !== sess.enckey) return res.json(kaFail("Invalid session key"));

    /* -------------------------------------------------------------- license */
    if (op === "license") {
        if (!kaRateOk(ip)) return res.json(kaFail("Too many activation attempts — slow down"));

        const wanted = String(q.key || "").trim();
        if (!wanted) return res.json(kaFail("Key required"));

        const lic = kaFindKey(sess.appId, wanted);
        if (!lic) return res.json(kaFail("Key does not exist"));

        const st = String(lic.status || "unused").toLowerCase();
        if (st === "banned")  return res.json(kaFail("Key has been banned"));
        if (st === "revoked") return res.json(kaFail("Key has been revoked"));
        if (st === "expired") return res.json(kaFail("Key has expired"));
        /* Bot-generated keys carry a real expiresAt (set on first activation
           from durationDays). Enforce it here so /extendkey actually extends. */
        if (lic.expiresAt && Date.now() > new Date(lic.expiresAt).getTime()) {
            lic.status = "expired"; saveData();
            return res.json(kaFail("Key has expired"));
        }

        const hwid = String(q.hwid || "").trim();
        if (lic.hwid && hwid && lic.hwid !== hwid) {
            return res.json(kaFail("Key is already bound to another machine (HWID mismatch)"));
        }
        /* First successful activation binds the key to that machine. */
        if (!lic.hwid && hwid) lic.hwid = hwid;
        if (!lic.user) lic.user = "user_" + Math.random().toString(36).slice(2, 8);
        /* First activation starts the clock for timed keys. */
        if (lic.durationDays != null && !lic.expiresAt) {
            lic.expiresAt = new Date(Date.now() + lic.durationDays * 86400000).toISOString();
        }
        lic.status   = "active";
        lic.lastUsed = new Date().toISOString();
        lic.ip       = lic.ip || ip;
        saveData();

        sess.user = lic.user;
        sess.hwid = lic.hwid;

        KA_ACTIVATION_LOG.unshift({
            ts: lic.lastUsed, ip, key: lic.key, user: lic.user,
            hwid: lic.hwid, app: sess.appId,
        });
        if (KA_ACTIVATION_LOG.length > 200) KA_ACTIVATION_LOG.pop();

        return res.json(kaOk({
            response: "Key activated",
            info: {
                username:  lic.user,
                ip,
                hwid:      lic.hwid || "",
                createdate: lic.created,
                lastlogin:  lic.lastUsed,
                subscriptions: [{
                    subscription: lic.level || "Standard",
                    expiry:       lic.expires || "Never",
                    timeleft:     lic.duration || "Lifetime",
                    key:          lic.key,
                }],
            },
        }));
    }

    /* --------------------------------------------------- session keep-alive */
    if (op === "check" || op === "act") {
        return res.json(kaOk({ sessionid: sess.sessionid || String(q.sessionid), response: "Session alive" }));
    }

    /* --------------------------------------------------------- blacklist */
    if (op === "checkblack") {
        return res.json(kaOk({ response: "Not blacklisted", blacklisted: false }));
    }

    /* --------------------------------------------------------------- log */
    if (op === "log") {
        const msg = String(q.msg || "").slice(0, 500);
        KA_ACTIVATION_LOG.unshift({
            ts: new Date().toISOString(), ip, key: "-", user: sess.user || "-",
            hwid: sess.hwid || "-", app: sess.appId, msg,
        });
        if (KA_ACTIVATION_LOG.length > 200) KA_ACTIVATION_LOG.pop();
        return res.json(kaOk({ response: "Log received" }));
    }

    /* ---------------------------------------------------------- variables */
    if (op === "getvar" || op === "var") {
        const v = kaVars(sess.appId).get(String(q.varid || ""));
        return res.json(kaOk({ response: v === undefined ? "" : v, value: v === undefined ? "" : v }));
    }
    if (op === "setvar") {
        kaVars(sess.appId).set(String(q.var || q.varid || ""), String(q.vardata || ""));
        return res.json(kaOk({ response: "Variable set" }));
    }

    /* ----------------------------------------------------------- stats/who */
    if (op === "fetchstats") {
        const keys = APP_KEYS.get(sess.appId) || [];
        const a    = APPS.get(sess.appId) || {};
        const activeCut = Date.now() - 5 * 60 * 1000;
        return res.json(kaOk({
            response: "Stats",
            app_data: {
                numUsers:       String(new Set(keys.map(k => k.user).filter(Boolean)).size),
                numOnlineUsers: String(Array.from(KA_SESSIONS.values()).filter(s => s.appId === sess.appId && s.lastSeen > activeCut).length),
                numKeys:        String(keys.length),
                version:        a.version || "1.0",
                customerPanelLink: "http://localhost:" + PORT + "/dashboard.html",
            },
        }));
    }
    if (op === "fetchonline") {
        const names = Array.from(KA_SESSIONS.values())
            .filter(s => s.appId === sess.appId && Date.now() - s.lastSeen < 5 * 60 * 1000 && s.user)
            .map(s => s.user);
        return res.json(kaOk({ response: names.join(", ") }));
    }

    /* ---------------------------------------------------------------- ban */
    if (op === "ban") {
        const lic = kaFindKey(sess.appId, String(q.key || ""));
        if (lic) { lic.status = "banned"; saveData(); }
        return res.json(kaOk({ response: "Banned" }));
    }

    /* ---------------------------------------------------------------- misc
       No-ops that still answer "success" so the SDK's remaining methods do
       not throw on an unanswered / unparsed response.                            */
    if (["webhook", "button", "web_login", "upgrade", "forgot", "chatget", "chatsend",
         "changeUsername", "regstr", "login", "download"].includes(op)) {
        return res.json(kaOk({ response: op + " is not supported by this server" }));
    }

    return res.json(kaFail("Unknown type: " + op));
});

/* ----------------------------------------- DISCORD BOT API
   The Auth Bot Zyrex Discord bot is a thin front-end over the SAME key store
   the dashboard and native KeyAuth client use. It authenticates with the
   shared secret (X-Bot-Secret) rather than a passport session, because a bot
   has no browser. server.js stays the single source of truth for keys, so a
   key generated in Discord is immediately activatable by the native client
   and visible in the dashboard — no second database to keep in sync.

   Status vocabulary: the store uses server statuses
     unused | active | banned | revoked | expired
   while the bot speaks
     available | active | banned | expired
   toBotKey() maps between them so both sides stay happy.               */

/* Find a key across every app, returning { app, arr, k }. */
function botFindKey(keyStr) {
    const wanted = String(keyStr || "").trim();
    for (const [appId, arr] of APP_KEYS) {
        const k = arr.find(x => x.key === wanted);
        if (k) return { app: APPS.get(appId), arr, k, appId };
    }
    return null;
}
/* Mark timed keys expired once their real expiresAt has passed. */
function botExpire(k) {
    if (k && !k.expiresAt && k.durationDays != null && k.status === "active") {
        k.expiresAt = new Date(new Date(k.created).getTime() + k.durationDays * 86400000).toISOString();
    }
    if (k && k.expiresAt && Date.now() > new Date(k.expiresAt).getTime() && k.status === "active") {
        k.status = "expired";
    }
    return k;
}
/* server status -> bot status */
const BOT_STATUS = { unused: "available", active: "active", banned: "banned", revoked: "banned", expired: "expired" };
/* bot status  -> server status */
const SRV_STATUS = { available: "unused", active: "active", banned: "banned", expired: "expired" };

function toBotKey(k) {
    botExpire(k);
    const level   = k.level || "Standard";
    const expiry  = k.expiresAt || null;
    return {
        id: k.id, key: k.key, appId: k.appId,
        appName: (APPS.get(k.appId) || {}).name || null,
        status: BOT_STATUS[k.status] || k.status,
        serverStatus: k.status,
        level, duration: k.duration || "Lifetime",
        durationDays: k.durationDays != null ? k.durationDays : null,
        expiry_date: expiry,
        created: k.created || null, lastUsed: k.lastUsed || null,
        hwid: k.hwid || null, ip: k.ip || null, user: k.user || null,
        owner_discord_id: k.ownerDiscordId || null,
        owner_discord_name: k.ownerDiscordName || null,
        client_id: k.clientId || null,
        products: k.products || [],
    };
}

/* --- apps ------------------------------------------------------------- */
/* List apps so the bot can build the /genkey app picker. ownerId + secret
   are included so the native client / Header.h stay in sync. */
app.get("/api/bot/apps", requireBot, (_req, res) => {
    const apps = Array.from(APPS.values()).map(a => ({
        id: a.id, name: a.name, ownerId: a.ownerId, secret: a.secret,
        version: a.version, status: a.status,
        keyCount: (APP_KEYS.get(a.id) || []).length,
        createdAt: a.createdAt || null,
    }));
    res.json({ success: true, apps });
});

/* --- generate --------------------------------------------------------- */
/* durationDays: float days. products/owner/client mirror the bot's fields. */
app.post("/api/bot/keys/generate", requireBot, (req, res) => {
    const b = req.body || {};
    const a = APPS.get(String(b.appId || ""));
    if (!a) return res.status(404).json({ success: false, error: "App not found" });

    const qty = Math.max(1, Math.min(200, parseInt(b.count, 10) || 1));
    const durationDays = (b.durationDays == null || b.durationDays === "") ? null : Number(b.durationDays);
    const level   = String(b.level || "Standard");
    const products = Array.isArray(b.products) ? b.products.slice(0, 12) : [];
    const ownerDiscordId   = b.ownerDiscordId   != null ? String(b.ownerDiscordId)   : null;
    const ownerDiscordName = b.ownerDiscordName != null ? String(b.ownerDiscordName) : null;
    const clientId = b.clientId != null ? String(b.clientId).slice(0, 128) : null;

    /* duration label the native client shows as timeleft */
    const durationLabel = durationDays == null ? "Lifetime"
        : (durationDays >= 1 ? `${Math.round(durationDays)} Days` : `${Math.round(durationDays * 24)} Hours`);

    const created = [];
    for (let i = 0; i < qty; i++) {
        const k = {
            id: `key_${Date.now()}_${i}_${Math.random().toString(36).substr(2,4)}`,
            key: genKeyStr(), appId: a.id, level, duration: durationLabel,
            durationDays, expiresAt: null,
            created: new Date().toISOString(), lastUsed: null,
            status: "unused", user: null, hwid: null, ip: null,
            ownerDiscordId, ownerDiscordName, clientId, products,
        };
        created.push(k);
    }
    const arr = APP_KEYS.get(a.id) || []; arr.push(...created); APP_KEYS.set(a.id, arr);
    a.keyCount = (a.keyCount || 0) + qty;
    saveData();
    res.json({ success: true, generated: qty, keys: created.map(toBotKey) });
});

/* --- list / info ------------------------------------------------------ */
/* GET /api/bot/keys?status=&appId=&clientId=&discordId= */
app.get("/api/bot/keys", requireBot, (req, res) => {
    const q = req.query || {};
    let out = [];
    for (const [appId, arr] of APP_KEYS) {
        if (q.appId && appId !== q.appId) continue;
        for (const k of arr) {
            botExpire(k);
            if (q.status) {
                const want = String(q.status).toLowerCase();
                if ((BOT_STATUS[k.status] || k.status) !== want) continue;
            }
            if (q.clientId && (k.clientId || "") !== q.clientId) continue;
            if (q.discordId && String(k.ownerDiscordId || "") !== q.discordId) continue;
            out.push(toBotKey(k));
        }
    }
    out.sort((x, y) => (x.id > y.id ? 1 : -1));
    res.json({ success: true, keys: out, total: out.length });
});

app.get("/api/bot/keys/:key", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    res.json({ success: true, key: toBotKey(f.k) });
});

/* --- mutate ----------------------------------------------------------- */
app.delete("/api/bot/keys/:key", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const idx = f.arr.indexOf(f.k);
    f.arr.splice(idx, 1);
    if (f.app) f.app.keyCount = Math.max(0, (f.app.keyCount || 1) - 1);
    saveData();
    res.json({ success: true });
});

/* ban / unban / status — accepts bot or server status words */
app.post("/api/bot/keys/:key/status", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const raw = String((req.body || {}).status || "").toLowerCase();
    const srv = SRV_STATUS[raw] || raw;
    if (!["unused", "active", "banned", "revoked", "expired"].includes(srv)) {
        return res.status(400).json({ success: false, error: "Invalid status" });
    }
    if (srv === "banned") f.k.preBanStatus = f.k.status;
    f.k.status = srv;
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

app.post("/api/bot/keys/:key/reset-hwid", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    f.k.hwid = null; saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

app.post("/api/bot/keys/:key/reset-ip", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    f.k.ip = null; saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* Bind HWID/IP and start the clock — mirrors the native KeyAuth activation
   for the bot's own /auth/activate REST surface. */
app.post("/api/bot/keys/:key/activate", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const b = req.body || {};
    if (f.k.status === "banned")  return res.status(400).json({ success: false, error: "Key has been banned" });
    if (f.k.status === "expired") return res.status(400).json({ success: false, error: "Key has expired" });
    if (b.hwid) f.k.hwid = String(b.hwid);
    if (b.ip)   f.k.ip   = String(b.ip);
    if (f.k.durationDays != null && !f.k.expiresAt) {
        f.k.expiresAt = new Date(Date.now() + f.k.durationDays * 86400000).toISOString();
    }
    f.k.status = "active";
    f.k.lastUsed = new Date().toISOString();
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* Bind HWID/IP on an already-active key (used by /auth/login after a reset).
   Does NOT change status or the expiry clock — only the machine binding. */
app.post("/api/bot/keys/:key/bind", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const b = req.body || {};
    if (b.hwid != null) f.k.hwid = String(b.hwid);
    if (b.ip   != null) f.k.ip   = String(b.ip);
    f.k.lastUsed = new Date().toISOString();
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* extend — extraDays float. Bumps expiresAt (active) or durationDays (idle). */
app.post("/api/bot/keys/:key/extend", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    if (f.k.status === "banned") return res.status(400).json({ success: false, error: "Key is banned — unban first" });
    const extra = Number((req.body || {}).extraDays);
    if (!isFinite(extra)) return res.status(400).json({ success: false, error: "extraDays required" });
    botExpire(f.k);
    if (f.k.status === "active" && f.k.expiresAt) {
        f.k.expiresAt = new Date(new Date(f.k.expiresAt).getTime() + extra * 86400000).toISOString();
        if (f.k.status === "expired") f.k.status = "active";
    } else {
        f.k.durationDays = (f.k.durationDays || 0) + extra;
        f.k.duration = f.k.durationDays >= 1 ? `${Math.round(f.k.durationDays)} Days` : `${Math.round(f.k.durationDays * 24)} Hours`;
    }
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* Discord owner link */
app.post("/api/bot/keys/:key/owner", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const b = req.body || {};
    f.k.ownerDiscordId   = b.discordId != null ? String(b.discordId) : null;
    f.k.ownerDiscordName = b.discordName != null ? String(b.discordName).slice(0, 80) : null;
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* buyer client_id */
app.post("/api/bot/keys/:key/client", requireBot, (req, res) => {
    const f = botFindKey(req.params.key);
    if (!f) return res.status(404).json({ success: false, error: "Key not found" });
    const v = (req.body || {}).clientId;
    f.k.clientId = v != null ? String(v).slice(0, 128) : null;
    saveData();
    res.json({ success: true, key: toBotKey(f.k) });
});

/* --- stats / bulk ----------------------------------------------------- */
app.get("/api/bot/stats", requireBot, (_req, res) => {
    const now = Date.now();
    let total = 0, available = 0, active = 0, expired = 0, banned = 0;
    for (const arr of APP_KEYS.values()) {
        for (const k of arr) {
            botExpire(k);
            total++;
            const s = BOT_STATUS[k.status] || k.status;
            if (s === "available") available++;
            else if (s === "active") active++;
            else if (s === "expired") expired++;
            else if (s === "banned") banned++;
        }
    }
    saveData();
    res.json({ success: true, stats: { total, available, active, expired, banned, apps: APPS.size, now } });
});

/* Delete keys. mode: "expired" (expired + unused/available) or "all". */
app.post("/api/bot/keys/purge", requireBot, (req, res) => {
    const mode = String((req.body || {}).mode || "expired").toLowerCase();
    let removed = 0;
    for (const [appId, arr] of APP_KEYS) {
        const keep = [];
        for (const k of arr) {
            botExpire(k);
            const s = BOT_STATUS[k.status] || k.status;
            const hit = mode === "all" ? true : (s === "expired" || s === "available");
            if (hit) removed++; else keep.push(k);
        }
        APP_KEYS.set(appId, keep);
        const a = APPS.get(appId); if (a) a.keyCount = keep.length;
    }
    saveData();
    res.json({ success: true, removed });
});

/* Activation feed for the dashboard (login-protected, unlike /api/1.3/). */
app.get("/api/native/activations", requireLogin, (_req, res) => {
    res.json({ success: true, activations: KA_ACTIVATION_LOG.slice(0, 100), sessions: KA_SESSIONS.size });
});

/* ----------------------------------------- USERS (owner only) */
app.get("/api/users", requireOwner, (req, res) => {
    res.json({ users: Array.from(GOOGLE_USERS.values()) });
});

app.post("/api/users/:id/role", requireOwner, (req, res) => {
    const user = findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { role } = req.body;
    if (!Object.keys(ROLE_LIMITS).includes(role)) return res.status(400).json({ error: "Invalid role" });
    user.role = role;
    res.json({ success: true, user });
});

app.delete("/api/users/:id", requireOwner, (req, res) => {
    if (!GOOGLE_USERS.has(req.params.id)) return res.status(404).json({ error: "User not found" });
    GOOGLE_USERS.delete(req.params.id);
    res.json({ success: true });
});

/* ----------------------------------------- ROLES & USAGE */
app.get("/api/roles", (_req, res) => {
    const roles = Object.entries(ROLE_LIMITS).map(([key, val]) => ({
        key, ...val, maxKeys: val.maxKeys === Infinity ? "Unlimited" : val.maxKeys,
    }));
    res.json({ roles });
});

app.get("/api/key-usage", requireLogin, (req, res) => {
    const user  = req.user;
    const limit = getRoleLimit(user.role);
    const used  = USER_KEY_COUNTS.get(user.id) || 0;
    res.json({
        role: user.role,
        roleInfo: { ...limit, maxKeys: limit.maxKeys === Infinity ? "Unlimited" : limit.maxKeys },
        used,
        remaining: limit.maxKeys === Infinity ? "Unlimited" : Math.max(0, limit.maxKeys - used),
        limit:     limit.maxKeys === Infinity ? "Unlimited" : limit.maxKeys,
    });
});

/* ----------------------------------------- PAGES */
app.get(["/" , "/home"], (_req, res) => res.sendFile(path.join(ROOT, "index.html")));
app.get("/login",         (req, res) => { if (req.isAuthenticated()) return res.redirect("/dashboard"); res.sendFile(path.join(ROOT, "login.html")); });
app.get(["/register", "/signup"], (req, res) => res.redirect("/login"));
app.get(["/dashboard", "/dash"], requireLogin, (_req, res) => res.sendFile(path.join(ROOT, "dashboard.html")));

/* ----------------------------------------- 404 */
app.use((req, res) => {
    const t = path.join(ROOT, req.path + ".html");
    if (fs.existsSync(t)) return res.sendFile(t);
    res.status(404).send(`<!DOCTYPE html><html><head><title>404</title><style>body{background:#09090e;color:#f5f5ff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}.c{color:#f97316;font-size:4rem;font-weight:900}a{color:#f97316}</style></head><body><div><div class="c">404</div><p>"${req.path}" not found</p><a href="/">← Home</a></div></body></html>`);
});

/* ----------------------------------------- START */
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`\n  ARENA SYSTEM AUTH v4.0 — http://localhost:${PORT}`);
        console.log(`  Google OAuth: ${hasGoogleCreds ? "CONFIGURED ✅" : "NOT configured ⚠️  (use /auth/google/dev-mock)"}`);
        console.log(`  Roles: user(0 keys) | elite(50) | premium(200) | seller(unlimited) | owner(full)\n`);
    });
}

module.exports = app;

