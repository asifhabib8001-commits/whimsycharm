const router = require("express").Router();
const c = require('../controllers/faq');
const { ownerOnly } = require('../middleware/auth');
router.get('/', c.listPublic);
router.get('/admin/all', ownerOnly, c.listAll);
router.post('/', ownerOnly, c.create);
router.put('/:id', ownerOnly, c.update);
router.delete('/:id', ownerOnly, c.remove);
module.exports = router;
