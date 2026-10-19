runPage('Reviews', (v) => {
  let st = 'pending';
  v.innerHTML = `<div class="tabs" id="tb">${['pending', 'approved', 'rejected'].map((s) => `<button data-s="${s}" class="${s === st ? 'active' : ''}">${s[0].toUpperCase() + s.slice(1)}</button>`).join('')}</div><div id="l"></div>`;
  const load = async () => {
    try {
      const rs = await API.get('/reviews/admin/all?status=' + st);
      $('#l').innerHTML = rs.length ? rs.map((r) => `<div class="card"><div class="page-head" style="margin:0"><div><b>${esc(r.name)}</b> ${r.verifiedBuyer ? '<span class="badge ok">Verified buyer</span>' : ''}<br><span style="color:#c9a227">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span> <span class="muted small">on ${esc(r.product?.name || '—')} · ${fdate(r.createdAt)}</span></div><div class="actions">${st !== 'approved' ? `<button class="btn sm gold" data-a="${r._id}" data-s="approved">Approve</button>` : ''}${st !== 'rejected' ? `<button class="btn sm" data-a="${r._id}" data-s="rejected">Reject</button>` : ''}<button class="btn sm danger" data-x="${r._id}">Delete</button></div></div><p>${esc(r.comment || '')}</p>${(r.photos || []).length ? `<div class="media-box">${r.photos.map((p) => `<a class="media-item" href="${esc(p.url)}" target="_blank" rel="noopener"><img src="${esc(p.url)}" alt="Review photo"></a>`).join('')}</div>` : ''}</div>`).join('') : '<div class="empty">No reviews here</div>';
    } catch (x) { $('#l').innerHTML = `<div class="empty">${esc(x.message)}</div>`; }
  };
  v.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    try {
      if (b.closest('#tb')) { st = b.dataset.s; $$('#tb button').forEach((x) => x.classList.toggle('active', x === b)); return load(); }
      if (b.dataset.a) { await API.put('/reviews/admin/' + b.dataset.a, { status: b.dataset.s }); toast('Updated', 'ok'); load(); }
      if (b.dataset.x && confirm('Delete this review?')) { await API.del('/reviews/admin/' + b.dataset.x); load(); }
    } catch (x) { toast(x.message, 'err'); }
  });
  load();
});
