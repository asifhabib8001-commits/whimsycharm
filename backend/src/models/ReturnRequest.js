const m = require('mongoose');
module.exports = m.model('ReturnRequest', new m.Schema({
  user: { type: m.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: m.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderNo: String,
  type: { type: String, enum: ['Return', 'Replace', 'Refund'], default: 'Return' },
  reason: { type: String, required: true },
  photos: [{ url: String, publicId: String }],
  status: { type: String, enum: ['Requested', 'Approved', 'Rejected', 'Completed'], default: 'Requested' },
  ownerNote: String,
}, { timestamps: true }));
