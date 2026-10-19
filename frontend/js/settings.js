const Settings = {
  _p: null,
  get() {
    return this._p || (this._p = (async () => {
      try { const c = JSON.parse(sessionStorage.getItem('wc_set') || 'null'); if (c && Date.now() - c.t < 3e5) return c.d; } catch { /* ignore */ }
      const d = await API.get('/settings').catch(() => ({}));
      try { sessionStorage.setItem('wc_set', JSON.stringify({ t: Date.now(), d })); } catch { /* ignore */ }
      return d;
    })());
  },
  async applyPage(page, fallbackTitle) {
    const s = await this.get(), seo = (s.seo || {})[page] || {}, name = s.businessName || 'WhimsyCharm';
    document.title = seo.title || (fallbackTitle ? `${fallbackTitle} | ${name}` : `${name} - ${s.tagline || ''}`);
    const meta = (n, c) => { if (!c) return; let m = document.querySelector(`meta[name=${n}]`); if (!m) { m = document.createElement('meta'); m.name = n; document.head.appendChild(m); } m.content = c; };
    meta('description', seo.description || s.tagline); meta('keywords', seo.keywords);
    if (s.favicon?.url) { let l = document.querySelector('link[rel=icon]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); } l.href = s.favicon.url; }
    const bg = (s.pageBackgrounds || {})[page];
    if (bg?.url) {
      const d = document.createElement('div'); d.className = 'page-bg';
      if (bg.type === 'video') d.innerHTML = `<video src="${bg.url}" autoplay muted loop playsinline></video>`; else d.style.backgroundImage = `url("${bg.url}")`;
      document.body.prepend(d);
    }
    return s;
  },
  analytics() {
    const id = WC_CONFIG.GA_ID; if (!id || window.gtag) return;
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', id);
  },
};
