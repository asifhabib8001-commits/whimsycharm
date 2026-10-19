const m = require('mongoose');
module.exports = m.model('CustomOrder', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true }, phone: { type: String, required: true }, email: String,
  category: String, description: { type: String, required: true }, budget: String, neededBy: String,
  photos: [{ url: String, publicId: String }],
  status: { type: String, enum: ['New', 'In Progress', 'Done', 'Rejected'], default: 'New' },
  ownerNote: String,
}, { timestamps: true }));
