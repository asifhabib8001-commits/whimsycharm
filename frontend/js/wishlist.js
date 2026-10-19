const Wishlist = {
  key: 'wc_wish',
  ids() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  has(id) { return this.ids().includes(id); },
  save(a) { localStorage.setItem(this.key, JSON.stringify(a)); this.badge(); document.querySelectorAll('[data-wish]').forEach((b) => this.paint(b)); },
  async toggle(id) {
    const a = this.ids(), on = !a.includes(id);
    this.save(on ? [...a, id] : a.filter((x) => x !== id));
    if (Auth.loggedIn) { try { await API.post('/cart/wishlist/' + id); } catch { /* local list safe hai */ } }
    return on;
  },
  async sync() {
    try {
      const server = (await API.get('/cart/wishlist')).map((p) => p._id), local = this.ids();
      for (const id of local.filter((x) => !server.includes(x))) await API.post('/cart/wishlist/' + id).catch(() => {});
      this.save([...new Set([...server, ...local])]);
    } catch { /* ignore */ }
  },
  paint(b) { const on = this.has(b.dataset.wish); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡'; },
  badge() { const n = this.ids().length; document.querySelectorAll('[data-wish-count]').forEach((e) => { e.textContent = n; e.hidden = !n; }); },
};
