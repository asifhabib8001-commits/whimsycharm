const m = require('mongoose');
const bcrypt = require('bcryptjs');
const s = new m.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: String,
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'owner'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  verifyToken: { type: String, select: false },
  resetToken: { type: String, select: false },
  resetExpires: { type: Date, select: false },
  addresses: [{ name: String, phone: String, line1: String, line2: String, city: String, state: String, pincode: String }],
  wishlist: [{ type: m.Schema.Types.ObjectId, ref: 'Product' }],
  cart: [{ product: { type: m.Schema.Types.ObjectId, ref: 'Product' }, qty: { type: Number, default: 1, min: 1 }, customization: [{ label: String, value: String }] }],
}, { timestamps: true });
s.pre('save', async function () { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12); });
s.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };
module.exports = m.model('User', s);
