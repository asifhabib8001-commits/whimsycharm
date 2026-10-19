require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimit');
const errorHandler = require('./middleware/errorHandler');
const seedOwner = require('./utils/seedOwner');

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
const origins = [process.env.FRONTEND_URL, process.env.OWNER_URL, 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5173'].filter(Boolean);
app.use(cors({ origin: (o, cb) => cb(null, !o || origins.includes(o)), credentials: true }));
// rawBody chahiye Razorpay webhook signature verify karne ke liye
app.use(express.json({ limit: '2mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.use(async (req, res, next) => {
  try { await connectDB(); await seedOwner(); next(); } catch (e) { next(e); }
});

app.get('/', (_q, r) => r.json({ ok: true, name: 'WhimsyCharm API' }));
app.use('/api', apiLimiter);

[
  ['auth', 'auth'], ['categories', 'category'], ['products', 'product'], ['cart', 'cart'],
  ['orders', 'order'], ['payment', 'payment'], ['reviews', 'review'], ['coupons', 'coupon'],
  ['custom-orders', 'customOrder'], ['bulk', 'bulk'], ['returns', 'returnRequest'], ['faqs', 'faq'],
  ['gallery', 'gallery'], ['delivery', 'delivery'], ['settings', 'settings'], ['upload', 'upload'],
  ['dashboard', 'dashboard'], ['newsletter', 'newsletter'], ['chatbot', 'chatbot'], ['seo', 'seo'],
].forEach(([path, file]) => app.use(`/api/${path}`, require(`./routes/${file}`)));

app.get('/sitemap.xml', require('./controllers/seo').sitemap);
app.use((_q, r) => r.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

module.exports = app;
