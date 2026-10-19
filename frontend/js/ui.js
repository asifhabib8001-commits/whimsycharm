const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ICON = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1z"/>',
  bag: '<path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', close: '<path d="M6 6l12 12M18 6 6 18"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>', moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
};
const UI = {
  reg: {},
  esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  money: (n) => '₹' + Number(n || 0).toLocaleString('en-IN'),
  qs: (k) => new URLSearchParams(location.search).get(k),
  icon: (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`,
  date: (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  debounce(fn, ms = 400) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
  stars: (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r)),
  mount(html) { const a = $('#app'); a.innerHTML = html; a.classList.add('page-enter'); this.after(a); },
  after(root = document) { this.reveal(root); $$('[data-wish]', root).forEach((b) => Wishlist.paint(b)); },
  reveal(root = document) {
    const els = $$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window)) return els.forEach((e) => e.classList.add('in'));
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -40px 0px' });
    els.forEach((e) => io.observe(e));
  },
  toast(msg, type = '') {
    let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; box.appendChild(t); setTimeout(() => t.remove(), 3600);
  },
  skel: (n = 4) => `<div class="grid">${'<div class="skel" style="aspect-ratio:3/4"></div>'.repeat(n)}</div>`,
  modal(html, { onClose } = {}) {
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><button class="modal-x" aria-label="Close">×</button>${html}</div>`;
    const close = () => { o.remove(); document.removeEventListener('keydown', esc); onClose && onClose(); };
    const esc = (e) => e.key === 'Escape' && close();
    o.addEventListener('click', (e) => { if (e.target === o || e.target.closest('.modal-x')) close(); });
    document.addEventListener('keydown', esc); document.body.appendChild(o);
    const f = o.querySelector('input,textarea,select,button:not(.modal-x)'); f && f.focus();
    return { el: o.firstElementChild, close };
  },
  lightbox(items, i = 0) {
    const o = document.createElement('div'); o.className = 'lightbox';
    const it = items[i]; o.innerHTML = `<button aria-label="Close">×</button>${it.type === 'video' ? `<video src="${UI.esc(it.url)}" controls autoplay></video>` : `<img src="${UI.esc(it.url)}" alt="">`}`;
    o.addEventListener('click', (e) => { if (e.target === o || e.target.tagName === 'BUTTON') o.remove(); });
    document.body.appendChild(o);
  },
  tag(p) {
    if (p.stock <= 0 && !p.madeToOrderDays) return '<span class="tag out">Out of stock</span>';
    if (p.madeToOrderDays) return `<span class="tag">Ready in ${p.madeToOrderDays} days</span>`;
    if (p.stock <= 5) return `<span class="tag warn">Only ${p.stock} left</span>`;
    return '';
  },
  productCard(p) {
    UI.reg[p._id] = p;
    const a = p.images?.[0]?.url, b = p.images?.[1]?.url, off = p.mrp > p.price ? Math.round(100 - (p.price / p.mrp) * 100) : 0;
    const url = 'product.html?p=' + encodeURIComponent(p.slug), out = p.stock <= 0 && !p.madeToOrderDays;
    return `<article class="pcard reveal"><a class="pcard-media" href="${url}" aria-label="${UI.esc(p.name)}">${UI.tag(p)}${a ? `<img class="img1" loading="lazy" src="${UI.esc(a)}" alt="${UI.esc(p.name)}">` : ''}${b ? `<img class="img2" loading="lazy" src="${UI.esc(b)}" alt="">` : ''}</a>
      <button class="wish-btn" data-wish="${p._id}" aria-label="Add to wishlist" aria-pressed="false">♡</button>
      <div class="pcard-body"><h3><a href="${url}">${UI.esc(p.name)}</a></h3>
      ${p.ratingCount ? `<div class="rating" aria-label="${p.ratingAvg} out of 5">${UI.stars(p.ratingAvg)} <small>(${p.ratingCount})</small></div>` : ''}
      <div class="price"><b>${UI.money(p.price)}</b>${off ? `<s>${UI.money(p.mrp)}</s><span class="off">${off}% off</span>` : ''}</div>
      <div class="pcard-actions"><button class="btn btn-gold btn-sm" data-add="${p._id}" ${out ? 'disabled' : ''}>Add to Cart</button><button class="btn btn-outline btn-sm" data-buy="${p._id}" ${out ? 'disabled' : ''}>Buy Now</button></div></div></article>`;
  },
  recent(p) { const r = JSON.parse(localStorage.getItem('wc_recent') || '[]').filter((x) => x !== p); r.unshift(p); localStorage.setItem('wc_recent', JSON.stringify(r.slice(0, 10))); },

  // Review form (product page + reviews page dono me)
  reviewBox(box, { productId, products } = {}) {
    if (!Auth.loggedIn) { box.innerHTML = `<p class="muted">To write a review, please <a class="gold-text" href="login.html?next=${encodeURIComponent(location.pathname.split('/').pop() + location.search)}"><b>log in</b></a>.</p>`; return; }
    const photos = [];
    box.innerHTML = `<form class="card" novalidate><h3>Write a review</h3>
      ${products ? `<div class="field"><label for="rv-p">Product</label><select id="rv-p" required><option value="">Select product</option>${products.map((p) => `<option value="${p._id}">${UI.esc(p.name)}</option>`).join('')}</select></div>` : ''}
      <div class="field"><span class="label">Your rating</span><div class="star-input">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="st${n}" value="${n}"><label for="st${n}" title="${n} stars">★</label>`).join('')}</div></div>
      <div class="field"><label for="rv-c">Your experience</label><textarea id="rv-c" maxlength="1000"></textarea></div>
      <div class="field"><label for="rv-f">Photos (optional, max 4)</label><input id="rv-f" type="file" accept="image/*" multiple><div class="thumbs" id="rv-l"></div></div>
      <div class="form-msg err" hidden></div><button class="btn btn-gold">Submit review</button><p class="hint muted" style="margin-top:8px">Your review will appear once it has been approved.</p></form>`;
    Upload.bind($('#rv-f', box), $('#rv-l', box), photos, 4, 'reviews');
    $('form', box).addEventListener('submit', async (e) => {
      e.preventDefault(); const err = $('.form-msg', box); err.hidden = true;
      const pid = productId || $('#rv-p', box)?.value, rating = $('input[name=rating]:checked', box)?.value;
      if (!pid || !rating) { err.textContent = 'Please choose a product and a rating'; err.hidden = false; return; }
      try { const d = await API.post('/reviews', { productId: pid, rating: +rating, comment: $('#rv-c', box).value, photos }); box.innerHTML = `<div class="form-msg ok">${UI.esc(d.message)}</div>`; }
      catch (x) { err.textContent = x.message; err.hidden = false; }
    });
  },
  init() {
    document.addEventListener('click', async (e) => {
      const w = e.target.closest('[data-wish]'), a = e.target.closest('[data-add]'), b = e.target.closest('[data-buy]');
      if (w) { const on = await Wishlist.toggle(w.dataset.wish); UI.toast(on ? 'Added to wishlist' : 'Removed from wishlist'); document.dispatchEvent(new CustomEvent('wish:changed', { detail: { id: w.dataset.wish, on } })); }
      const id = (a || b)?.dataset.add || (a || b)?.dataset.buy; if (!id) return;
      const p = UI.reg[id]; if (!p) return;
      if (p.customizationOptions?.length) { UI.toast('Please choose your customization first'); location.href = 'product.html?p=' + p.slug + '#custom'; return; }
      if (a) { Cart.add(p); UI.toast('Added to cart', 'ok'); } else Cart.buyNow(p);
    });
  },
};
