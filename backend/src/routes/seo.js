const router = require("express").Router();
const c = require('../controllers/seo');
router.get('/:page', c.page);
module.exports = router;
