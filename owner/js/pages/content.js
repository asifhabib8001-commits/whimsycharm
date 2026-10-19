runPage('Content', async (v) => {
  let tab = 'faq', s = await API.get('/settings');
  const TABS = { faq: 'FAQ', gallery: 'Gallery', newsletter: 'Newsletter', popup: 'Offer popup', policies: 'Policies' };
  v.innerHTML = `<div class="tabs" id="tb">${Object.entries(TABS).map(([k, l]) => `<button data-t="${k}" class="${k === tab ? 'active' : ''}">${l}</button>`).join('')}</div><div id="c"></div>`;
  const settingsForm = (box, fields, title) => {
    box.innerHTML = `<div class="card"><h2>${title}</h2><div id="sf"></div><div class="actions" style="margin-top:12px"><button class="btn gold" id="ss">Save</button></div></div>`;
    const f = F.build(fields, s); $('#sf', box).appendChild(f);
    $('#ss', box).onclick = async () => { try { s = await API.put('/settings', F.read(f, fields)); sessionStorage.removeItem('wc_set'); toast('Saved', 'ok'); } catch (x) { toast(x.message, 'err'); } };
  };
  const show = async () => {
    const old = $('#c'), box = old.cloneNode(false); old.replaceWith(box);
    if (tab === 'faq') Crud(box, { title: 'FAQ', single: 'question', list: '/faqs/admin/all', base: '/faqs', defaults: { active: true, order: 0 }, columns: [{ label: 'Question', key: 'question' }, { label: 'Order', key: 'order' }, { label: 'Visible', render: (r) => yesno(r.active) }], fields: [{ name: 'question', label: 'Question', type: 'text', required: true }, { name: 'answer', label: 'Answer', type: 'textarea' }, { name: 'order', label: 'Order', type: 'number' }, { name: 'active', label: 'Show', type: 'checkbox' }] });
    if (tab === 'gallery') Crud(box, { title: 'Behind-the-scenes gallery', single: 'item', list: '/gallery/admin/all', base: '/gallery', defaults: { active: true, order: 0 }, columns: [{ label: 'Preview', render: (r) => (r.type === 'video' ? '🎬' : `<img class="th" src="${esc(r.url)}" alt="">`) }, { label: 'Title', key: 'title' }, { label: 'Type', key: 'type' }, { label: 'Visible', render: (r) => yesno(r.active) }], fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: '_m', label: 'Photo or video', type: 'flatmedia', folder: 'gallery' }, { name: 'order', label: 'Order', type: 'number' }, { name: 'active', label: 'Show', type: 'checkbox' }] });
    if (tab === 'newsletter') {
      const subs = await API.get('/newsletter').catch(() => []);
      box.innerHTML = `<div class="card"><div class="page-head"><h2>Subscribers (${subs.length})</h2><button class="btn lav" id="cp">Copy all emails</button></div><div class="table-wrap"><table><tbody>${subs.map((x) => `<tr><td>${esc(x.email)}</td><td>${fdate(x.createdAt)}</td><td><button class="btn sm danger" data-x="${x._id}">Remove</button></td></tr>`).join('') || '<tr><td class="muted">No subscribers yet</td></tr>'}</tbody></table></div></div>`;
      $('#cp', box)?.addEventListener('click', () => navigator.clipboard.writeText(subs.map((x) => x.email).join(', ')).then(() => toast('Copied', 'ok')));
      box.addEventListener('click', async (e) => { const b = e.target.closest('[data-x]'); if (b) { await API.del('/newsletter/' + b.dataset.x); show(); } });
    }
    if (tab === 'popup') settingsForm(box, [{ name: 'popup.enabled', label: 'Show offer popup on website', type: 'checkbox' }, { name: 'popup.title', label: 'Title', type: 'text' }, { name: 'popup.text', label: 'Text', type: 'textarea' }, { name: 'popup.code', label: 'Coupon code to show (optional)', type: 'text' }, { name: 'popup.image', label: 'Image (optional)', type: 'image', folder: 'popup' }], 'Offer popup');
    if (tab === 'policies') settingsForm(box, [['privacy', 'Privacy policy'], ['terms', 'Terms & conditions'], ['refund', 'Refund policy'], ['shipping', 'Shipping policy'], ['returns', 'Return policy']].map(([k, l]) => ({ name: 'policies.' + k, label: l, type: 'textarea', hint: 'Leave empty to show the default draft on the website. Leave a blank line between paragraphs.' })), 'Policy pages');
  };
  $('#tb').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { tab = b.dataset.t; $$('#tb button').forEach((x) => x.classList.toggle('active', x === b)); show(); } });
  show();
});
