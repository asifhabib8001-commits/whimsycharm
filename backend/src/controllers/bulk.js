const BulkEnquiry = require('../models/BulkEnquiry');
const { notifyOwner, ownerHandlers } = require('../utils/enquiry');
const ah = require('../utils/asyncHandler');
const h = ownerHandlers(BulkEnquiry, 'Bulk enquiry');
h.create = ah(async (req, res) => {
  const { name, phone, email, occasion, quantity, details, neededBy } = req.body;
  const d = await BulkEnquiry.create({ user: req.user?._id, name, phone, email, occasion, quantity, details, neededBy });
  await notifyOwner('bulk / return-gift enquiry', d);
  res.status(201).json({ message: 'Enquiry received! We will contact you soon.' });
});
module.exports = h;
