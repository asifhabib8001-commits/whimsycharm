const Order = require('../models/Order');
const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const { buildPricing } = require('../utils/pricing');
const finalizeOrder = require('../utils/finalizeOrder');
const invoicePdf = require('../utils/invoicePdf');
const sendEmail = require('../utils/sendEmail');
const log = require('../utils/logActivity');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const STATUSES = ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
const PAY = ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'];
const orderNo = () => 'WC' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();

exports.quote = ah(async (req, res) => { const { coupon, ...r } = await buildPricing(req.body); res.json(r); });

exports.create = ah(async (req, res) => {
  const { address: a = {}, paymentMethod, gift = {}, note } = req.body;
  if (!['COD', 'Online'].includes(paymentMethod)) throw httpError('Choose a payment method');
  for (const k of ['name', 'phone', 'line1', 'city', 'pincode']) if (!a[k]) throw httpError(`Address: ${k} is required`);
  if (!req.user.emailVerified) throw httpError('Please verify your email before placing an order', 403);
  const p = await buildPricing({ ...req.body, paymentMethod, pincode: a.pincode, giftWrap: gift.wrap, requirePin: true });
  const order = await Order.create({
    orderNo: orderNo(), user: req.user._id, items: p.lines,
    address: { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode },
    subtotal: p.subtotal, shipping: p.shipping, codCharge: p.codCharge, giftWrapCharge: p.giftWrapCharge, discount: p.discount, total: p.total,
    couponCode: p.couponCode, gift: { wrap: !!gift.wrap, message: String(gift.message || '').slice(0, 300) }, note: String(note || '').slice(0, 500),
    paymentMethod, statusHistory: [{ status: 'Placed' }],
  });
  if (paymentMethod === 'COD') { const o = await finalizeOrder(order); return res.status(201).json({ order: o }); }
  const rz = await razorpay().orders.create({ amount: Math.round(p.total * 100), currency: 'INR', receipt: order.orderNo });
  order.razorpayOrderId = rz.id; await order.save();
  res.status(201).json({ order, razorpay: { key: process.env.RAZORPAY_KEY_ID, orderId: rz.id, amount: rz.amount, currency: 'INR' } });
});

exports.myOrders = ah(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));

const loadOwn = async (req) => {
  const o = await Order.findById(req.params.id);
  if (!o || (req.user.role !== 'owner' && String(o.user) !== String(req.user._id))) throw httpError('Order not found', 404);
  return o;
};
exports.getOne = ah(async (req, res) => res.json(await loadOwn(req)));

exports.cancel = ah(async (req, res) => {
  const o = await loadOwn(req);
  if (!['Placed', 'Packed'].includes(o.status)) throw httpError('This order can no longer be cancelled. Please raise a return request after delivery.');
  o.status = 'Cancelled'; o.statusHistory.push({ status: 'Cancelled', note: String(req.body.reason || '').slice(0, 200) });
  if (o.paymentStatus === 'Paid') o.paymentStatus = 'Refund Pending';
  await o.save();
  if (o.finalized) await Promise.all(o.items.filter((i) => !i.madeToOrderDays).map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  const s = await SiteSettings.get();
  await sendEmail({ to: s.email, subject: `Order ${o.orderNo} cancelled`, html: `<p>Customer cancelled order ${o.orderNo}.${o.paymentStatus === 'Refund Pending' ? ' <b>Refund pending.</b>' : ''}</p>` });
  res.json(o);
});

exports.invoice = ah(async (req, res) => {
  const o = await loadOwn(req);
  if (!o.finalized) throw httpError('Invoice available after order confirmation');
  const buf = await invoicePdf(o, await SiteSettings.get());
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${o.invoiceNo}.pdf"` }).send(buf);
});

// ---- Owner ----
exports.adminList = ah(async (req, res) => {
  const { status, q, all, page = 1, limit = 30 } = req.query;
  const f = {};
  if (status) f.status = status;
  if (q) f.orderNo = new RegExp(String(q).replace(/[^\w]/g, ''), 'i');
  if (!all) f.finalized = true; // payment adhura wale online orders chhupe rehte hain
  const [items, total] = await Promise.all([Order.find(f).sort('-createdAt').skip((page - 1) * limit).limit(+limit).populate('user', 'name email phone'), Order.countDocuments(f)]);
  res.json({ items, total, pages: Math.ceil(total / limit) });
});

exports.adminUpdateStatus = ah(async (req, res) => {
  const { status, paymentStatus, trackingId, note } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) throw httpError('Order not found', 404);
  if (status) {
    if (!STATUSES.includes(status)) throw httpError('Invalid status');
    if (status !== o.status) { o.status = status; o.statusHistory.push({ status, note }); }
    if (status === 'Delivered' && o.paymentMethod === 'COD') o.paymentStatus = 'Paid';
  }
  if (paymentStatus) { if (!PAY.includes(paymentStatus)) throw httpError('Invalid payment status'); o.paymentStatus = paymentStatus; }
  if (trackingId !== undefined) o.trackingId = trackingId;
  await o.save();
  await log(req.user, 'Order update', `${o.orderNo}: ${status || paymentStatus || ''}`);
  const u = await User.findById(o.user);
  const msg = `Your order ${o.orderNo} is now ${o.status}.`;
  if (status) await sendEmail({ to: u?.email, subject: `Order ${o.orderNo}: ${o.status}`, title: 'Order update', html: `<p>${msg}</p>${o.trackingId ? `<p>Tracking ID: <b>${o.trackingId}</b></p>` : ''}` });
  // Owner is link se customer ko WhatsApp par ek click me update bhej sakta hai
  const waLink = `https://wa.me/91${String(o.address.phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('WhimsyCharm: ' + msg)}`;
  res.json({ order: o, waLink });
});
