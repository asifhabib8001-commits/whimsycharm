const router = require("express").Router();
const c = require('../controllers/dashboard');
const { ownerOnly } = require('../middleware/auth');
router.get('/', ownerOnly, c.stats);
router.get('/activity', ownerOnly, c.activity);
module.exports = router;
