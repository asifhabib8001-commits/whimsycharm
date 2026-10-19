(async () => {
  const s = await Settings.applyPage('about', 'Our Story'), e = UI.esc;
  UI.mount(`<div class="container section"><h1 class="center">Our story</h1><div class="divider"></div><div class="prose">${(s.about || '').split(/\n{2,}/).map((p) => `<p style="font-size:var(--fs-lg)">${e(p)}</p>`).join('')}<p class="gold-text" style="font-family:var(--font-head);font-size:var(--fs-xl)">— ${e(s.ownerNames || '')}</p></div>
  <div class="love" style="margin-top:var(--s-6)"><div class="card reveal"><div class="ico">✦</div><h3>Handmade with love</h3><p class="muted">Patience and detail in every piece.</p></div><div class="card reveal"><div class="ico">✦</div><h3>Four crafts</h3><p class="muted">Resin, pipe cleaner flowers, clay and concrete.</p></div><div class="card reveal"><div class="ico">✦</div><h3>Made for you</h3><p class="muted">Custom orders are always welcome.</p></div></div>
  <div class="hero-cta" style="margin-top:var(--s-6)"><a class="btn btn-gold" href="index.html">Shop our creations</a><a class="btn btn-outline" href="custom-order.html">Order something custom</a></div></div>`);
})();
