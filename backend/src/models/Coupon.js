const m = require('mongoose');
module.exports = m.model('Coupon', new m.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'flat'], default: 'percent' },
  value: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 0 },
  maxDiscount: Number,
  expiresAt: Date,
  usageLimit: Number,
  used: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true }));
