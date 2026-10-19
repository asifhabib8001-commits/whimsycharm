const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const sendEmail = require('../utils/sendEmail');
const log = require('../utils/logActivity');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: u.role === 'owner' ? '12h' : '7d' });
const safe = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, emailVerified: u.emailVerified, addresses: u.addresses });
const token = () => { const raw = crypto.randomBytes(32).toString('hex'); return { raw, hash: crypto.createHash('sha256').update(raw).digest('hex') }; };
const hash = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');
const FE = () => process.env.FRONTEND_URL || 'http://localhost:5500';

const sendVerify = async (u) => {
  const t = token();
  await User.updateOne({ _id: u._id }, { verifyToken: t.hash });
  await sendEmail({ to: u.email, subject: 'Verify your email - WhimsyCharm', title: 'Welcome to WhimsyCharm!', html: `<p>Hi ${u.name}, please verify your email.</p><p><a href="${FE()}/verify-email.html?token=${t.raw}" style="background:#d4af37;color:#3b2a00;padding:10px 20px;border-radius:8px;text-decoration:none">Verify Email</a></p>` });
};

exports.signup = ah(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) throw httpError('Name, email and password required');
  if (password.length < 6) throw httpError('Password must be at least 6 characters');
  if (await User.exists({ email: String(email).toLowerCase() })) throw httpError('Email already registered', 409);
  const u = await User.create({ name, email, password, phone, emailVerified: !sendEmail.enabled() }); // email set nahi hai to auto-verify
  if (sendEmail.enabled()) await sendVerify(u);
  res.status(201).json({ token: sign(u), user: safe(u), message: u.emailVerified ? 'Account created' : 'Account created. Please verify your email.' });
});

exports.login = ah(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase(), role: 'user' }).select('+password');
  if (!u || !(await u.matchPassword(req.body.password || ''))) throw httpError('Invalid email or password', 401);
  res.json({ token: sign(u), user: safe(u) });
});

exports.ownerLogin = ah(async (req, res) => {
  const u = await User.findOne({ username: String(req.body.username || '').toLowerCase(), role: 'owner' }).select('+password');
  if (!u || !(await u.matchPassword(req.body.password || ''))) throw httpError('Invalid username or password', 401);
  await log(u, 'Owner login');
  res.json({ token: sign(u), user: safe(u) });
});

exports.verifyEmail = ah(async (req, res) => {
  const u = await User.findOne({ verifyToken: hash(req.body.token) }).select('+verifyToken');
  if (!u) throw httpError('Invalid or expired link');
  u.emailVerified = true; u.verifyToken = undefined; await u.save();
  res.json({ message: 'Email verified' });
});

exports.resendVerification = ah(async (req, res) => {
  if (!req.user.emailVerified) await sendVerify(req.user);
  res.json({ message: 'Verification email sent' });
});

exports.forgotPassword = ah(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase(), role: 'user' });
  if (u) {
    const t = token();
    await User.updateOne({ _id: u._id }, { resetToken: t.hash, resetExpires: new Date(Date.now() + 30 * 60 * 1000) });
    await sendEmail({ to: u.email, subject: 'Reset your password - WhimsyCharm', title: 'Password reset', html: `<p>Click below to set a new password (valid 30 minutes).</p><p><a href="${FE()}/forgot-password.html?token=${t.raw}" style="background:#d4af37;color:#3b2a00;padding:10px 20px;border-radius:8px;text-decoration:none">Reset Password</a></p>` });
  }
  res.json({ message: 'If this email is registered, a reset link has been sent.' });
});

exports.resetPassword = ah(async (req, res) => {
  const { token: t, password } = req.body;
  if (!password || password.length < 6) throw httpError('Password must be at least 6 characters');
  const u = await User.findOne({ resetToken: hash(t), resetExpires: { $gt: new Date() } }).select('+resetToken +resetExpires');
  if (!u) throw httpError('Reset link is invalid or expired');
  u.password = password; u.resetToken = undefined; u.resetExpires = undefined; await u.save();
  res.json({ message: 'Password updated. Please login.' });
});

exports.me = (req, res) => res.json({ user: safe(req.user) });

exports.updateProfile = ah(async (req, res) => {
  const { name, phone, addresses } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (Array.isArray(addresses)) req.user.addresses = addresses.slice(0, 5);
  await req.user.save();
  res.json({ user: safe(req.user) });
});

exports.changePassword = ah(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw httpError('New password must be at least 6 characters');
  const u = await User.findById(req.user._id).select('+password');
  if (!(await u.matchPassword(currentPassword || ''))) throw httpError('Current password is wrong', 401);
  u.password = newPassword; await u.save();
  if (u.role === 'owner') await log(u, 'Changed password');
  res.json({ message: 'Password changed' });
});
