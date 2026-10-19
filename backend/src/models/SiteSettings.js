const m = require('mongoose');
const media = { url: String, publicId: String };
const s = new m.Schema({
  businessName: { type: String, default: 'WhimsyCharm' },
  tagline: { type: String, default: 'Handmade with a little magic' },
  about: { type: String, default: 'At WhimsyCharm, every piece begins with an idea and ends with a little magic. We are Arifa and Asif, and we handcraft resin art, pipe cleaner flowers, clay creations and concrete décor, one piece at a time.\n\nNothing here is mass-produced. Each creation is shaped, poured and finished by hand, with patience, love and attention to detail, so no two pieces are exactly alike.\n\nWhether it is a gift for someone special or a touch of golden charm for your home, we would love to make something just for you. Custom orders are always welcome.' },
  ownerNames: { type: String, default: 'Arifa, Asif' },
  phones: { type: [String], default: ['8343072351', '7679064009'] },
  whatsapp: { type: [String], default: ['8343072351', '7679064009'] },
  email: { type: String, default: 'whimsycharm1308@gmail.com' },
  address: { type: String, default: '' },
  mapsLink: { type: String, default: 'https://maps.app.goo.gl/BxHdzSqBku1Vqjoi8?g_st=ic' },
  social: { instagram: { type: String, default: 'https://instagram.com/whimsycharm._' }, facebook: String, youtube: String },
  logo: media, favicon: media,
  hero: { type: { type: String, enum: ['image', 'video'], default: 'image' }, url: String, publicId: String },
  pageBackgrounds: { type: Object, default: {} },   // { home:{type,url}, contact:{...} ... }
  seo: { type: Object, default: {} },                // { home:{title,description,keywords}, ... }
  shipping: { charge: { type: Number, default: 60 }, freeAbove: { type: Number, default: 0 }, codEnabled: { type: Boolean, default: true }, codCharge: { type: Number, default: 0 } },
  giftWrapPrice: { type: Number, default: 30 },
  invoice: { businessName: String, address: String, gstNumber: String },
  chatbot: { enabled: { type: Boolean, default: true }, tone: { type: String, default: 'friendly, warm and short' } },
  popup: { enabled: { type: Boolean, default: false }, title: String, text: String, code: String, image: media },
  policies: { privacy: String, terms: String, refund: String, shipping: String, returns: String },
}, { timestamps: true, minimize: false });
s.statics.get = async function () { return (await this.findOne()) || this.create({}); };
module.exports = m.model('SiteSettings', s);
