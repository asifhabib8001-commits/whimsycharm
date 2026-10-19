const router = require("express").Router();
const c = require('../controllers/returnRequest');
const { protect, ownerOnly } = require('../middleware/auth');
router.post('/', protect, c.create);
router.get('/mine', protect, c.mine);
router.get('/', ownerOnly, c.listAll);
router.put('/:id', ownerOnly, c.update);
router.delete('/:id', ownerOnly, c.remove);
module.exports = router;
