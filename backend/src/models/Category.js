const m = require('mongoose');
const slugify = require('../utils/slugify');
const s = new m.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  image: { url: String, publicId: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
s.pre('validate', function () { if (!this.slug || this.isModified('name')) this.slug = slugify(this.name); });
module.exports = m.model('Category', s);
