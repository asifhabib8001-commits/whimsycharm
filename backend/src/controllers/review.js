const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const log = require('../utils/logActivity');

const recalc = async (pid) => {
  const [r] = await Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(pid), status: 'approved' } }, { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  await Product.updateOne({ _id: pid }, { ratingAvg: r ? Math.round(r.avg * 10) / 10 : 0, ratingCount: r ? r.n : 0 });
};

exports.create = ah(async (req, res) => {
  const { productId, rating, comment, photos = [] } = req.body;
  if (!(await Product.exists({ _id: productId }))) throw httpError('Product not found', 404);
  if (await Review.exists({ product: productId, user: req.user._id })) throw httpError('You have already reviewed this product', 409);
  const verifiedBuyer = !!(await Order.exists({ user: req.user._id, status: 'Delivered', 'items.product': productId }));
  const r = await Review.create({
    product: productId, user: req.user._id, name: req.user.name, rating, comment: String(comment || '').slice(0, 1000), verifiedBuyer,
    photos: photos.slice(0, 4).map((p) => ({ url: p.url, publicId: p.publicId })),
  });
  res.status(201).json({ review: r, message: 'Thank you! Your review will appear after approval.' });
});
exports.forProduct = ah(async (req, res) => res.json(await Review.find({ product: req.params.id, status: 'approved' }).sort('-createdAt').select('-user')));
exports.listApproved = ah(async (_q, res) => res.json(await Review.find({ status: 'approved' }).sort('-createdAt').limit(60).populate('product', 'name slug').select('-user')));

exports.adminList = ah(async (req, res) => res.json(await Review.find(req.query.status ? { status: req.query.status } : {}).sort('-createdAt').populate('product', 'name')));
exports.setStatus = ah(async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) throw httpError('Invalid status');
  const r = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!r) throw httpError('Review not found', 404);
  await recalc(r.product); await log(req.user, `Review ${status}`, r._id); res.json(r);
});
exports.remove = ah(async (req, res) => {
  const r = await Review.findByIdAndDelete(req.params.id);
  if (r) await recalc(r.product);
  res.json({ message: 'Deleted' });
});
