const nodemailer = require("nodemailer");
let t;
module.exports = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  if (t) return t;
  t = nodemailer.createTransport(process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === "465", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
    : { service: "gmail", auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
  return t;
};
