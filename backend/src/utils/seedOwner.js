const User = require("../models/User");
const SiteSettings = require("../models/SiteSettings");
const Category = require("../models/Category");
let done = false;
module.exports = async () => {
  if (done) return;
  await SiteSettings.get();
  // 4 default categories (owner panel se edit / delete kar sakte hain)
  if (!(await Category.countDocuments())) {
    for (const [i, name] of ['Resin Art', 'Pipe Cleaner Flowers', 'Clay Creations', 'Concrete Décor'].entries()) await Category.create({ name, order: i + 1 });
    console.log('Default categories created');
  }
  if (!(await User.exists({ role: "owner" })) && process.env.OWNER_PASSWORD) {
    await User.create({
      name: "Arifa & Asif", role: "owner", emailVerified: true,
      username: (process.env.OWNER_USERNAME || "whimsycharm").toLowerCase(),
      email: (process.env.OWNER_EMAIL || "whimsycharm1308@gmail.com").toLowerCase(),
      password: process.env.OWNER_PASSWORD,
    });
    console.log("Owner account created");
  }
  if (!process.env.OWNER_PASSWORD && !(await User.exists({ role: 'owner' }))) console.warn('WARNING: OWNER_PASSWORD is not set in .env, so the owner account cannot be created and owner login will fail.');
  done = true;
};
