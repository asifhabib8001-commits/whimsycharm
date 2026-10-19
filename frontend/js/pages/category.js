(async () => {
  await Settings.applyPage('category', 'Shop');
  const e = UI.esc, st = { c: UI.qs('c') || '', q: UI.qs('q') || '', sort: '', min: '', max: '', material: '', page: 1 };
  let cat = null; if (st.c) cat = await API.get('/categories/slug/' + encodeURIComponent(st.c)).catch(() => null);
  const cats = await API.get('/categories').catch(() => []);
  document.title = (cat ? cat.name : st.q ? `Search: ${st.q}` : 'All products') + ' | WhimsyCharm';
  UI.mount(`<div class="container"><div class="crumbs"><a href="index.html">Home</a> / ${e(cat ? cat.name : st.q ? 'Search' : 'All products')}</div>
    <div class="page-title"><h1>${e(cat ? cat.name : st.q ? `Results for “${st.q}”` : 'All products')}</h1><p class="muted" id="cnt"></p></div>
    <div class="pill-row" style="margin-bottom:var(--s-4)"><a class="chip ${!st.c ? 'active' : ''}" href="category.html">All</a>${cats.map((x) => `<a class="chip ${x.slug === st.c ? 'active' : ''}" href="category.html?c=${e(x.slug)}">${e(x.name)}</a>`).join('')}</div>
    <form class="filters" id="f"><div class="field"><label for="fq">Search</label><input id="fq" type="search" value="${e(st.q)}" placeholder="Name or material"></div>
      <div class="field"><label for="fs">Sort by</label><select id="fs"><option value="">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="rating">Top rated</option></select></div>
      <div class="field"><label for="fmin">Min ₹</label><input id="fmin" type="number" min="0" inputmode="numeric"></div><div class="field"><label for="fmax">Max ₹</label><input id="fmax" type="number" min="0" inputmode="numeric"></div>
      <div class="field"><label for="fm">Material</label><input id="fm" type="text" placeholder="e.g. resin"></div><button class="btn btn-gold">Apply</button></form>
    <div id="list">${UI.skel(8)}</div><div class="load-more" id="more" hidden><button class="btn btn-outline">Load more</button></div></div>`);
  let items = [];
  async function load(reset) {
    if (reset) { st.page = 1; items = []; $('#list').innerHTML = UI.skel(8); }
    const p = new URLSearchParams({ page: st.page, limit: 12 }); ['c:category', 'q:q', 'sort:sort', 'min:minPrice', 'max:maxPrice', 'material:material'].forEach((k) => { const [a, b] = k.split(':'); if (st[a]) p.set(b, st[a]); });
    try {
      const d = await API.get('/products?' + p); items = items.concat(d.items); $('#cnt').textContent = `${d.total} product${d.total === 1 ? '' : 's'}`;
      $('#list').innerHTML = items.length ? `<div class="grid">${items.map(UI.productCard).join('')}</div>` : '<div class="empty"><h3>No products found</h3><p>Try different filters or search words.</p></div>';
      $('#more').hidden = st.page >= d.pages; UI.after($('#list'));
    } catch (x) { $('#list').innerHTML = `<div class="empty"><p>${e(x.message)}</p></div>`; }
  }
  $('#f').addEventListener('submit', (ev) => { ev.preventDefault(); Object.assign(st, { q: $('#fq').value.trim(), sort: $('#fs').value, min: $('#fmin').value, max: $('#fmax').value, material: $('#fm').value.trim() }); load(true); });
  $('#more button').addEventListener('click', () => { st.page++; load(); });
  load(true);
})();
