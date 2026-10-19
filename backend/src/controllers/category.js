const Category = require('../models/Category');
const crud = require('../utils/crud');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const c = crud(Category, 'Category', { sort: { order: 1, createdAt: 1 }, publicFilter: { active: true } });
c.getBySlug = ah(async (req, res) => { const d = await Category.findOne({ slug: req.params.slug, active: true }); if (!d) throw httpError('Category not found', 404); res.json(d); });
module.exports = c;
