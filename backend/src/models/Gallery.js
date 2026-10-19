const m = require('mongoose');
module.exports = m.model('Gallery', new m.Schema({ title: String, type: { type: String, enum: ['image', 'video'], default: 'image' }, url: { type: String, required: true }, publicId: String, order: { type: Number, default: 0 }, active: { type: Boolean, default: true } }, { timestamps: true }));
