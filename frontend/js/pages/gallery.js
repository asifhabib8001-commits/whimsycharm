(async () => {
  await Settings.applyPage('gallery', 'Behind the scenes'); const e = UI.esc;
  UI.mount('<div class="container section"><h1 class="center">Behind the scenes</h1><p class="center muted">Handmade with love, one piece at a time.</p><div class="divider"></div><div id="g">' + UI.skel(4) + '</div></div>');
  try {
    const it = await API.get('/gallery');
    $('#g').innerHTML = it.length ? `<div class="gal-grid">${it.map((x, i) => `<button data-i="${i}" aria-label="${e(x.title || 'Open')}">${x.type === 'video' ? `<video src="${e(x.url)}" muted preload="metadata"></video><span style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:2rem;background:rgba(0,0,0,.25)">▶</span>` : `<img src="${e(x.url)}" alt="${e(x.title || '')}" loading="lazy">`}</button>`).join('')}</div>` : '<div class="empty"><p>Photos coming soon ✨</p></div>';
    $('#g').addEventListener('click', (ev) => { const b = ev.target.closest('[data-i]'); if (b) UI.lightbox(it, +b.dataset.i); });
  } catch (x) { $('#g').innerHTML = `<p>${e(x.message)}</p>`; }
})();
