const mongoose = require("mongoose");
const cache = global._mongo || (global._mongo = { conn: null, p: null });
module.exports = async () => {
  if (cache.conn) return cache.conn;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
  cache.p = cache.p || mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cache.conn = await cache.p;
  return cache.conn;
};
