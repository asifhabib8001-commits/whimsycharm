const CustomOrder = require('../models/CustomOrder');
const { notifyOwner, ownerHandlers } = require('../utils/enquiry');
const ah = require('../utils/asyncHandler');
const h = ownerHandlers(CustomOrder, 'Custom order');
h.create = ah(async (req, res) => {
  const { name, phone, email, category, description, budget, neededBy, photos = [] } = req.body;
  const d = await CustomOrder.create({ user: req.user?._id, name, phone, email, category, description, budget, neededBy, photos: photos.slice(0, 5).map((p) => ({ url: p.url, publicId: p.publicId })) });
  await notifyOwner('custom order request', d);
  res.status(201).json({ message: 'Request received! We will contact you soon.', id: d._id });
});
module.exports = h;
