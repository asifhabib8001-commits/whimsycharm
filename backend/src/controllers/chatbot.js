const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');
const gemini = require('../config/gemini');
const ah = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
exports.chat = ah(async (req, res) => {
  const s = await SiteSettings.get();
  if (!s.chatbot.enabled) throw httpError('Chatbot is currently off', 503);
  const msg = String(req.body.message || '').trim().slice(0, 500);
  if (!msg) throw httpError('Message required');
  const prods = await Product.find({ active: true }).select('name price material madeToOrderDays').populate('category', 'name').limit(40);
  const catalog = prods.map((p) => `- ${p.name} (${p.category?.name}) Rs ${p.price}${p.madeToOrderDays ? `, ready in ${p.madeToOrderDays} days` : ''}`).join('\n');
  const system = `You are the shopping assistant of ${s.businessName}, a handmade shop (resin, pipe cleaner flowers, clay, concrete). Tone: ${s.chatbot.tone}. Reply in the customer's language (Hinglish is fine). Recommend only from this catalog. Never invent prices or policies. If unsure, suggest WhatsApp ${s.whatsapp[0] || ''}.\nShipping Rs ${s.shipping.charge}; COD ${s.shipping.codEnabled ? 'available' : 'not available'}.\nCatalog:\n${catalog}`;
  const model = gemini(system);
  if (!model) throw httpError('Chatbot is not configured', 503);
  const history = (Array.isArray(req.body.history) ? req.body.history : []).slice(-10).map((h) => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: String(h.text || '').slice(0, 500) }] }));
  while (history.length && history[0].role !== 'user') history.shift();
  try {
    const r = await model.startChat({ history }).sendMessage(msg);
    res.json({ reply: r.response.text() });
  } catch (e) { console.error('gemini:', e.message); throw httpError('Chatbot is busy, please try again', 502); }
});
