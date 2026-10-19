const m = require('mongoose');
const s = new m.Schema({
  product: { type: m.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
  photos: [{ url: String, publicId: String }],
  verifiedBuyer: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });
s.index({ product: 1, user: 1 }, { unique: true });
module.exports = m.model('Review', s);
