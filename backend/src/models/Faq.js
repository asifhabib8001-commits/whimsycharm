const m = require('mongoose');
module.exports = m.model('Faq', new m.Schema({ question: { type: String, required: true }, answer: { type: String, required: true }, order: { type: Number, default: 0 }, active: { type: Boolean, default: true } }, { timestamps: true }));
