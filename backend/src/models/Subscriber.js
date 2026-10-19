const m = require('mongoose');
module.exports = m.model('Subscriber', new m.Schema({ email: { type: String, required: true, unique: true, lowercase: true, trim: true } }, { timestamps: true }));
