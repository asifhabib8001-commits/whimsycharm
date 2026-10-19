const ActivityLog = require("../models/ActivityLog");
module.exports = async (user, action, detail = "") => {
  try { await ActivityLog.create({ user: user?._id, userName: user?.name, action, detail: String(detail) }); } catch (e) { /* ignore */ }
};
