const m = require('mongoose');
module.exports = m.model('BulkEnquiry', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true }, phone: { type: String, required: true }, email: String,
  occasion: { type: String, enum: ['Wedding', 'Birthday', 'Corporate', 'Return Gift', 'Other'], default: 'Other' },
  quantity: Number, details: String, neededBy: String,
  status: { type: String, enum: ['New', 'In Progress', 'Done', 'Rejected'], default: 'New' },
  ownerNote: String,
}, { timestamps: true }));
