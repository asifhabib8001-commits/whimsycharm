runPage('Enquiries', (v) => {
  const T = { 'custom-orders': ['Custom orders', ['New', 'In Progress', 'Done', 'Rejected']], bulk: ['Bulk enquiries', ['New', 'In Progress', 'Done', 'Rejected']], returns: ['Return requests', ['Requested', 'Approved', 'Rejected', 'Completed']] };
  let t = 'custom-orders';
  v.innerHTML = `<div class="tabs" id="tb">${Object.entries(T).map(([k, [l]]) => `<button data-t="${k}" class="${k === t ? 'active' : ''}">${l}</button>`).join('')}</div><div id="l"></div>`;
  const load = async () => {
    try {
      const rs = await API.get('/' + t);
      $('#l').innerHTML = rs.length ? rs.map((r) => `<div class="card" data-id="${r._id}"><div class="page-head" style="margin:0"><div><b>${esc(r.name || r.user?.name || r.orderNo)}</b> <span class="muted small">${fdate(r.createdAt)}</span><br><span class="small">${r.phone ? '☎ ' + esc(r.phone) : esc(r.user?.email || '')}${r.email ? ' · ' + esc(r.email) : ''}</span></div><span class="badge warn">${esc(r.status)}</span></div>
      <dl class="kv" style="margin:10px 0">${r.category ? `<dt>Category</dt><dd>${esc(r.category)}</dd>` : ''}${r.occasion ? `<dt>Occasion</dt><dd>${esc(r.occasion)}${r.quantity ? ' · qty ' + r.quantity : ''}</dd>` : ''}${r.type ? `<dt>Type</dt><dd>${esc(r.type)} · order ${esc(r.orderNo)}</dd>` : ''}${r.budget ? `<dt>Budget</dt><dd>${esc(r.budget)}</dd>` : ''}${r.neededBy ? `<dt>Needed by</dt><dd>${esc(r.neededBy)}</dd>` : ''}<dt>Details</dt><dd>${esc(r.description || r.details || r.reason || '')}</dd></dl>
      ${(r.photos || []).length ? `<div class="media-box">${r.photos.map((p) => `<a class="media-item" href="${esc(p.url)}" target="_blank" rel="noopener"><img src="${esc(p.url)}" alt="Reference"></a>`).join('')}</div>` : ''}
      <div class="fgrid" style="margin-top:10px"><div class="fld"><label>Status</label><select data-f="status">${T[t][1].map((s) => `<option ${r.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div><div class="fld"><label>Your note</label><input type="text" data-f="ownerNote" value="${esc(r.ownerNote || '')}"></div></div>
      <div class="actions" style="margin-top:10px"><button class="btn sm gold" data-save>Save</button>${r.phone ? `<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/91${esc(String(r.phone).replace(/\D/g, '').slice(-10))}">WhatsApp</a>` : ''}<button class="btn sm danger" data-del>Delete</button></div></div>`).join('') : '<div class="empty">Nothing here yet</div>';
    } catch (x) { $('#l').innerHTML = `<div class="empty">${esc(x.message)}</div>`; }
  };
  v.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.closest('#tb')) { t = b.dataset.t; $$('#tb button').forEach((x) => x.classList.toggle('active', x === b)); return load(); }
    const c = b.closest('[data-id]'); if (!c) return;
    try {
      if (b.hasAttribute('data-save')) { await API.put(`/${t}/${c.dataset.id}`, { status: $('[data-f=status]', c).value, ownerNote: $('[data-f=ownerNote]', c).value }); toast('Saved', 'ok'); load(); }
      if (b.hasAttribute('data-del') && confirm('Delete this entry?')) { await API.del(`/${t}/${c.dataset.id}`); load(); }
    } catch (x) { toast(x.message, 'err'); }
  });
  load();
});
