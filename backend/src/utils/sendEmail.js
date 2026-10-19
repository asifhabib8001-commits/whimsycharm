const mailer = require("../config/mailer");
const wrap = (title, body) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;border:1px solid #e6dcf5;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#d4af37,#f5e08a);padding:18px;text-align:center;color:#3b2a00;font-size:22px;font-weight:bold">WhimsyCharm</div><div style="padding:22px;color:#333;line-height:1.6"><h2 style="color:#7a5cb5;margin-top:0">${title}</h2>${body}</div><div style="background:#f4effb;padding:10px;text-align:center;font-size:12px;color:#777">Handmade with love</div></div>`;
module.exports = async ({ to, subject, title, html, attachments }) => {
  const t = mailer();
  if (!t || !to) { console.log("[email skipped]", subject, to); return false; }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || `WhimsyCharm <${process.env.SMTP_USER}>`, to, subject, html: wrap(title || subject, html), attachments });
    return true;
  } catch (e) { console.error("email error:", e.message); return false; }
};
module.exports.enabled = () => !!mailer();
