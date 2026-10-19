const m = require('mongoose');
module.exports = m.model('ActivityLog', new m.Schema({ user: { type: m.Schema.Types.ObjectId, ref: 'User' }, userName: String, action: String, detail: String }, { timestamps: true }));
