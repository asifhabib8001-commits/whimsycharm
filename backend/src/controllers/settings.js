const SiteSettings = require('../models/SiteSettings');
const ah = require('../utils/asyncHandler');
const log = require('../utils/logActivity');
// nested object ko dotted keys me badalta hai, taaki partial update baaki fields na mitaye
const flat = (o, p = '', out = {}) => {
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('$') || k.includes('.')) continue;
    const key = p ? `${p}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length) flat(v, key, out); else out[key] = v;
  }
  return out;
};
exports.get = ah(async (_q, res) => res.json(await SiteSettings.get()));
exports.update = ah(async (req, res) => {
  await SiteSettings.get();
  const { _id, __v, createdAt, updatedAt, ...body } = req.body;
  const s = await SiteSettings.findOneAndUpdate({}, { $set: flat(body) }, { new: true, runValidators: true });
  await log(req.user, 'Updated site settings', Object.keys(body).join(', '));
  res.json(s);
});
