(async () => {
  const s = await Settings.applyPage('contact', 'Contact'), e = UI.esc;
  const wa = (s.whatsapp || []).map((n) => { const d = n.replace(/\D/g, ''); return `<a class="gold-text" href="https://wa.me/${d.length === 10 ? '91' + d : d}" target="_blank" rel="noopener">${e(n)}</a>`; }).join(' · ');
  const soc = s.social || {};
  UI.mount(`<div class="container section"><h1 class="center">Contact us</h1><div class="divider"></div><div class="contact-grid"><div class="card">
    <div class="contact-item"><span class="ico">☎</span><div><b>Phone</b><br>${(s.phones || []).map((p) => `<a href="tel:${e(p)}">${e(p)}</a>`).join(' · ')}</div></div><br>
    <div class="contact-item"><span class="ico">💬</span><div><b>WhatsApp</b><br>${wa}</div></div><br>
    <div class="contact-item"><span class="ico">✉</span><div><b>Email</b><br><a href="mailto:${e(s.email)}">${e(s.email)}</a></div></div><br>
    ${s.address ? `<div class="contact-item"><span class="ico">⌖</span><div><b>Address</b><br>${e(s.address)}</div></div><br>` : ''}
    <div class="pill-row">${soc.instagram ? `<a class="btn btn-lav btn-sm" href="${e(soc.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ''}${soc.facebook ? `<a class="btn btn-lav btn-sm" href="${e(soc.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}${soc.youtube ? `<a class="btn btn-lav btn-sm" href="${e(soc.youtube)}" target="_blank" rel="noopener">YouTube</a>` : ''}</div></div>
    <div class="card"><h3>Find us</h3>${s.address ? `<iframe class="map-frame" title="Map" loading="lazy" src="https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed"></iframe>` : '<p class="muted">Tap below to open our location in Google Maps.</p>'}${s.mapsLink ? `<p style="margin-top:var(--s-3)"><a class="btn btn-gold" href="${e(s.mapsLink)}" target="_blank" rel="noopener">Open in Google Maps</a></p>` : ''}</div></div>
    <p class="center muted" style="margin-top:var(--s-5)">Want something custom? <a class="gold-text" href="custom-order.html"><b>Send a custom order request</b></a></p></div>`);
})();
