const Product = require('../models/Product');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const log = require('../utils/logActivity');
const isId = (s) => /^[a-f\d]{24}$/i.test(String(s));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sorts = { price_asc: { price: 1 }, price_desc: { price: -1 }, new: { createdAt: -1 }, rating: { ratingAvg: -1 } };

exports.list = ah(async (req, res) => {
  const { category, q, minPrice, maxPrice, material, sort, featured, ids, page = 1, limit = 24 } = req.query;
  const f = { active: true };
  if (category) { const cat = await Category.findOne(isId(category) ? { _id: category } : { slug: category }); f.category = cat ? cat._id : null; }
  if (q) { const rx = new RegExp(esc(q), 'i'); f.$or = [{ name: rx }, { tags: rx }, { material: rx }, { description: rx }]; }
  if (minPrice || maxPrice) f.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  if (material) f.material = new RegExp(esc(material), 'i');
  if (featured) f.featured = true;
  if (ids) f._id = { $in: String(ids).split(',').filter(isId) };
  const [items, total] = await Promise.all([
    Product.find(f).populate('category', 'name slug').sort(sorts[sort] || { createdAt: -1 }).skip((page - 1) * limit).limit(Math.min(+limit, 60)),
    Product.countDocuments(f),
  ]);
  res.json({ items, total, page: +page, pages: Math.ceil(total / limit) });
});

const find = (key) => Product.findOne({ active: true, ...(isId(key) ? { _id: key } : { slug: key }) }).populate('category', 'name slug');
exports.get = ah(async (req, res) => { const p = await find(req.params.idOrSlug); if (!p) throw httpError('Product not found', 404); res.json(p); });
exports.related = ah(async (req, res) => {
  const p = await find(req.params.idOrSlug);
  if (!p) throw httpError('Product not found', 404);
  res.json(await Product.find({ active: true, category: p.category._id, _id: { $ne: p._id } }).limit(8));
});

exports.adminList = ah(async (req, res) => {
  const f = req.query.q ? { name: new RegExp(esc(req.query.q), 'i') } : {};
  res.json(await Product.find(f).populate('category', 'name').sort('-createdAt'));
});
exports.create = ah(async (req, res) => { const p = await Product.create(req.body); await log(req.user, 'Added product', p.name); res.status(201).json(p); });
exports.update = ah(async (req, res) => {
  const { slug, ...body } = req.body;
  const p = await Product.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!p) throw httpError('Product not found', 404);
  await log(req.user, 'Updated product', p.name); res.json(p);
});
exports.remove = ah(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw httpError('Product not found', 404);
  await Promise.all(p.images.filter((i) => i.publicId).map((i) => cloudinary.uploader.destroy(i.publicId).catch(() => {})));
  if (p.video?.publicId) await cloudinary.uploader.destroy(p.video.publicId, { resource_type: 'video' }).catch(() => {});
  await log(req.user, 'Deleted product', p.name); res.json({ message: 'Deleted' });
});
