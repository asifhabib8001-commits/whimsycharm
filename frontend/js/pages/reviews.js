(async () => {
  await Settings.applyPage('reviews', 'Reviews'); const e = UI.esc;
  UI.mount('<div class="container section"><h1 class="center">Customer reviews</h1><div class="divider"></div><div class="prose"><div id="rl">' + UI.skel(2) + '</div><div id="rf" style="margin-top:var(--s-6)"></div></div></div>');
  try { const rs = await API.get('/reviews'); $('#rl').innerHTML = rs.length ? rs.map((r) => `<div class="review"><div class="rating">${UI.stars(r.rating)}</div><b>${e(r.name)}</b> ${r.verifiedBuyer ? '<span class="badge ok">Verified buyer</span>' : ''} <small class="muted">on <a class="gold-text" href="product.html?p=${e(r.product?.slug)}">${e(r.product?.name)}</a></small><p>${e(r.comment || '')}</p>${r.photos?.length ? `<div class="thumbs">${r.photos.map((f) => `<span class="thumb" data-lb="${e(f.url)}"><img src="${e(f.url)}" alt="Review photo" loading="lazy"></span>`).join('')}</div>` : ''}</div>`).join('') : '<div class="empty"><p>No reviews yet. Be the first to share your experience!</p></div>'; } catch (x) { $('#rl').innerHTML = `<p>${e(x.message)}</p>`; }
  $('#rl').addEventListener('click', (ev) => { const t = ev.target.closest('[data-lb]'); if (t) UI.lightbox([{ type: 'image', url: t.dataset.lb }]); });
  const ps = await API.get('/products?limit=60').catch(() => ({ items: [] })); UI.reviewBox($('#rf'), { products: ps.items });
})();
