const User = require('../models/User');
const Product = require('../models/Product');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const FIELDS = 'name slug price images stock madeToOrderDays active customizationOptions';
const same = (a, b) => JSON.stringify(a || []) === JSON.stringify(b || []);

const sendCart = async (req, res) => {
  const u = await User.findById(req.user._id).populate('cart.product', FIELDS);
  res.json(u.cart.filter((i) => i.product && i.product.active));
};
exports.getCart = ah(sendCart);
exports.add = ah(async (req, res) => {
  const { productId, qty = 1, customization = [] } = req.body;
  const p = await Product.findOne({ _id: productId, active: true });
  if (!p) throw httpError('Product not found', 404);
  const q = Math.max(1, parseInt(qty) || 1);
  const cz = customization.filter((x) => x && x.label && x.value).map((x) => ({ label: x.label, value: x.value }));
  const item = req.user.cart.find((i) => String(i.product) === String(p._id) && same(i.customization.map((c) => ({ label: c.label, value: c.value })), cz));
  if (item) item.qty += q; else req.user.cart.push({ product: p._id, qty: q, customization: cz });
  await req.user.save(); await sendCart(req, res);
});
exports.update = ah(async (req, res) => {
  const item = req.user.cart.id(req.params.itemId);
  if (!item) throw httpError('Item not found', 404);
  item.qty = Math.max(1, parseInt(req.body.qty) || 1);
  await req.user.save(); await sendCart(req, res);
});
exports.remove = ah(async (req, res) => { req.user.cart.pull({ _id: req.params.itemId }); await req.user.save(); await sendCart(req, res); });
exports.clear = ah(async (req, res) => { req.user.cart = []; await req.user.save(); res.json([]); });

exports.getWishlist = ah(async (req, res) => {
  const u = await User.findById(req.user._id).populate({ path: 'wishlist', match: { active: true }, select: FIELDS });
  res.json(u.wishlist);
});
exports.toggleWishlist = ah(async (req, res) => {
  const id = String(req.params.productId);
  const has = req.user.wishlist.some((w) => String(w) === id);
  if (has) req.user.wishlist.pull(id);
  else { if (!(await Product.exists({ _id: id }))) throw httpError('Product not found', 404); req.user.wishlist.push(id); }
  await req.user.save();
  res.json({ wishlisted: !has, wishlist: req.user.wishlist });
});
