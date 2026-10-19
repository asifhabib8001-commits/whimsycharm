// Order confirm hone par ek hi baar chalta hai (COD: turant, Online: payment verify ke baad)
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const SiteSettings = require('../models/SiteSettings');
const sendEmail = require('./sendEmail');
module.exports = async (order) => {
  const o = await Order.findOneAndUpdate({ _id: order._id, finalized: false }, { $set: { finalized: true, invoiceNo: 'INV-' + order.orderNo } }, { new: true });
  if (!o) return order; // already finalized
  await Promise.all(o.items.filter((i) => !i.madeToOrderDays).map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } })));
  if (o.couponCode) await Coupon.updateOne({ code: o.couponCode }, { $inc: { used: 1 } });
  await User.updateOne({ _id: o.user }, { $set: { cart: [] } });
  const [u, s] = [await User.findById(o.user), await SiteSettings.get()];
  const list = o.items.map((i) => `${i.name} x${i.qty}`).join('<br>');
  await sendEmail({ to: u?.email, subject: `Order ${o.orderNo} confirmed`, title: 'Thank you for your order!', html: `<p>Your order <b>${o.orderNo}</b> is placed.</p><p>${list}</p><p><b>Total: Rs ${o.total}</b> (${o.paymentMethod})</p><p>You can track it and download your invoice from My Orders.</p>` });
  await sendEmail({ to: s.email, subject: `New order ${o.orderNo}`, title: 'New order received', html: `<p>${o.address.name}, ${o.address.phone}</p><p>${list}</p><p><b>Total: Rs ${o.total}</b> (${o.paymentMethod} / ${o.paymentStatus})</p>` });
  return o;
};
