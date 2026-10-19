const cloudinary = require('../config/cloudinary');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const safeFolder = (f) => 'whimsycharm/' + String(f || 'misc').replace(/[^a-z0-9_-]/gi, '').slice(0, 30);
const stream = (buf, opts) => new Promise((resolve, reject) => cloudinary.uploader.upload_stream(opts, (e, r) => (e ? reject(e) : resolve(r))).end(buf));

// NOTE: Vercel me request body ~4.5MB tak hi jaati hai. Badi video ke liye /upload/signature se seedha Cloudinary par upload karo.
exports.upload = ah(async (req, res) => {
  const f = req.file;
  if (!f) throw httpError('No file received');
  const isImg = f.mimetype.startsWith('image/'), isVid = f.mimetype.startsWith('video/');
  if (!isImg && !isVid) throw httpError('Only images or videos are allowed');
  if (req.user.role !== 'owner' && (!isImg || f.size > 5 * 1024 * 1024)) throw httpError('Only images up to 5MB are allowed');
  const r = await stream(f.buffer, { folder: safeFolder(req.user.role === 'owner' ? req.body.folder : 'customer'), resource_type: isVid ? 'video' : 'image' });
  res.status(201).json({ url: r.secure_url, publicId: r.public_id, type: isVid ? 'video' : 'image', width: r.width, height: r.height });
});
exports.signature = ah(async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000), folder = safeFolder(req.query.folder);
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
  res.json({ signature, timestamp, folder, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
});
exports.remove = ah(async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  if (!publicId) throw httpError('publicId required');
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType === 'video' ? 'video' : 'image' });
  res.json({ message: 'Deleted' });
});
