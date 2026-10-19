const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');
const BulkEnquiry = require('../models/BulkEnquiry');
const ReturnRequest = require('../models/ReturnRequest');
const Subscriber = require('../models/Subscriber');
const ActivityLog = require('../models/ActivityLog');
const ah = require('../utils/asyncHandler');
exports.stats = ah(async (_q, res) => {
  const earned = { status: { $ne: 'Cancelled' }, $or: [{ paymentStatus: 'Paid' }, { paymentMethod: 'COD', status: 'Delivered' }] };
  const since = new Date(Date.now() - 30 * 864e5);
  const open = { $in: ['New', 'Requested'] };
  const [totalOrders, pendingOrders, sales, daily, pendingReviews, customOrders, bulk, returns, lowStock, recent, customers, subscribers] = await Promise.all([
    Order.countDocuments({ finalized: true }),
    Order.countDocuments({ finalized: true, status: { $in: ['Placed', 'Packed'] } }),
    Order.aggregate([{ $match: earned }, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([{ $match: { ...earned, createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$total' }, orders: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Review.countDocuments({ status: 'pending' }),
    CustomOrder.countDocuments({ status: open }), BulkEnquiry.countDocuments({ status: open }), ReturnRequest.countDocuments({ status: open }),
    Product.find({ active: true, madeToOrderDays: 0, stock: { $lte: 3 } }).select('name stock').limit(10),
    Order.find({ finalized: true }).sort('-createdAt').limit(6).select('orderNo total status paymentStatus address.name createdAt'),
    User.countDocuments({ role: 'user' }), Subscriber.countDocuments(),
  ]);
  res.json({ totalOrders, pendingOrders, totalSales: sales[0]?.total || 0, daily, pendingReviews, newCustomOrders: customOrders, newBulkEnquiries: bulk, openReturns: returns, lowStock, recentOrders: recent, customers, subscribers });
});
exports.activity = ah(async (req, res) => res.json(await ActivityLog.find().sort('-createdAt').limit(Math.min(+req.query.limit || 100, 300))));
