const crypto = require('crypto');
const Order = require('../models/Order');
const razorpay = require('../config/razorpay');
const finalizeOrder = require('../utils/finalizeOrder');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const hmac = (key, data) => crypto.createHmac('sha256', key).update(data).digest('hex');
const eq = (a, b) => { const x = Buffer.from(String(a || '')), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); };

async function markPaid(razorpayOrderId, paymentId, userId) {
  const o = await Order.findOne({ razorpayOrderId });
  if (!o || (userId && String(o.user) !== String(userId))) return null;
  if (o.paymentStatus !== 'Paid' && o.status !== 'Cancelled') {
    o.paymentStatus = 'Paid'; o.razorpayPaymentId = paymentId; o.paidAt = new Date(); await o.save();
  }
  return finalizeOrder(o);
}

exports.verify = ah(async (req, res) => {
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = req.body;
  if (!oid || !pid || !eq(hmac(process.env.RAZORPAY_KEY_SECRET, `${oid}|${pid}`), sig)) throw httpError('Payment verification failed');
  const o = await markPaid(oid, pid, req.user._id);
  if (!o) throw httpError('Order not found', 404);
  res.json({ message: 'Payment successful', order: o });
});

exports.webhook = ah(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !req.rawBody) return res.status(400).end();
  if (!eq(hmac(secret, req.rawBody), req.headers['x-razorpay-signature'])) return res.status(400).json({ message: 'Invalid signature' });
  const ev = req.body.event, pay = req.body.payload?.payment?.entity;
  const oid = pay?.order_id || req.body.payload?.order?.entity?.id;
  if (oid && (ev === 'payment.captured' || ev === 'order.paid')) await markPaid(oid, pay?.id);
  else if (oid && ev === 'payment.failed') await Order.updateOne({ razorpayOrderId: oid, paymentStatus: 'Pending' }, { paymentStatus: 'Failed' });
  res.json({ received: true });
});

// Payment fail/cancel hone par dobara try
exports.retry = ah(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.orderId, user: req.user._id, paymentMethod: 'Online' });
  if (!o || o.paymentStatus === 'Paid' || o.status === 'Cancelled') throw httpError('Order cannot be paid', 400);
  const rz = await razorpay().orders.create({ amount: Math.round(o.total * 100), currency: 'INR', receipt: o.orderNo });
  o.razorpayOrderId = rz.id; o.paymentStatus = 'Pending'; await o.save();
  res.json({ order: o, razorpay: { key: process.env.RAZORPAY_KEY_ID, orderId: rz.id, amount: rz.amount, currency: 'INR' } });
});
