const m = require('mongoose');
module.exports = m.model('Pincode', new m.Schema({ pincode: { type: String, required: true, unique: true, match: /^\d{6}$/ }, city: String, serviceable: { type: Boolean, default: true }, shippingCharge: Number, codAvailable: { type: Boolean, default: true }, etaDays: Number }, { timestamps: true }));
