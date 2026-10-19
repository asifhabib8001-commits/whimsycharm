const router = require("express").Router();
const c = require('../controllers/settings');
const { ownerOnly } = require('../middleware/auth');
router.get('/', c.get);
router.put('/', ownerOnly, c.update);
module.exports = router;
