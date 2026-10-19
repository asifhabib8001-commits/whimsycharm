// Simple models (faq, gallery, pincode, coupon) ke liye common CRUD
const ah = require("./asyncHandler");
const log = require("./logActivity");
const httpError = require("./httpError");
module.exports = (Model, label, { sort = { createdAt: -1 }, publicFilter = {} } = {}) => ({
  listPublic: ah(async (_q, res) => res.json(await Model.find(publicFilter).sort(sort))),
  listAll: ah(async (_q, res) => res.json(await Model.find().sort(sort))),
  create: ah(async (req, res) => { const d = await Model.create(req.body); await log(req.user, `Added ${label}`, d._id); res.status(201).json(d); }),
  update: ah(async (req, res) => {
    const d = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!d) throw httpError(`${label} not found`, 404);
    await log(req.user, `Updated ${label}`, d._id); res.json(d);
  }),
  remove: ah(async (req, res) => {
    const d = await Model.findByIdAndDelete(req.params.id);
    if (!d) throw httpError(`${label} not found`, 404);
    await log(req.user, `Deleted ${label}`, req.params.id); res.json({ message: "Deleted" });
  }),
});
