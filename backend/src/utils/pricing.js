const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Pincode = require('../models/Pincode');
const SiteSettings = require('../models/SiteSettings');
const httpError = require('./httpError');

async function applyCoupon(code, subtotal) {
  const c = await Coupon.findOne({ code: String(code).trim().toUpperCase(), active: true });
  if (!c) throw httpError('Invalid coupon code');
  if (c.expiresAt && c.expiresAt < new Date()) throw httpError('Coupon has expired');
  if (c.usageLimit && c.used >= c.usageLimit) throw httpError('Coupon usage limit reached');
  if (subtotal < c.minOrder) throw httpError(`Minimum order Rs ${c.minOrder} required for this coupon`);
  let d = c.type === 'percent' ? (subtotal * c.value) / 100 : c.value;
  if (c.type === 'percent' && c.maxDiscount) d = Math.min(d, c.maxDiscount);
  return { coupon: c, discount: Math.round(Math.min(d, subtotal)) };
}

// Price hamesha server par calculate hota hai (frontend ka price trust nahi karte)
async function buildPricing({ items, pincode, couponCode, giftWrap, paymentMethod, requirePin }) {
  if (!Array.isArray(items) || !items.length) throw httpError('Cart is empty');
  const prods = await Product.find({ _id: { $in: items.map((i) => i.productId) }, active: true });
  const map = new Map(prods.map((p) => [String(p._id), p]));
  const lines = items.map((i) => {
    const p = map.get(String(i.productId));
    if (!p) throw httpError('A product in your cart is no longer available');
    const qty = Math.max(1, parseInt(i.qty) || 1);
    if (!p.madeToOrderDays && p.stock < qty) throw httpError(`${p.name}: only ${p.stock} left in stock`);
    const cz = (i.customization || []).filter((x) => x && x.label && x.value);
    let unit = p.price;
    cz.forEach((x) => { const o = p.customizationOptions.find((o) => o.label === x.label); if (o) unit += o.extraPrice || 0; });
    return { product: p._id, name: p.name, image: p.images[0]?.url, price: unit, qty, madeToOrderDays: p.madeToOrderDays, customization: cz.map((x) => ({ label: String(x.label), value: String(x.value).slice(0, 200) })) };
  });

  const s = await SiteSettings.get();
  const sh = s.shipping;
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  let shipping = sh.charge, codOk = sh.codEnabled;
  if (pincode || requirePin) {
    if (!/^\d{6}$/.test(String(pincode || ''))) throw httpError('Valid 6-digit pincode required');
    const total = await Pincode.countDocuments();
    const pin = await Pincode.findOne({ pincode });
    if (total && (!pin || !pin.serviceable)) throw httpError('Sorry, delivery is not available at this pincode');
    if (pin) { if (pin.shippingCharge != null) shipping = pin.shippingCharge; if (pin.codAvailable === false) codOk = false; }
  }
  if (sh.freeAbove > 0 && subtotal >= sh.freeAbove) shipping = 0;
  if (paymentMethod === 'COD' && !codOk) throw httpError('Cash on Delivery is not available for this order');
  const codCharge = paymentMethod === 'COD' ? sh.codCharge || 0 : 0;
  const giftWrapCharge = giftWrap ? s.giftWrapPrice || 0 : 0;
  let discount = 0, coupon = null;
  if (couponCode) ({ coupon, discount } = await applyCoupon(couponCode, subtotal));
  const total = subtotal + shipping + codCharge + giftWrapCharge - discount;
  return { lines, subtotal, shipping, codCharge, giftWrapCharge, discount, total, codAvailable: codOk, coupon, couponCode: coupon?.code };
}
module.exports = { applyCoupon, buildPricing };
