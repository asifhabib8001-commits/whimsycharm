const router = require("express").Router();
const c = require('../controllers/customOrder');
const { optionalAuth, ownerOnly } = require('../middleware/auth');
const { formLimiter } = require('../middleware/rateLimit');
router.post('/', formLimiter, optionalAuth, c.create);
router.get('/', ownerOnly, c.listAll);
router.put('/:id', ownerOnly, c.update);
router.delete('/:id', ownerOnly, c.remove);
module.exports = router;
