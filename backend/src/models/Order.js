const m = require('mongoose');
const num = { type: Number, default: 0 };
const s = new m.Schema({
  orderNo: { type: String, unique: true },
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ product: { type: m.Schema.Types.ObjectId, ref: 'Product' }, name: String, image: String, price: Number, qty: Number, madeToOrderDays: Number, customization: [{ label: String, value: String }] }],
  address: { name: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String },
  subtotal: num, shipping: num, codCharge: num, giftWrapCharge: num, discount: num, total: num,
  couponCode: String,
  gift: { wrap: Boolean, message: String },
  note: String,
  paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refund Pending', 'Refunded'], default: 'Pending' },
  razorpayOrderId: String, razorpayPaymentId: String, paidAt: Date,
  status: { type: String, enum: ['Placed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  statusHistory: [{ status: String, note: String, at: { type: Date, default: Date.now } }],
  trackingId: String,
  finalized: { type: Boolean, default: false },
  invoiceNo: String,
}, { timestamps: true });
s.index({ razorpayOrderId: 1 });
module.exports = m.model('Order', s);
