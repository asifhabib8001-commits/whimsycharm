const router = require("express").Router();
const c = require('../controllers/coupon');
const { ownerOnly } = require('../middleware/auth');
router.post('/validate', c.validate);
router.get('/', ownerOnly, c.listAll);
router.post('/', ownerOnly, c.create);
router.put('/:id', ownerOnly, c.update);
router.delete('/:id', ownerOnly, c.remove);
module.exports = router;
