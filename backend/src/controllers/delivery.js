const Pincode = require('../models/Pincode');
const SiteSettings = require('../models/SiteSettings');
const crud = require('../utils/crud');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const log = require('../utils/logActivity');
const c = crud(Pincode, 'Pincode', { sort: { pincode: 1 } });
c.check = ah(async (req, res) => {
  const code = req.params.pincode;
  if (!/^\d{6}$/.test(code)) throw httpError('Enter a valid 6-digit pincode');
  const [s, total, pin] = await Promise.all([SiteSettings.get(), Pincode.countDocuments(), Pincode.findOne({ pincode: code })]);
  const deliverable = total === 0 ? true : !!(pin && pin.serviceable);
  res.json({
    deliverable, city: pin?.city, etaDays: pin?.etaDays,
    shipping: pin?.shippingCharge ?? s.shipping.charge, freeAbove: s.shipping.freeAbove,
    cod: deliverable && s.shipping.codEnabled && pin?.codAvailable !== false, codCharge: s.shipping.codCharge,
  });
});
c.bulkAdd = ah(async (req, res) => {
  const list = (req.body.pincodes || []).map(String).filter((p) => /^\d{6}$/.test(p));
  await Pincode.bulkWrite(list.map((p) => ({ updateOne: { filter: { pincode: p }, update: { $setOnInsert: { pincode: p, city: req.body.city } }, upsert: true } })));
  await log(req.user, 'Added pincodes', list.length); res.json({ added: list.length });
});
module.exports = c;
