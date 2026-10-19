const Subscriber = require('../models/Subscriber');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
exports.subscribe = ah(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError('Enter a valid email');
  await Subscriber.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
  res.status(201).json({ message: 'Thanks for subscribing!' });
});
exports.list = ah(async (_q, res) => res.json(await Subscriber.find().sort('-createdAt')));
exports.remove = ah(async (req, res) => { await Subscriber.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); });
