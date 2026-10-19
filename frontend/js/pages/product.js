(async () => {
  const e = UI.esc, slug = UI.qs('p');
  if (!slug) return (location.href = 'category.html');
  await Settings.applyPage('product');
  UI.mount(`<div class="container section">${UI.skel(2)}</div>`);
  let p;
  try { p = await API.get('/products/' + encodeURIComponent(slug)); } catch { return UI.mount('<div class="empty"><h3>Product not found</h3><a class="btn btn-gold" href="category.html">Browse products</a></div>'); }
  UI.reg[p._id] = p; UI.recent(p._id);
  document.title = `${p.name} | WhimsyCharm`;
  const md = document.querySelector('meta[name=description]') || Object.assign(document.head.appendChild(document.createElement('meta')), { name: 'description' }); md.content = (p.description || p.name).slice(0, 155);
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.images.map((i) => i.url), description: p.description, offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: p.stock > 0 || p.madeToOrderDays ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }, ...(p.ratingCount && { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.ratingAvg, reviewCount: p.ratingCount } }) });
  document.head.appendChild(ld);

  const media = [...p.images.map((i) => ({ type: 'image', url: i.url })), ...(p.video?.url ? [{ type: 'video', url: p.video.url }] : [])];
  const out = p.stock <= 0 && !p.madeToOrderDays, off = p.mrp > p.price ? Math.round(100 - (p.price / p.mrp) * 100) : 0;
  const opts = (p.customizationOptions || []).map((o, i) => {
    const x = o.extraPrice ? ` (+${UI.money(o.extraPrice)})` : '';
    const inp = o.choices?.length ? `<select id="cz${i}"><option value="">Choose…</option>${o.choices.map((c) => `<option>${e(c)}</option>`).join('')}</select>` : `<input id="cz${i}" type="text" maxlength="100" placeholder="${o.type === 'color' ? 'Colour name' : 'Type here'}">`;
    return `<div class="field"><label for="cz${i}">${e(o.label)}${x}</label>${inp}</div>`;
  }).join('');
  UI.mount(`<div class="container"><div class="crumbs"><a href="index.html">Home</a> / <a href="category.html?c=${e(p.category?.slug || '')}">${e(p.category?.name || 'Shop')}</a> / ${e(p.name)}</div>
  <div class="pd"><div><div class="gallery-main" id="gm" tabindex="0" role="button" aria-label="Open image full screen"></div><div class="gallery-thumbs" id="gt"></div></div>
  <div class="pd-info"><h1>${e(p.name)}</h1>${p.ratingCount ? `<div class="rating">${UI.stars(p.ratingAvg)} <small>${p.ratingAvg} (${p.ratingCount} reviews)</small></div>` : ''}
    <div class="pd-price"><b id="pr">${UI.money(p.price)}</b>${off ? `<s>${UI.money(p.mrp)}</s><span class="badge ok">${off}% off</span>` : ''}</div>
    <div class="pd-badges">${out ? '<span class="badge bad">Out of stock</span>' : p.madeToOrderDays ? `<span class="badge warn">Made to order · Ready in ${p.madeToOrderDays} days</span>` : p.stock <= 5 ? `<span class="badge warn">Only ${p.stock} left</span>` : '<span class="badge ok">In stock</span>'}${p.material ? `<span class="badge">${e(p.material)}</span>` : ''}</div>
    <div id="custom">${opts ? `<h3>Customize</h3>${opts}` : ''}</div>
    <div class="field"><span class="label">Quantity</span><div class="qty"><button type="button" id="qm" aria-label="Decrease">−</button><span id="qv">1</span><button type="button" id="qp" aria-label="Increase">+</button></div></div>
    <div class="pd-actions"><button class="btn btn-gold" id="add" ${out ? 'disabled' : ''}>Add to Cart</button><button class="btn btn-outline" id="buy" ${out ? 'disabled' : ''}>Buy Now</button><button class="btn btn-lav wish" data-wish="${p._id}" aria-label="Wishlist">♡</button></div>
    ${p.giftWrapAvailable ? '<p class="muted" style="font-size:var(--fs-sm)">🎁 Gift wrap &amp; gift message available at checkout.</p>' : ''}
    <div class="field"><label for="pin">Check delivery</label><div class="pin-check"><input id="pin" inputmode="numeric" maxlength="6" placeholder="6-digit pincode"><button class="btn btn-lav" id="pinb" type="button">Check</button></div><div id="pinr" class="hint" aria-live="polite"></div></div></div></div>
  ${p.description ? `<section class="pd-section prose"><h2>About this piece</h2><p>${e(p.description).replace(/\n/g, '<br>')}</p></section>` : ''}
  ${p.careInstructions ? `<section class="pd-section prose"><h2>Care instructions</h2><p>${e(p.careInstructions).replace(/\n/g, '<br>')}</p></section>` : ''}
  <section class="pd-section prose"><h2>Reviews</h2><div id="rv"><div class="skel" style="height:80px"></div></div><div id="rvf" style="margin-top:var(--s-4)"></div></section>
  <section class="pd-section" id="rel" hidden><h2>You may also like</h2><div class="grid" id="relg"></div></section></div>`);

  let cur = 0;
  const gm = $('#gm'), paint = () => {
    const m = media[cur]; gm.innerHTML = m ? (m.type === 'video' ? `<video src="${e(m.url)}" controls playsinline></video>` : `<img src="${e(m.url)}" alt="${e(p.name)}">`) : '<div class="shimmer" style="height:100%"></div>';
    $$('#gt button').forEach((b, i) => b.classList.toggle('active', i === cur));
  };
  $('#gt').innerHTML = media.length > 1 ? media.map((m, i) => `<button data-i="${i}" aria-label="Photo ${i + 1}">${m.type === 'video' ? '<span style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;background:rgba(0,0,0,.4)">▶</span>' : `<img src="${e(m.url)}" alt="" loading="lazy">`}</button>`).join('') : '';
  $('#gt').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) { cur = +b.dataset.i; paint(); } });
  gm.addEventListener('mousemove', (ev) => { const im = $('img', gm); if (im) { const r = gm.getBoundingClientRect(); im.style.transformOrigin = `${((ev.clientX - r.left) / r.width) * 100}% ${((ev.clientY - r.top) / r.height) * 100}%`; } });
  gm.addEventListener('click', () => media[cur] && media[cur].type !== 'video' && UI.lightbox(media, cur));
  gm.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') gm.click(); });
  paint(); UI.after();

  let qty = 1;
  const upd = () => { $('#qv').textContent = qty; let u = p.price; (p.customizationOptions || []).forEach((o, i) => { if ($('#cz' + i)?.value) u += o.extraPrice || 0; }); $('#pr').textContent = UI.money(u); };
  $('#qm').onclick = () => { qty = Math.max(1, qty - 1); upd(); }; $('#qp').onclick = () => { qty = Math.min(20, qty + 1); upd(); };
  $$('#custom select,#custom input').forEach((i) => i.addEventListener('input', upd));
  const cz = () => (p.customizationOptions || []).map((o, i) => ({ label: o.label, value: $('#cz' + i)?.value.trim() })).filter((x) => x.value);
  $('#add').onclick = () => { Cart.add(p, qty, cz()); UI.toast('Added to cart', 'ok'); };
  $('#buy').onclick = () => Cart.buyNow(p, qty, cz());
  $('#pinb').onclick = async () => {
    const v = $('#pin').value.trim(), r = $('#pinr');
    try { const d = await API.get('/delivery/check/' + v); r.textContent = d.deliverable ? `✓ Delivery available${d.city ? ' in ' + d.city : ''}${d.etaDays ? ` · ~${d.etaDays} days` : ''} · Shipping ${d.shipping ? UI.money(d.shipping) : 'Free'} · COD ${d.cod ? 'available' : 'not available'}` : '✗ Sorry, we do not deliver to this pincode yet.'; } catch (x) { r.textContent = x.message; }
  };
  if (location.hash === '#custom') $('#custom').scrollIntoView();

  API.get(`/reviews/product/${p._id}`).then((rs) => { $('#rv').innerHTML = rs.length ? rs.map((r) => `<div class="review"><div class="rating">${UI.stars(r.rating)}</div><b>${e(r.name)}</b> ${r.verifiedBuyer ? '<span class="badge ok">Verified buyer</span>' : ''} <small class="muted">${UI.date(r.createdAt)}</small><p>${e(r.comment || '')}</p>${r.photos?.length ? `<div class="thumbs">${r.photos.map((f) => `<span class="thumb" data-lb="${e(f.url)}"><img src="${e(f.url)}" alt="Review photo" loading="lazy"></span>`).join('')}</div>` : ''}</div>`).join('') : '<p class="muted">No reviews yet. Be the first!</p>'; }).catch(() => {});
  $('#rv').addEventListener('click', (ev) => { const t = ev.target.closest('[data-lb]'); if (t) UI.lightbox([{ type: 'image', url: t.dataset.lb }]); });
  UI.reviewBox($('#rvf'), { productId: p._id });
  API.get(`/products/${p._id}/related`).then((r) => { if (r.length) { $('#rel').hidden = false; $('#relg').innerHTML = r.slice(0, 4).map(UI.productCard).join(''); UI.after($('#rel')); } }).catch(() => {});
})();
