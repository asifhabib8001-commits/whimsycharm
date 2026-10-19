const router = require("express").Router();
const c = require('../controllers/newsletter');
const { ownerOnly } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimit');
router.post('/', formLimiter, c.subscribe);
router.get('/', ownerOnly, c.list);
router.delete('/:id', ownerOnly, c.remove);
module.exports = router;
