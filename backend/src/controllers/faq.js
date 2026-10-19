module.exports = require('../utils/crud')(require('../models/Faq'), 'FAQ', { sort: { order: 1, createdAt: 1 }, publicFilter: { active: true } });
