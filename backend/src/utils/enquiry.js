// Custom order / Bulk / Return ke liye common handlers
const ah = require("./asyncHandler");
const log = require("./logActivity");
const httpError = require("./httpError");
const sendEmail = require("./sendEmail");
const SiteSettings = require("../models/SiteSettings");
const esc = (s) => String(s ?? "").replace(/[<>]/g, "");
exports.notifyOwner = async (label, doc) => {
  const s = await SiteSettings.get();
  const rows = Object.entries(doc.toObject()).filter(([k, v]) => !["_id", "__v", "photos", "user"].includes(k) && typeof v !== "object").map(([k, v]) => `<b>${k}</b>: ${esc(v)}`).join("<br>");
  await sendEmail({ to: s.email, subject: `New ${label}`, html: rows });
};
exports.ownerHandlers = (Model, label) => ({
  listAll: ah(async (req, res) => res.json(await Model.find(req.query.status ? { status: req.query.status } : {}).sort("-createdAt").populate("user", "name email phone"))),
  update: ah(async (req, res) => {
    const { status, ownerNote } = req.body;
    const d = await Model.findByIdAndUpdate(req.params.id, { status, ownerNote }, { new: true, runValidators: true });
    if (!d) throw httpError(`${label} not found`, 404);
    await log(req.user, `Updated ${label}`, `${d._id} -> ${status}`); res.json(d);
  }),
  remove: ah(async (req, res) => { await Model.findByIdAndDelete(req.params.id); await log(req.user, `Deleted ${label}`, req.params.id); res.json({ message: "Deleted" }); }),
});
