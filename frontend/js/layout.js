// Har page ka header, footer, WhatsApp button, chatbot, popup, theme aur PWA yahin se lagta hai
(async function () {
  UI.init();
  const page = document.body.dataset.page, s = await Settings.get(), cats = await API.get('/categories').catch(() => []);
  const e = UI.esc, name = e(s.businessName || 'WhimsyCharm');
  const wa = ((s.whatsapp || [])[0] || '').replace(/\D/g, ''), waNum = wa.length === 10 ? '91' + wa : wa;
  const here = location.pathname.split('/').pop() || 'index.html', c = UI.qs('c');
  const link = (href, label) => `<a href="${href}" ${(href === here || href.endsWith('c=' + c) && c) ? 'class="active" aria-current="page"' : ''}>${label}</a>`;
  const nav = link('index.html', 'Home') + cats.map((x) => link('category.html?c=' + x.slug, e(x.name))).join('') + link('gallery.html', 'Gallery') + link('reviews.html', 'Reviews') + link('contact.html', 'Contact') + link('my-orders.html', 'My Orders') + link('settings.html', 'Settings') + '<span class="nav-extra"><a href="wishlist.html">Wishlist</a><a href="my-orders.html">My Orders</a><a href="custom-order.html">Custom Order</a><a href="bulk-enquiry.html">Bulk Enquiry</a><a href="about.html">Our Story</a><a href="faq.html">FAQ</a><button class="nav-theme" data-theme-toggle>◐ Dark / Light mode</button></span>';

  document.body.insertAdjacentHTML('afterbegin', `<a class="skip" href="#app">Skip to content</a>
  <header class="site-header"><div class="container hdr-inner">
    <button class="icon-btn menu-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav">${UI.icon('menu')}</button>
    <a class="brand" href="index.html">${s.logo?.url ? `<img src="${e(s.logo.url)}" alt="">` : ''}<span>${name}</span></a>
    <nav class="nav" id="nav" aria-label="Main">${nav}</nav>
    <div class="hdr-actions">
      <button class="icon-btn" data-search aria-label="Search">${UI.icon('search')}</button>
      <a class="icon-btn hdr-wish" href="wishlist.html" aria-label="Wishlist">${UI.icon('heart')}<span class="count" data-wish-count hidden></span></a>
      <a class="icon-btn" href="cart.html" aria-label="Cart">${UI.icon('bag')}<span class="count" data-cart-count hidden></span></a>
      <a class="icon-btn" href="${Auth.loggedIn ? 'profile.html' : 'login.html'}" aria-label="Account">${UI.icon('user')}</a>
      <button class="icon-btn hdr-theme" data-theme-toggle aria-label="Dark / Light mode">${UI.icon('moon')}</button>
    </div></div>
    <form class="search-bar" role="search" hidden><input type="search" name="q" placeholder="Search resin, flowers, clay, concrete…" aria-label="Search products"></form></header>`);

  if (API.demo) document.body.insertAdjacentHTML('afterbegin', '<div class="demo-bar">DEMO MODE · sample data saved in this browser only · set API_URL in js/config.js to connect the real backend</div>');
  const ph = (s.phones || []).map((p) => `<a href="tel:${e(p)}">${e(p)}</a>`).join(' · ');
  const soc = s.social || {};
  document.body.insertAdjacentHTML('beforeend', `<footer class="site-footer"><div class="container"><div class="footer-grid">
    <div><a class="brand" href="index.html"><span>${name}</span></a><p class="muted">${e(s.tagline || '')}</p><p class="muted" style="font-size:var(--fs-sm)">Handmade with love by ${e(s.ownerNames || '')}</p>
      <form class="news" data-news><input type="email" placeholder="Your email" required aria-label="Newsletter email"><button class="btn btn-gold btn-sm">Join</button></form></div>
    <div><h4>Shop</h4><ul>${cats.map((x) => `<li><a href="category.html?c=${e(x.slug)}">${e(x.name)}</a></li>`).join('')}<li><a href="gallery.html">Gallery</a></li></ul></div>
    <div><h4>Help</h4><ul><li><a href="my-orders.html">My Orders</a></li><li><a href="custom-order.html">Custom Order</a></li><li><a href="bulk-enquiry.html">Bulk / Return Gifts</a></li><li><a href="faq.html">FAQ</a></li><li><a href="about.html">Our Story</a></li></ul></div>
    <div><h4>Contact</h4><ul><li>${ph || ''}</li>${s.email ? `<li><a href="mailto:${e(s.email)}">${e(s.email)}</a></li>` : ''}${s.address ? `<li class="muted">${e(s.address)}</li>` : ''}
      <li>${soc.instagram ? `<a href="${e(soc.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}${soc.facebook ? ` · <a href="${e(soc.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}${soc.youtube ? ` · <a href="${e(soc.youtube)}" target="_blank" rel="noopener">YouTube</a>` : ''}</li></ul></div>
  </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${name}. Handmade with love.</span><nav aria-label="Policies"><a href="policy.html?type=privacy">Privacy</a><a href="policy.html?type=terms">Terms</a><a href="policy.html?type=refund">Refund</a><a href="policy.html?type=shipping">Shipping</a><a href="settings.html">Settings</a></nav></div></div></footer>`);

  if (waNum) document.body.insertAdjacentHTML('beforeend', `<a class="fab fab-wa" href="https://wa.me/${waNum}?text=${encodeURIComponent('Hi ' + (s.businessName || 'WhimsyCharm') + '!')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.8-.1 1.4z"/></svg></a>`);

  // Theme
  const th = document.documentElement, setTheme = (t) => { th.dataset.theme = t; localStorage.setItem('wc_theme', t); };
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => setTheme(th.dataset.theme === 'dark' ? 'light' : 'dark')));
  // Menu + search
  const mt = $('.menu-toggle'), navEl = $('#nav');
  mt.addEventListener('click', () => { const o = navEl.classList.toggle('open'); mt.setAttribute('aria-expanded', o); });
  const sb = $('.search-bar');
  $('[data-search]').addEventListener('click', () => { sb.hidden = !sb.hidden; if (!sb.hidden) $('input', sb).focus(); });
  sb.addEventListener('submit', (ev) => { ev.preventDefault(); const q = $('input', sb).value.trim(); if (q) location.href = 'category.html?q=' + encodeURIComponent(q); });
  // Newsletter
  $('[data-news]').addEventListener('submit', async (ev) => { ev.preventDefault(); try { const d = await API.post('/newsletter', { email: $('input', ev.target).value }); UI.toast(d.message, 'ok'); ev.target.reset(); } catch (x) { UI.toast(x.message, 'err'); } });

  Cart.badge(); Wishlist.badge(); Settings.analytics();
  if (Auth.loggedIn) Auth.refresh();

  // AI chatbot
  if (s.chatbot?.enabled !== false) {
    document.body.insertAdjacentHTML('beforeend', '<button class="fab fab-chat" aria-label="Chat with our assistant"><svg viewBox="0 0 24 24"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg></button>');
    let panel, history = [];
    $('.fab-chat').addEventListener('click', () => {
      if (panel) { panel.hidden = !panel.hidden; return; }
      panel = document.createElement('div'); panel.className = 'chat'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Chat assistant');
      panel.innerHTML = `<div class="chat-head"><span>${name} Assistant</span><button aria-label="Close chat">×</button></div><div class="chat-body" aria-live="polite"><div class="msg bot">Hello! 🌸 I can help you pick a gift or find the perfect piece. What are you looking for?</div></div><form class="chat-form"><input type="text" placeholder="Type here…" maxlength="500" aria-label="Message" required><button class="btn btn-gold btn-sm">Send</button></form>`;
      document.body.appendChild(panel);
      const body = $('.chat-body', panel), add = (t, c) => { const m = document.createElement('div'); m.className = 'msg ' + c; m.textContent = t; body.appendChild(m); body.scrollTop = body.scrollHeight; return m; };
      $('.chat-head button', panel).addEventListener('click', () => { panel.hidden = true; });
      $('form', panel).addEventListener('submit', async (ev) => {
        ev.preventDefault(); const inp = $('input', panel), msg = inp.value.trim(); if (!msg) return; inp.value = ''; add(msg, 'me');
        const w = add('…', 'bot');
        try { const d = await API.post('/chatbot', { message: msg, history }); w.textContent = d.reply; history.push({ role: 'user', text: msg }, { role: 'model', text: d.reply }); }
        catch (x) { w.textContent = x.message; }
      });
    });
  }

  // Offer popup (ek session me ek baar)
  if (s.popup?.enabled && !sessionStorage.getItem('wc_popup') && page !== 'checkout') {
    setTimeout(() => {
      sessionStorage.setItem('wc_popup', '1'); const p = s.popup;
      UI.modal(`<div class="center">${p.image?.url ? `<img src="${e(p.image.url)}" alt="" style="margin:0 auto var(--s-3);border-radius:var(--r-md);max-height:200px">` : ''}<h2>${e(p.title || 'Special offer')}</h2><p class="muted">${e(p.text || '')}</p>${p.code ? `<p><b style="border:2px dashed var(--gold-500);padding:.5rem 1rem;border-radius:var(--r-sm);display:inline-block">${e(p.code)}</b></p>` : ''}<a class="btn btn-gold" href="index.html#cats">Shop now</a></div>`);
    }, 4500);
  }
  UI.reveal();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
