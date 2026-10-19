# WhimsyCharm — Full Project

## QUICK PREVIEW (no setup, no backend)
Open `index.html` (this folder's root) -> "Open the Website" / "Open the Owner Panel".
The project starts in DEMO MODE: sample categories (Resin Art, Pipe Cleaner Flowers, Clay Creations, Concrete Decor),
12 sample products, cart, checkout, orders, reviews, owner panel - all working inside your browser.
Owner demo login: username `whimsycharm`, password `demo123`.
Demo data lives only in your browser. For best results open it through a local/static host (e.g. `npx serve .` in this folder, or drag the whole folder to Netlify Drop) so Website and Owner Panel share the same demo data.

## GOING LIVE (real backend)
Demo mode switches OFF automatically when you set `API_URL`:
 - frontend/js/config.js  -> API_URL: 'https://YOUR-BACKEND.vercel.app/api', OWNER_URL: 'https://YOUR-OWNER.vercel.app'
 - owner/js/config.js     -> API_URL: (same backend URL), SITE_URL: 'https://YOUR-WEBSITE.vercel.app'
The real backend creates the 4 default categories and the owner account (OWNER_USERNAME / OWNER_PASSWORD from .env) on first start.


whimsycharm/
  backend/   Node + Express API   -> Vercel project 1
  frontend/  Customer website     -> Vercel project 2
  owner/     Owner (admin) panel  -> Vercel project 3

## 1. Local chalana
Backend:  cd backend && cp .env.example .env  (keys bharo) && npm install && npm run dev
Frontend: frontend/ folder ko Live Server / `npx serve frontend -l 5500` se kholo
Owner:    `npx serve owner -l 5501`
frontend/js/config.js aur owner/js/config.js me API_URL set hai (default http://localhost:5000/api).

## 2. Accounts / keys (.env + Vercel Environment Variables)
MongoDB Atlas (MONGODB_URI) | Cloudinary (3 keys) | Razorpay test keys | Gmail App Password (SMTP_USER/SMTP_PASS)
JWT_SECRET = koi bhi lamba random text | OWNER_PASSWORD = owner khud set karega (pehli baar server chalne par account ban jata hai)
Secret keys kabhi chat ya group me share mat karna.

## 3. Vercel deploy (ek hi GitHub repo, 3 projects)
Har project me "Root Directory" = backend / frontend / owner.
1) backend deploy karo -> URL milega (jaise https://whimsy-api.vercel.app). Env vars daalo, FRONTEND_URL aur OWNER_URL bhi.
2) frontend/js/config.js: API_URL = backend URL + /api, OWNER_URL = owner site URL.  owner/js/config.js: API_URL, SITE_URL.
3) frontend aur owner deploy karo.
4) Razorpay Dashboard -> Webhooks: URL = <backend URL>/api/payment/webhook, events: payment.captured, order.paid, payment.failed.
   Secret ko RAZORPAY_WEBHOOK_SECRET me daalo. Live ke liye KYC chahiye.

## 4. Owner login
Website footer -> Settings -> username `whimsycharm` + password. Ya seedha owner panel URL kholo.
Owner panel se sab badal sakte ho: products, categories, photos/videos, logo, contact, About, policies, FAQ, coupons, shipping, pincode, popup, SEO, GST/invoice, chatbot.

## 5. Pehli baar ye karo
Owner panel -> Categories (Resin, Pipe Cleaner Flowers, Clay, Concrete) -> Products -> Site Settings (hero, logo, address) -> Delivery (shipping charge).
Pehle Razorpay TEST mode me poora order flow check karo.
