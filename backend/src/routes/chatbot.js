const router = require("express").Router();
const c = require('../controllers/chatbot');
const { chatLimiter } = require('../middleware/rateLimit');
router.post('/', chatLimiter, c.chat);
module.exports = router;
