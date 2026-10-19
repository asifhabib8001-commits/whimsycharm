const rateLimit = require("express-rate-limit");
const make = (windowMin, limit) => rateLimit({ windowMs: windowMin * 60 * 1000, limit, standardHeaders: true, legacyHeaders: false, message: { message: "Too many requests, please try later" } });
exports.apiLimiter = make(15, 400);
exports.authLimiter = make(15, 15);
exports.chatLimiter = make(10, 20);
exports.formLimiter = make(60, 20);
