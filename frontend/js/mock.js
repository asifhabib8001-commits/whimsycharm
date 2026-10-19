// WhimsyCharm DEMO MODE: poora backend browser ke andar (localStorage) chalta hai, sirf preview ke liye.
// config.js me API_URL set karte hi ye file use hona band ho jati hai aur asli backend se baat hoti hai.
(function () {
  const KEY = 'wc_demo_db_v1', now = () => new Date().toISOString(), ago = (d) => new Date(Date.now() - d * 864e5).toISOString();
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const E = (m, s = 400) => Object.assign(new Error(m), { status: s });
  const art = (t, a, b, k = 0) => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><circle cx="${300 + k * 40}" cy="${260 - k * 20}" r="${120 - k * 25}" fill="rgba(255,255,255,.35)"/><circle cx="${210 + k * 60}" cy="340" r="55" fill="rgba(255,255,255,.22)"/><text x="300" y="500" font-family="Georgia,serif" font-size="32" text-anchor="middle" fill="#ffffff">${t}</text></svg>`);

  function seed() {
    const CATS = [['Resin Art', '#c9a227', '#9677cc', 'Wipe gently with a soft dry cloth. Keep away from direct sunlight and heat.'], ['Pipe Cleaner Flowers', '#b79be0', '#e0b94a', 'Dust lightly. Keep dry and away from moisture. Reshape petals gently with your fingers.'], ['Clay Creations', '#e2a98f', '#c9a227', 'Clean with a dry soft cloth. Avoid soaking in water. Handle with care, clay can chip if dropped.'], ['Concrete Décor', '#9a93a8', '#d9c9f2', 'Wipe with a damp cloth. Use a liner for live plants. Avoid sharp impacts.']];
    const PR = [
      [['Golden Flake Resin Coaster Set', 'Set of 4 glossy resin coasters with real gold flakes, poured and polished by hand.', 599, 799, 8, 0, 'Epoxy resin, gold flakes', []], ['Lavender Resin Keychain', 'A tiny lavender-tinted resin charm with dried flowers set inside.', 149, 0, 20, 0, 'Epoxy resin, dried flowers', []], ['Floral Resin Photo Frame', 'A pressed-flower resin frame, made to order for your favourite photo.', 899, 1099, 0, 5, 'Epoxy resin, pressed flowers', [{ label: 'Name to engrave', type: 'text', choices: [], extraPrice: 100 }]]],
      [['Lavender Pipe Cleaner Bouquet', 'A bouquet of soft lavender stems that never wilt. A gift that lasts.', 399, 499, 12, 0, 'Pipe cleaners', [{ label: 'Colour', type: 'select', choices: ['Lavender', 'Pink', 'Yellow', 'White'], extraPrice: 0 }]], ['Mini Sunflower Pot', 'A cheerful mini sunflower in a tiny clay pot for your desk.', 249, 0, 15, 0, 'Pipe cleaners, clay pot', []], ['Rose Stem Set of 5', 'Five long-stem roses, perfect for gifting and home styling.', 299, 349, 3, 0, 'Pipe cleaners', []]],
      [['Hand-painted Clay Earrings', 'Lightweight floral earrings, hand-shaped and painted with gold accents.', 199, 0, 25, 0, 'Polymer clay', [{ label: 'Colour', type: 'select', choices: ['Lavender', 'Cream', 'Rose'], extraPrice: 0 }]], ['Mini Clay Planter', 'A cute textured planter for succulents and tiny plants.', 349, 429, 9, 0, 'Air-dry clay', []], ['Clay Trinket Dish', 'A golden-rimmed dish for rings, keys and little treasures.', 279, 0, 0, 3, 'Air-dry clay, gold paint', []]],
      [['Concrete Planter Duo', 'Two minimalist concrete planters, poured and sanded by hand.', 549, 649, 6, 0, 'Concrete', []], ['Marble-look Candle Holder', 'A smooth marbled concrete holder with a soft golden swirl.', 449, 0, 10, 0, 'Concrete, gold pigment', []], ['Concrete Tray', 'A sturdy decor tray for vanity, desk or coffee table.', 499, 0, 4, 0, 'Concrete', []]],
    ];
    const categories = CATS.map((c, i) => ({ _id: 'cat_' + i, name: c[0], slug: slug(c[0]), image: { url: art(c[0], c[1], c[2], 1), publicId: '' }, order: i + 1, active: true, createdAt: ago(30 - i) }));
    const products = [];
    PR.forEach((list, ci) => list.forEach((p, i) => products.push({ _id: 'p_' + ci + i, name: p[0], slug: slug(p[0]), category: 'cat_' + ci, description: p[1], price: p[2], mrp: p[3] || undefined, stock: p[4], madeToOrderDays: p[5], material: p[6], tags: p[6].toLowerCase().split(', '), careInstructions: CATS[ci][3], customizationOptions: p[7], images: [{ url: art(p[0].slice(0, 28), CATS[ci][1], CATS[ci][2], 0) }, { url: art(CATS[ci][0], CATS[ci][2], CATS[ci][1], 2) }], giftWrapAvailable: true, featured: i === 0, active: true, ratingAvg: 0, ratingCount: 0, createdAt: ago(20 - ci * 3 - i) })));
    const reviews = [['Priya', 5, 'Absolutely gorgeous! The gold flakes catch the light beautifully.', 'p_00'], ['Rahul', 5, 'Bought the bouquet for my sister and she loved it.', 'p_10'], ['Sneha', 4, 'Lovely finish and very well packed.', 'p_21']].map((r, i) => ({ _id: 'r_' + i, product: r[3], user: 'sample', name: r[0], rating: r[1], comment: r[2], photos: [], verifiedBuyer: true, status: 'approved', createdAt: ago(5 + i) }));
    products.forEach((p) => { const r = reviews.filter((x) => x.product === p._id); if (r.length) { p.ratingCount = r.length; p.ratingAvg = r.reduce((a, x) => a + x.rating, 0) / r.length; } });
    const so = (no, name, city, pin, status, pay, method, days) => ({ _id: uid(), orderNo: no, user: 'sample', items: [{ product: 'p_00', name: products[0].name, image: products[0].images[0].url, price: 599, qty: 1, customization: [] }], address: { name, phone: '9876543210', line1: '12 Garden Street', city, state: 'West Bengal', pincode: pin }, subtotal: 599, shipping: 60, codCharge: 0, giftWrapCharge: 0, discount: 0, total: 659, gift: {}, paymentMethod: method, paymentStatus: pay, status, statusHistory: [{ status: 'Placed', at: ago(days) }], finalized: true, invoiceNo: 'INV-' + no, createdAt: ago(days) });
    return {
      owner: { id: 'owner', _id: 'owner', name: 'Arifa & Asif', email: 'whimsycharm1308@gmail.com', username: 'whimsycharm', password: 'demo123', role: 'owner', emailVerified: true },
      users: [], categories, products, reviews,
      orders: [so('WCDEMO01', 'Ananya Roy', 'Kolkata', '700001', 'Delivered', 'Paid', 'Online', 6), so('WCDEMO02', 'Meera Das', 'Howrah', '711101', 'Shipped', 'Pending', 'COD', 2), so('WCDEMO03', 'Kabir Sen', 'Kolkata', '700019', 'Placed', 'Paid', 'Online', 0)],
      coupons: [{ _id: uid(), code: 'WELCOME10', type: 'percent', value: 10, minOrder: 300, maxDiscount: 150, used: 0, active: true, createdAt: now() }],
      customOrders: [], bulk: [], returns: [], subscribers: [], pincodes: [], activity: [],
      faqs: [['How long does a handmade order take?', 'Ready items ship in 1-3 days. Made-to-order pieces show their preparation time on the product page.'], ['Can I ask for a custom colour or name?', 'Yes! Use the Custom Order page or the customization options on a product.'], ['Do you offer cash on delivery?', 'Yes, on selected pincodes. You can see availability at checkout.'], ['How should I care for my piece?', 'Every product page has care instructions. In short: keep it dry, clean and away from direct heat.']].map((f, i) => ({ _id: uid(), question: f[0], answer: f[1], order: i, active: true })),
      gallery: [['Pouring resin', '#c9a227', '#9677cc'], ['Shaping flowers', '#b79be0', '#e0b94a'], ['Painting clay', '#e2a98f', '#c9a227'], ['Sanding concrete', '#9a93a8', '#d9c9f2']].map((g, i) => ({ _id: uid(), title: g[0], type: 'image', url: art(g[0], g[1], g[2], i % 3), order: i, active: true })),
      settings: {
        businessName: 'WhimsyCharm', tagline: 'Handmade with a little magic',
        about: 'At WhimsyCharm, every piece begins with an idea and ends with a little magic. We are Arifa and Asif, and we handcraft resin art, pipe cleaner flowers, clay creations and concrete décor, one piece at a time.\n\nNothing here is mass-produced. Each creation is shaped, poured and finished by hand, with patience, love and attention to detail, so no two pieces are exactly alike.\n\nWhether it is a gift for someone special or a touch of golden charm for your home, we would love to make something just for you. Custom orders are always welcome.',
        ownerNames: 'Arifa, Asif', phones: ['8343072351', '7679064009'], whatsapp: ['8343072351', '7679064009'], email: 'whimsycharm1308@gmail.com', address: '',
        mapsLink: 'https://maps.app.goo.gl/BxHdzSqBku1Vqjoi8?g_st=ic', social: { instagram: 'https://instagram.com/whimsycharm._', facebook: '', youtube: '' },
        logo: { url: '', publicId: '' }, favicon: { url: '', publicId: '' }, hero: { type: 'image', url: art('', '#c9a227', '#9677cc', 0), publicId: '' },
        pageBackgrounds: {}, seo: {}, shipping: { charge: 60, freeAbove: 999, codEnabled: true, codCharge: 0 }, giftWrapPrice: 30,
        invoice: { businessName: 'WhimsyCharm', address: '', gstNumber: '' }, chatbot: { enabled: true, tone: 'friendly, warm and short' }, popup: { enabled: false, title: '', text: '', code: '', image: { url: '' } }, policies: {},
      },
    };
  }

  let db;
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { throw E('Browser storage is full. Remove some photos and try again.'); } };
  const load = () => { try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; } if (!db) { db = seed(); persist(); } return db; };
  const safe = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, emailVerified: true, addresses: u.addresses || [] });
  const who = (t) => (!t ? null : t === 'demo-owner' ? db.owner : t.startsWith('u:') ? db.users.find((x) => x.id === t.slice(2)) || null : null);
  const needUser = (u) => { if (!u) throw E('Please login first', 401); return u; };
  const needOwner = (u) => { if (!u) throw E('Please login first', 401); if (u.role !== 'owner') throw E('Owner access only', 403); return u; };
  const act = (u, a, d = '') => db.activity.unshift({ _id: uid(), userName: u?.name, action: a, detail: String(d), createdAt: now() });
  const catOf = (id) => { const c = db.categories.find((x) => x._id === id); return c ? { _id: c._id, name: c.name, slug: c.slug } : null; };
  const pop = (p) => ({ ...p, category: catOf(p.category) });
  const byOrder = (a, b) => (a.order || 0) - (b.order || 0) || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  const merge = (t, s) => { for (const k in s) { const v = s[k]; if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) merge(t[k], v); else t[k] = v; } return t; };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rx = (s) => new RegExp(String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const recalc = (pid) => { const r = db.reviews.filter((x) => x.product === pid && x.status === 'approved'), p = db.products.find((x) => x._id === pid); if (p) { p.ratingCount = r.length; p.ratingAvg = r.length ? Math.round((r.reduce((a, x) => a + x.rating, 0) / r.length) * 10) / 10 : 0; } };

  const R = [];
  const on = (m, p, f) => R.push([m, new RegExp('^' + p.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), f]);
  function crud(base, key, o = {}) {
    const label = o.label || key;
    if (o.pub !== false) on('GET', base, ({ db }) => db[key].filter((x) => x.active !== false).sort(byOrder));
    on('GET', base + (o.list ?? '/admin/all'), ({ db, u }) => { needOwner(u); return [...db[key]].sort(byOrder); });
    on('POST', base, ({ b, u, db }) => { needOwner(u); const d = (o.pre || ((x) => x))({ _id: uid(), active: true, createdAt: now(), ...b }); db[key].push(d); act(u, 'Added ' + label, d.name || d.code || d.question || d.pincode || d.title || ''); return d; });
    on('PUT', base + '/:id', ({ p, b, u, db }) => { needOwner(u); const d = db[key].find((x) => x._id === p.id); if (!d) throw E('Not found', 404); Object.assign(d, b); act(u, 'Updated ' + label, d.name || d.code || d._id); return d; });
    on('DELETE', base + '/:id', ({ p, u, db }) => { needOwner(u); db[key] = db[key].filter((x) => x._id !== p.id); act(u, 'Deleted ' + label, p.id); return { message: 'Deleted' }; });
  }

  // ---------- settings / content ----------
  on('GET', '/settings', ({ db }) => db.settings);
  on('PUT', '/settings', ({ b, u, db }) => { needOwner(u); merge(db.settings, b); act(u, 'Updated site settings', Object.keys(b).join(', ')); return db.settings; });
  on('GET', '/categories/slug/:slug', ({ p, db }) => { const c = db.categories.find((x) => x.slug === p.slug && x.active !== false); if (!c) throw E('Category not found', 404); return c; });
  crud('/categories', 'categories', { label: 'category', pre: (d) => { d.slug = slug(d.name || '') || uid(); return d; } });
  crud('/faqs', 'faqs', { label: 'FAQ' });
  crud('/gallery', 'gallery', { label: 'gallery item' });
  crud('/coupons', 'coupons', { pub: false, list: '', label: 'coupon', pre: (d) => { d.code = String(d.code || '').toUpperCase(); d.used = 0; return d; } });
  crud('/delivery/pincodes', 'pincodes', { pub: false, list: '', label: 'pincode' });
  on('POST', '/delivery/pincodes/bulk', ({ b, u, db }) => { needOwner(u); let n = 0; (b.pincodes || []).map(String).filter((p) => /^\d{6}$/.test(p)).forEach((p) => { if (!db.pincodes.find((x) => x.pincode === p)) { db.pincodes.push({ _id: uid(), pincode: p, city: b.city, serviceable: true, codAvailable: true }); n++; } }); return { added: n }; });
  on('GET', '/delivery/check/:pin', ({ p, db }) => {
    if (!/^\d{6}$/.test(p.pin)) throw E('Enter a valid 6-digit pincode');
    const s = db.settings, pin = db.pincodes.find((x) => x.pincode === p.pin), ok = !db.pincodes.length || !!(pin && pin.serviceable);
    return { deliverable: ok, city: pin?.city, etaDays: pin?.etaDays, shipping: pin?.shippingCharge ?? s.shipping.charge, freeAbove: s.shipping.freeAbove, cod: ok && s.shipping.codEnabled && pin?.codAvailable !== false, codCharge: s.shipping.codCharge };
  });
  on('POST', '/newsletter', ({ b, db }) => { const e = String(b.email || '').toLowerCase().trim(); if (!/^\S+@\S+\.\S+$/.test(e)) throw E('Enter a valid email'); if (!db.subscribers.find((x) => x.email === e)) db.subscribers.push({ _id: uid(), email: e, createdAt: now() }); return { message: 'Thanks for subscribing!' }; });
  on('GET', '/newsletter', ({ u, db }) => { needOwner(u); return db.subscribers; });
  on('DELETE', '/newsletter/:id', ({ p, u, db }) => { needOwner(u); db.subscribers = db.subscribers.filter((x) => x._id !== p.id); return {}; });
  on('GET', '/seo/:page', ({ p, db }) => { const s = db.settings, d = (s.seo || {})[p.page] || {}; return { title: d.title || s.businessName, description: d.description || s.tagline, keywords: d.keywords || '' }; });

  // ---------- products ----------
  on('GET', '/products', ({ q, db }) => {
    let l = db.products.filter((x) => x.active !== false);
    if (q.category) { const c = db.categories.find((x) => x.slug === q.category || x._id === q.category); l = l.filter((x) => c && x.category === c._id); }
    if (q.q) { const r = rx(q.q); l = l.filter((x) => r.test(x.name) || r.test(x.material || '') || r.test(x.description || '') || (x.tags || []).some((t) => r.test(t))); }
    if (q.minPrice) l = l.filter((x) => x.price >= +q.minPrice);
    if (q.maxPrice) l = l.filter((x) => x.price <= +q.maxPrice);
    if (q.material) { const r = rx(q.material); l = l.filter((x) => r.test(x.material || '')); }
    if (q.featured) l = l.filter((x) => x.featured);
    if (q.ids) { const ids = q.ids.split(','); l = l.filter((x) => ids.includes(x._id)); }
    const S = { price_asc: (a, b) => a.price - b.price, price_desc: (a, b) => b.price - a.price, rating: (a, b) => b.ratingAvg - a.ratingAvg };
    l.sort(S[q.sort] || ((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))));
    const page = +q.page || 1, limit = Math.min(+q.limit || 24, 60);
    return { items: l.slice((page - 1) * limit, page * limit).map(pop), total: l.length, page, pages: Math.ceil(l.length / limit) };
  });
  on('GET', '/products/admin/all', ({ db, u }) => { needOwner(u); return db.products.map(pop).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))); });
  on('GET', '/products/:id/related', ({ p, db }) => { const x = db.products.find((y) => y._id === p.id || y.slug === p.id); if (!x) throw E('Product not found', 404); return db.products.filter((y) => y.category === x.category && y._id !== x._id && y.active !== false).slice(0, 8).map(pop); });
  on('GET', '/products/:id', ({ p, db }) => { const x = db.products.find((y) => (y._id === p.id || y.slug === p.id) && y.active !== false); if (!x) throw E('Product not found', 404); return pop(x); });
  on('POST', '/products', ({ b, u, db }) => {
    needOwner(u); if (!b.name || !b.category || b.price == null) throw E('Name, category and price are required');
    const d = { _id: uid(), active: true, stock: 0, images: [], madeToOrderDays: 0, customizationOptions: [], ratingAvg: 0, ratingCount: 0, createdAt: now(), ...b, slug: slug(b.name) + '-' + Math.random().toString(36).slice(2, 6) };
    db.products.push(d); act(u, 'Added product', d.name); return d;
  });
  on('PUT', '/products/:id', ({ p, b, u, db }) => { needOwner(u); const d = db.products.find((x) => x._id === p.id); if (!d) throw E('Product not found', 404); const { slug: _s, ...rest } = b; Object.assign(d, rest); act(u, 'Updated product', d.name); return d; });
  on('DELETE', '/products/:id', ({ p, u, db }) => { needOwner(u); db.products = db.products.filter((x) => x._id !== p.id); act(u, 'Deleted product', p.id); return {}; });

  // ---------- auth ----------
  on('POST', '/auth/signup', ({ b, db }) => {
    if (!b.name || !b.email || !b.password) throw E('Name, email and password required');
    if (b.password.length < 6) throw E('Password must be at least 6 characters');
    const email = b.email.toLowerCase();
    if (db.users.find((x) => x.email === email)) throw E('Email already registered', 409);
    const u = { id: uid(), name: b.name, email, phone: b.phone, password: b.password, role: 'user', addresses: [], wishlist: [] };
    db.users.push(u); return { token: 'u:' + u.id, user: safe(u), message: 'Account created' };
  });
  on('POST', '/auth/login', ({ b, db }) => { const u = db.users.find((x) => x.email === String(b.email || '').toLowerCase() && x.password === b.password); if (!u) throw E('Invalid email or password', 401); return { token: 'u:' + u.id, user: safe(u) }; });
  on('POST', '/auth/owner-login', ({ b, db }) => { if (String(b.username || '').toLowerCase() !== db.owner.username || b.password !== db.owner.password) throw E('Invalid username or password', 401); return { token: 'demo-owner', user: safe(db.owner) }; });
  on('GET', '/auth/me', ({ u }) => ({ user: safe(needUser(u)) }));
  on('PUT', '/auth/profile', ({ b, u }) => { needUser(u); if (b.name) u.name = b.name; if (b.phone !== undefined) u.phone = b.phone; if (Array.isArray(b.addresses)) u.addresses = b.addresses.slice(0, 5); return { user: safe(u) }; });
  on('PUT', '/auth/change-password', ({ b, u }) => { needUser(u); if (!b.newPassword || b.newPassword.length < 6) throw E('New password must be at least 6 characters'); if (u.password !== b.currentPassword) throw E('Current password is wrong', 401); u.password = b.newPassword; return { message: 'Password changed' }; });
  on('POST', '/auth/forgot-password', () => ({ message: 'Demo mode: emails are not sent. Create a new account or use the owner demo login.' }));
  on('POST', '/auth/reset-password', () => { throw E('Password reset needs the real backend (email is not available in demo mode)'); });
  on('POST', '/auth/verify-email', () => ({ message: 'Email verified' }));
  on('POST', '/auth/resend-verification', () => ({ message: 'Demo mode: verification is not needed' }));

  // ---------- wishlist ----------
  on('GET', '/cart/wishlist', ({ u, db }) => { needUser(u); return db.products.filter((p) => (u.wishlist || []).includes(p._id)).map(pop); });
  on('POST', '/cart/wishlist/:id', ({ p, u }) => { needUser(u); u.wishlist = u.wishlist || []; const has = u.wishlist.includes(p.id); u.wishlist = has ? u.wishlist.filter((x) => x !== p.id) : [...u.wishlist, p.id]; return { wishlisted: !has, wishlist: u.wishlist }; });

  // ---------- orders ----------
  function quote(db, b, method) {
    if (!Array.isArray(b.items) || !b.items.length) throw E('Cart is empty');
    const s = db.settings, sh = s.shipping;
    const lines = b.items.map((i) => {
      const p = db.products.find((x) => x._id === i.productId && x.active !== false); if (!p) throw E('A product in your cart is no longer available');
      const qty = Math.max(1, parseInt(i.qty) || 1); if (!p.madeToOrderDays && p.stock < qty) throw E(`${p.name}: only ${p.stock} left in stock`);
      const cz = (i.customization || []).filter((x) => x && x.label && x.value); let unit = p.price;
      cz.forEach((x) => { const o = (p.customizationOptions || []).find((o) => o.label === x.label); if (o) unit += o.extraPrice || 0; });
      return { product: p._id, name: p.name, image: p.images?.[0]?.url, price: unit, qty, madeToOrderDays: p.madeToOrderDays, customization: cz };
    });
    const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0); let shipping = sh.charge, codOk = sh.codEnabled;
    if (b.pincode || b.requirePin) {
      if (!/^\d{6}$/.test(String(b.pincode || ''))) throw E('Valid 6-digit pincode required');
      const pin = db.pincodes.find((x) => x.pincode === b.pincode);
      if (db.pincodes.length && (!pin || !pin.serviceable)) throw E('Sorry, delivery is not available at this pincode');
      if (pin) { if (pin.shippingCharge != null && pin.shippingCharge !== '') shipping = pin.shippingCharge; if (pin.codAvailable === false) codOk = false; }
    }
    if (sh.freeAbove > 0 && subtotal >= sh.freeAbove) shipping = 0;
    if (method === 'COD' && !codOk) throw E('Cash on Delivery is not available for this order');
    const codCharge = method === 'COD' ? sh.codCharge || 0 : 0, giftWrapCharge = b.giftWrap ? s.giftWrapPrice || 0 : 0;
    let discount = 0, couponCode;
    if (b.couponCode) {
      const c = db.coupons.find((x) => x.code === String(b.couponCode).trim().toUpperCase() && x.active !== false);
      if (!c) throw E('Invalid coupon code'); if (c.expiresAt && new Date(c.expiresAt) < new Date()) throw E('Coupon has expired');
      if (c.usageLimit && c.used >= c.usageLimit) throw E('Coupon usage limit reached'); if (subtotal < (c.minOrder || 0)) throw E(`Minimum order Rs ${c.minOrder} required for this coupon`);
      discount = c.type === 'percent' ? (subtotal * c.value) / 100 : c.value; if (c.type === 'percent' && c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
      discount = Math.round(Math.min(discount, subtotal)); couponCode = c.code;
    }
    return { lines, subtotal, shipping, codCharge, giftWrapCharge, discount, total: subtotal + shipping + codCharge + giftWrapCharge - discount, codAvailable: codOk, couponCode };
  }
  function finalize(db, o) {
    if (o.finalized) return; o.finalized = true; o.invoiceNo = 'INV-' + o.orderNo;
    o.items.filter((i) => !i.madeToOrderDays).forEach((i) => { const p = db.products.find((x) => x._id === i.product); if (p) p.stock = Math.max(0, p.stock - i.qty); });
    if (o.couponCode) { const c = db.coupons.find((x) => x.code === o.couponCode); if (c) c.used++; }
  }
  const demoRz = (o) => ({ demo: true, orderId: o._id, amount: Math.round(o.total * 100), currency: 'INR' });
  const ownOrder = (db, id, u) => { const o = db.orders.find((x) => x._id === id); if (!o || (u.role !== 'owner' && o.user !== u.id)) throw E('Order not found', 404); return o; };

  on('POST', '/orders/quote', ({ b, db }) => quote(db, b, b.paymentMethod));
  on('POST', '/orders', ({ b, u, db }) => {
    needUser(u); const a = b.address || {};
    if (!['COD', 'Online'].includes(b.paymentMethod)) throw E('Choose a payment method');
    for (const k of ['name', 'phone', 'line1', 'city', 'pincode']) if (!a[k]) throw E(`Address: ${k} is required`);
    const q = quote(db, { ...b, pincode: a.pincode, giftWrap: b.gift?.wrap, requirePin: true }, b.paymentMethod);
    const o = { _id: uid(), orderNo: 'WC' + Date.now().toString(36).toUpperCase(), user: u.id, items: q.lines, address: { name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pincode: a.pincode }, subtotal: q.subtotal, shipping: q.shipping, codCharge: q.codCharge, giftWrapCharge: q.giftWrapCharge, discount: q.discount, total: q.total, couponCode: q.couponCode, gift: { wrap: !!b.gift?.wrap, message: String(b.gift?.message || '').slice(0, 300) }, note: String(b.note || '').slice(0, 500), paymentMethod: b.paymentMethod, paymentStatus: 'Pending', status: 'Placed', statusHistory: [{ status: 'Placed', at: now() }], finalized: false, createdAt: now() };
    db.orders.push(o); if (b.paymentMethod === 'COD') { finalize(db, o); return { order: o }; } return { order: o, razorpay: demoRz(o) };
  });
  on('POST', '/payment/verify', ({ b, u, db }) => { needUser(u); const o = ownOrder(db, b.demo_order, u); o.paymentStatus = 'Paid'; o.paidAt = now(); finalize(db, o); return { message: 'Payment successful', order: o }; });
  on('POST', '/payment/retry/:id', ({ p, u, db }) => { needUser(u); const o = ownOrder(db, p.id, u); if (o.paymentStatus === 'Paid' || o.status === 'Cancelled') throw E('Order cannot be paid'); return { order: o, razorpay: demoRz(o) }; });
  on('GET', '/orders/my', ({ u, db }) => { needUser(u); return db.orders.filter((o) => o.user === u.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); });
  on('GET', '/orders/admin/all', ({ q, u, db }) => {
    needOwner(u); let l = db.orders.filter((o) => q.all || o.finalized);
    if (q.status) l = l.filter((o) => o.status === q.status); if (q.q) { const r = rx(q.q); l = l.filter((o) => r.test(o.orderNo)); }
    l.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); const page = +q.page || 1, limit = +q.limit || 30;
    return { items: l.slice((page - 1) * limit, page * limit), total: l.length, pages: Math.ceil(l.length / limit) };
  });
  on('PUT', '/orders/admin/:id/status', ({ p, b, u, db }) => {
    needOwner(u); const o = db.orders.find((x) => x._id === p.id); if (!o) throw E('Order not found', 404);
    if (b.status && b.status !== o.status) { o.status = b.status; o.statusHistory.push({ status: b.status, note: b.note, at: now() }); if (b.status === 'Delivered' && o.paymentMethod === 'COD') o.paymentStatus = 'Paid'; }
    if (b.paymentStatus) o.paymentStatus = b.paymentStatus; if (b.trackingId !== undefined) o.trackingId = b.trackingId;
    act(u, 'Order update', `${o.orderNo}: ${b.status || b.paymentStatus || ''}`);
    return { order: o, waLink: `https://wa.me/91${String(o.address.phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`WhimsyCharm: Your order ${o.orderNo} is now ${o.status}.`)}` };
  });
  on('GET', '/orders/:id', ({ p, u, db }) => ownOrder(db, p.id, needUser(u)));
  on('PUT', '/orders/:id/cancel', ({ p, b, u, db }) => {
    const o = ownOrder(db, p.id, needUser(u)); if (!['Placed', 'Packed'].includes(o.status)) throw E('This order can no longer be cancelled. Please raise a return request after delivery.');
    o.status = 'Cancelled'; o.statusHistory.push({ status: 'Cancelled', note: b.reason, at: now() }); if (o.paymentStatus === 'Paid') o.paymentStatus = 'Refund Pending';
    if (o.finalized) o.items.filter((i) => !i.madeToOrderDays).forEach((i) => { const x = db.products.find((y) => y._id === i.product); if (x) x.stock += i.qty; }); return o;
  });
  on('GET', '/orders/:id/invoice', ({ p, u, db }) => {
    const o = ownOrder(db, p.id, needUser(u)), s = db.settings; if (!o.finalized) throw E('Invoice available after order confirmation');
    return { html: `<!doctype html><meta charset="utf-8"><title>${esc(o.invoiceNo)}</title><body style="font-family:Arial,sans-serif;max-width:680px;margin:30px auto;color:#2a2331"><h1 style="color:#8a650c">${esc(s.invoice?.businessName || s.businessName)}</h1><h2>INVOICE ${esc(o.invoiceNo)}</h2><p>Order ${esc(o.orderNo)} · ${new Date(o.createdAt).toLocaleDateString('en-IN')}<br>Payment: ${esc(o.paymentMethod)} (${esc(o.paymentStatus)})</p><p><b>Bill to:</b> ${esc(o.address.name)}, ${esc(o.address.phone)}<br>${esc(o.address.line1)}, ${esc(o.address.city)} - ${esc(o.address.pincode)}</p><table width="100%" cellpadding="6" border="1" style="border-collapse:collapse">${o.items.map((i) => `<tr><td>${esc(i.name)} × ${i.qty}</td><td align="right">₹${i.price * i.qty}</td></tr>`).join('')}</table><p align="right">Subtotal ₹${o.subtotal}<br>Shipping ₹${o.shipping}<br>${o.discount ? `Discount −₹${o.discount}<br>` : ''}<b>Total ₹${o.total}</b></p><p style="color:#777">Demo invoice. Handmade with love.</p></body>` };
  });

  // ---------- reviews ----------
  on('GET', '/reviews', ({ db }) => db.reviews.filter((r) => r.status === 'approved').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => ({ ...r, product: (({ name, slug }) => ({ name, slug }))(db.products.find((p) => p._id === r.product) || {}) })));
  on('GET', '/reviews/product/:id', ({ p, db }) => db.reviews.filter((r) => r.product === p.id && r.status === 'approved'));
  on('POST', '/reviews', ({ b, u, db }) => {
    needUser(u); if (!db.products.find((x) => x._id === b.productId)) throw E('Product not found', 404);
    if (db.reviews.find((r) => r.product === b.productId && r.user === u.id)) throw E('You have already reviewed this product', 409);
    const r = { _id: uid(), product: b.productId, user: u.id, name: u.name, rating: +b.rating, comment: String(b.comment || '').slice(0, 1000), photos: (b.photos || []).slice(0, 4), verifiedBuyer: db.orders.some((o) => o.user === u.id && o.status === 'Delivered' && o.items.some((i) => i.product === b.productId)), status: 'pending', createdAt: now() };
    db.reviews.push(r); return { review: r, message: 'Thank you! Your review will appear after approval.' };
  });
  on('GET', '/reviews/admin/all', ({ q, u, db }) => { needOwner(u); return db.reviews.filter((r) => !q.status || r.status === q.status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((r) => ({ ...r, product: { name: db.products.find((p) => p._id === r.product)?.name } })); });
  on('PUT', '/reviews/admin/:id', ({ p, b, u, db }) => { needOwner(u); const r = db.reviews.find((x) => x._id === p.id); if (!r) throw E('Review not found', 404); r.status = b.status; recalc(r.product); act(u, 'Review ' + b.status, r._id); return r; });
  on('DELETE', '/reviews/admin/:id', ({ p, u, db }) => { needOwner(u); const r = db.reviews.find((x) => x._id === p.id); db.reviews = db.reviews.filter((x) => x._id !== p.id); if (r) recalc(r.product); return {}; });

  // ---------- coupons validate, enquiries ----------
  on('POST', '/coupons/validate', ({ b, db }) => { const q = quote(db, { items: [{ productId: db.products[0]._id, qty: 1 }], couponCode: b.code }, 'Online'); return { code: q.couponCode, discount: q.discount }; });
  [['/custom-orders', 'customOrders', 'New', 'custom order'], ['/bulk', 'bulk', 'New', 'bulk enquiry'], ['/returns', 'returns', 'Requested', 'return request']].forEach(([base, key, st, label]) => {
    on('POST', base, ({ b, u, db }) => {
      if (key === 'returns') { needUser(u); const o = db.orders.find((x) => x._id === b.orderId && x.user === u.id); if (!o) throw E('Order not found', 404); if (o.status !== 'Delivered') throw E('Return can be requested only after delivery'); b = { ...b, orderNo: o.orderNo }; } else if (!b.name || !b.phone) throw E('Name and phone are required');
      const d = { _id: uid(), user: u?.id, status: st, createdAt: now(), ...b }; db[key].push(d);
      return key === 'returns' ? { message: 'Return request submitted', request: d } : { message: 'Request received! We will contact you soon.', id: d._id };
    });
    on('GET', base, ({ q, u, db }) => { needOwner(u); return db[key].filter((x) => !q.status || x.status === q.status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((x) => ({ ...x, user: x.user ? { name: db.users.find((y) => y.id === x.user)?.name } : undefined })); });
    on('PUT', base + '/:id', ({ p, b, u, db }) => { needOwner(u); const d = db[key].find((x) => x._id === p.id); if (!d) throw E('Not found', 404); d.status = b.status; d.ownerNote = b.ownerNote; act(u, 'Updated ' + label, `${d._id} -> ${b.status}`); return d; });
    on('DELETE', base + '/:id', ({ p, u, db }) => { needOwner(u); db[key] = db[key].filter((x) => x._id !== p.id); return {}; });
  });
  on('GET', '/returns/mine', ({ u, db }) => { needUser(u); return db.returns.filter((r) => r.user === u.id).map((r) => ({ ...r, order: r.orderId })); });

  // ---------- dashboard, chatbot, upload ----------
  on('GET', '/dashboard', ({ u, db }) => {
    needOwner(u); const fin = db.orders.filter((o) => o.finalized), earned = fin.filter((o) => o.status !== 'Cancelled' && (o.paymentStatus === 'Paid' || (o.paymentMethod === 'COD' && o.status === 'Delivered')));
    const since = Date.now() - 30 * 864e5, days = {};
    earned.filter((o) => new Date(o.createdAt) >= since).forEach((o) => { const k = o.createdAt.slice(0, 10); days[k] = days[k] || { _id: k, sales: 0, orders: 0 }; days[k].sales += o.total; days[k].orders++; });
    const open = (a) => a.filter((x) => ['New', 'Requested'].includes(x.status)).length;
    return { totalOrders: fin.length, pendingOrders: fin.filter((o) => ['Placed', 'Packed'].includes(o.status)).length, totalSales: earned.reduce((a, o) => a + o.total, 0), daily: Object.values(days).sort((a, b) => a._id.localeCompare(b._id)), pendingReviews: db.reviews.filter((r) => r.status === 'pending').length, newCustomOrders: open(db.customOrders), newBulkEnquiries: open(db.bulk), openReturns: open(db.returns), lowStock: db.products.filter((p) => p.active !== false && !p.madeToOrderDays && p.stock <= 3).map((p) => ({ name: p.name, stock: p.stock })).slice(0, 10), recentOrders: [...fin].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6), customers: db.users.length, subscribers: db.subscribers.length };
  });
  on('GET', '/dashboard/activity', ({ u, db }) => { needOwner(u); return db.activity.slice(0, 200); });
  on('POST', '/chatbot', ({ b, db }) => {
    const words = String(b.message || '').toLowerCase().split(/\W+/).filter((w) => w.length > 2); if (!words.length) throw E('Message required');
    const hits = db.products.filter((p) => p.active !== false && words.some((w) => `${p.name} ${p.material} ${catOf(p.category)?.name} ${(p.tags || []).join(' ')}`.toLowerCase().includes(w))).slice(0, 3);
    return { reply: hits.length ? `You might like: ${hits.map((p) => `${p.name} (₹${p.price})`).join(', ')}. Tap any product on the site to see details. (Demo assistant)` : 'We make resin art, pipe cleaner flowers, clay creations and concrete décor. Tell me the occasion or your budget and I will suggest something! (Demo assistant)' };
  });
  const readFile = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(E('Could not read the file')); r.readAsDataURL(f); });
  const shrink = (url) => new Promise((res) => { const i = new Image(); i.onload = () => { const k = Math.min(1, 900 / Math.max(i.width, i.height)), c = document.createElement('canvas'); c.width = Math.round(i.width * k); c.height = Math.round(i.height * k); c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', 0.82)); }; i.onerror = () => res(url); i.src = url; });
  on('POST', '/upload', async ({ b, u }) => {
    needUser(u); const f = b.get && b.get('file'); if (!f) throw E('No file received');
    const vid = f.type.startsWith('video/'); if (!vid && !f.type.startsWith('image/')) throw E('Only images or videos are allowed');
    if (vid && f.size > 2 * 1024 * 1024) throw E('In demo mode videos must be under 2 MB');
    let url = await readFile(f); if (!vid) url = await shrink(url); return { url, publicId: 'demo_' + uid(), type: vid ? 'video' : 'image' };
  });
  on('DELETE', '/upload', () => ({ message: 'Deleted' }));

  async function handle(method, fullPath, body, token) {
    load(); const [path, qs] = fullPath.split('?'), q = Object.fromEntries(new URLSearchParams(qs || ''));
    for (const [m, re, fn] of R) {
      if (m !== method) continue; const mt = re.exec(path); if (!mt) continue;
      const r = await fn({ p: mt.groups || {}, q, b: body ?? {}, u: who(token), db });
      if (method !== 'GET') persist();
      return r === undefined ? {} : JSON.parse(JSON.stringify(r));
    }
    throw E('Not found', 404);
  }
  window.MockAPI = { handle, reset: () => { localStorage.removeItem(KEY); location.reload(); } };
})();
