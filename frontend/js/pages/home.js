(async () => {
  const s = await Settings.applyPage('home'), e = UI.esc, h = s.hero || {};
  const heroMedia = h.url ? (h.type === 'video' ? `<video src="${e(h.url)}" autoplay muted loop playsinline preload="metadata"></video>` : `<img src="${e(h.url)}" alt="">`) : '';
  UI.mount(`<section class="hero ${h.url ? '' : 'plain'}">${heroMedia}<div class="hero-text"><h1>${e(s.tagline || 'Handmade with a little magic')}</h1><p>Resin art · Pipe cleaner flowers · Clay · Concrete décor</p>
    <div class="hero-cta"><a class="btn btn-gold" href="#cats">Shop now</a><a class="btn btn-outline" style="background:var(--surface)" href="custom-order.html">Custom order</a></div></div></section>
    <div id="cats">${UI.skel(4)}</div><div id="recent"></div>
    <section class="section"><div class="container love"><div class="card reveal"><div class="ico">✦</div><h3>Handmade with love</h3><p class="muted">Every piece is shaped, poured and finished by hand.</p></div><div class="card reveal"><div class="ico">✦</div><h3>One of a kind</h3><p class="muted">Nothing is mass-produced, so no two pieces are alike.</p></div><div class="card reveal"><div class="ico">✦</div><h3>Made for you</h3><p class="muted">Custom colours, names and gift sets, just ask.</p></div></div>
    <div class="container" style="margin-top:var(--s-6)"><div class="insta reveal"><h2>Follow our journey</h2><p class="muted">Behind-the-scenes, new pieces and offers on Instagram.</p>${s.social?.instagram ? `<a class="btn btn-lav" href="${e(s.social.instagram)}" target="_blank" rel="noopener">Instagram</a> ` : ''}<a class="btn btn-outline" href="gallery.html">Behind the scenes</a></div></div></section>`);
  try {
    const cats = await API.get('/categories');
    const blocks = await Promise.all(cats.map(async (c) => ({ c, items: (await API.get(`/products?category=${encodeURIComponent(c.slug)}&limit=8`).catch(() => ({ items: [] }))).items })));
    $('#cats').innerHTML = blocks.length ? blocks.map(({ c, items }) => `<section class="cat-block"><div class="container"><div class="sec-head"><h2>${e(c.name)}</h2><a href="category.html?c=${e(c.slug)}">View all →</a></div>${items.length ? `<div class="grid">${items.map(UI.productCard).join('')}</div>` : '<p class="muted">New pieces coming soon ✨</p>'}</div></section>`).join('') : '<div class="empty"><h3>Our collection is being prepared</h3><p>Please visit again soon.</p></div>';
    UI.after($('#cats'));
  } catch (x) { $('#cats').innerHTML = `<div class="empty"><p>${e(x.message)}</p></div>`; }
  const rec = JSON.parse(localStorage.getItem('wc_recent') || '[]');
  if (rec.length) { try { const d = await API.get('/products?ids=' + rec.join(',')); if (d.items.length) { $('#recent').innerHTML = `<section class="cat-block"><div class="container"><div class="sec-head"><h2>Recently viewed</h2></div><div class="grid">${d.items.map(UI.productCard).join('')}</div></div></section>`; UI.after($('#recent')); } } catch { /* ignore */ } }
})();
