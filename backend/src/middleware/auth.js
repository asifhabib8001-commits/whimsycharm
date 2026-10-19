const jwt = require("jsonwebtoken");
const User = require("../models/User");
const getUser = async (req) => {
  const h = req.headers.authorization || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  try { return await User.findById(jwt.verify(t, process.env.JWT_SECRET).id); } catch { return null; }
};
exports.protect = async (req, res, next) => {
  const u = await getUser(req);
  if (!u) return res.status(401).json({ message: "Please login first" });
  req.user = u; next();
};
exports.optionalAuth = async (req, _res, next) => { req.user = await getUser(req); next(); };
exports.ownerOnly = [exports.protect, (req, res, next) => (req.user.role === "owner" ? next() : res.status(403).json({ message: "Owner access only" }))];
