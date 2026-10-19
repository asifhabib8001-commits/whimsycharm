const router = require("express").Router();
const c = require('../controllers/payment');
const { protect } = require('../middleware/auth');
router.post('/verify', protect, c.verify);
router.post('/webhook', c.webhook);
router.post('/retry/:orderId', protect, c.retry);
module.exports = router;
