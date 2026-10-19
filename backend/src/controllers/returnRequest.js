const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');
const { notifyOwner, ownerHandlers } = require('../utils/enquiry');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const h = ownerHandlers(ReturnRequest, 'Return request');
h.create = ah(async (req, res) => {
  const { orderId, type, reason, photos = [] } = req.body;
  const o = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!o) throw httpError('Order not found', 404);
  if (o.status !== 'Delivered') throw httpError('Return can be requested only after delivery');
  if (await ReturnRequest.exists({ order: o._id, status: { $in: ['Requested', 'Approved'] } })) throw httpError('A request for this order is already open', 409);
  const d = await ReturnRequest.create({ user: req.user._id, order: o._id, orderNo: o.orderNo, type, reason, photos: photos.slice(0, 4).map((p) => ({ url: p.url, publicId: p.publicId })) });
  await notifyOwner(`return request (${o.orderNo})`, d);
  res.status(201).json({ message: 'Return request submitted', request: d });
});
h.mine = ah(async (req, res) => res.json(await ReturnRequest.find({ user: req.user._id }).sort('-createdAt')));
module.exports = h;
