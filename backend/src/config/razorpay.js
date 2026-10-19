const Razorpay = require("razorpay");
let inst;
module.exports = () => inst || (inst = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }));
