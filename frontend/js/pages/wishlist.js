(async () => {
  await Settings.applyPage('wishlist', 'Wishlist');
  UI.mount('<div class="container section"><h1>My wishlist</h1><div id="wl">' + UI.skel(4) + '</div></div>');
  const empty = () => ($('#wl').innerHTML = '<div class="empty"><h3>Your wishlist is empty</h3><p>Tap the heart on any product to save it here.</p><a class="btn btn-gold" href="index.html">Explore</a></div>');
  const ids = Wishlist.ids(); if (!ids.length) return empty();
  try { const d = await API.get('/products?limit=60&ids=' + ids.join(',')); if (!d.items.length) return empty(); $('#wl').innerHTML = `<div class="grid">${d.items.map(UI.productCard).join('')}</div>`; UI.after($('#wl')); } catch (x) { $('#wl').innerHTML = `<div class="empty"><p>${UI.esc(x.message)}</p></div>`; }
  document.addEventListener('wish:changed', (ev) => { if (!ev.detail.on) { const b = document.querySelector(`[data-wish="${ev.detail.id}"]`); b?.closest('.pcard')?.remove(); if (!$('.pcard')) empty(); } });
})();
