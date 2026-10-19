const SiteSettings = require('../models/SiteSettings');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ah = require('../utils/asyncHandler');
exports.page = ah(async (req, res) => {
  const s = await SiteSettings.get();
  const d = (s.seo || {})[req.params.page] || {};
  res.json({ title: d.title || `${s.businessName} - ${s.tagline}`, description: d.description || s.tagline, keywords: d.keywords || '' });
});
exports.sitemap = ah(async (_q, res) => {
  const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
  const [cats, prods] = await Promise.all([Category.find({ active: true }).select('slug'), Product.find({ active: true }).select('slug updatedAt')]);
  const urls = ['', '/contact.html', '/reviews.html', '/gallery.html', '/about.html', '/faq.html', '/custom-order.html', '/bulk-enquiry.html']
    .map((p) => `<url><loc>${base}${p || '/'}</loc></url>`)
    .concat(cats.map((c) => `<url><loc>${base}/category.html?c=${c.slug}</loc></url>`))
    .concat(prods.map((p) => `<url><loc>${base}/product.html?p=${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod></url>`));
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
});
