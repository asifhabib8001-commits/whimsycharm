module.exports = require('../utils/crud')(require('../models/Gallery'), 'Gallery item', { sort: { order: 1, createdAt: -1 }, publicFilter: { active: true } });
