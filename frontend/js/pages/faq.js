(async () => {
  await Settings.applyPage('faq', 'FAQ'); const e = UI.esc;
  UI.mount('<div class="container section"><h1 class="center">Frequently asked questions</h1><div class="divider"></div><div class="prose" id="q">' + UI.skel(1) + '</div></div>');
  try { const f = await API.get('/faqs'); $('#q').innerHTML = f.length ? f.map((x) => `<details class="faq"><summary>${e(x.question)}</summary><div class="ans">${e(x.answer).replace(/\n/g, '<br>')}</div></details>`).join('') : '<div class="empty"><p>FAQs coming soon. Meanwhile, message us on WhatsApp!</p></div>'; } catch (x) { $('#q').innerHTML = `<p>${e(x.message)}</p>`; }
})();
