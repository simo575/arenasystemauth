# 🚀 نشر Arena System على Vercel

هاد المجلد فيه كاع الملفات اللي كايحتاجها الموقع فقط (بلا بوت وبلا C++ files وبلا node_modules).

---

## 📌 الطريقة 1: عبر Vercel CLI (الأسرع والأسهل)

1. فتح الترمينال (CMD) فهاد المجلد:
   ```cmd
   cd "C:\Users\Administrator\Desktop\ArenaSystem-Vercel"
   ```

2. كتب الأمر:
   ```cmd
   npx vercel
   ```
   - إلا كنتي ما مسجلش الدخول فـ Vercel، غايعطيك رابط دير بيه Login.
   - جاوب بـ **Enter** (Yes) على الأسئلة كاملة.

3. من بعد غايعطيك الرابط المباشر للموقع ديالك (مثال: `https://arena-system-xxxx.vercel.app`).

4. للنشر النهائي (Production):
   ```cmd
   npx vercel --prod
   ```

---

## 📌 الطريقة 2: عبر موقع Vercel + GitHub

1. دير Create Repo جديد فـ GitHub ورفع فيه الملفات اللي فهاد المجلد.
2. دخل لـ [vercel.com/new](https://vercel.com/new).
3. اختار الـ Repository واضغط **Deploy**.
4. فـ **Environment Variables** (إلا بغيتي تزيدهم):
   - `SESSION_SECRET` = أي كود طويل
   - `OWNER_EMAIL` = الإيميل ديالك
   - `BOT_API_SECRET` = السيكريت ديال البوت
   - `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` (إلا درتي Google OAuth)
