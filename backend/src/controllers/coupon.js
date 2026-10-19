const Coupon = require('../models/Coupon');
const crud = require('../utils/crud');
const ah = require('../utils/asyncHandler');
const { applyCoupon } = require('../utils/pricing');
const c = crud(Coupon, 'Coupon');
c.validate = ah(async (req, res) => {
  const { coupon, discount } = await applyCoupon(req.body.code || '', Number(req.body.subtotal) || 0);
  res.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount });
});
module.exports = c;
