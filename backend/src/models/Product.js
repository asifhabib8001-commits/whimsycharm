const m = require('mongoose');
const slugify = require('../utils/slugify');
const s = new m.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  category: { type: m.Schema.Types.ObjectId, ref: 'Category', required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  mrp: Number,
  images: [{ url: String, publicId: String }],
  video: { url: String, publicId: String },
  stock: { type: Number, default: 0, min: 0 },
  madeToOrderDays: { type: Number, default: 0 },
  careInstructions: String,
  material: String,
  tags: [String],
  customizationOptions: [{ label: String, type: { type: String, enum: ['text', 'select', 'color'], default: 'text' }, choices: [String], extraPrice: { type: Number, default: 0 } }],
  giftWrapAvailable: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
s.pre('validate', function () { if (!this.slug) this.slug = slugify(this.name) + '-' + Math.random().toString(36).slice(2, 6); });
s.index({ name: 'text', description: 'text', tags: 'text' });
module.exports = m.model('Product', s);
