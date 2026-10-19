runPage('Activity Log', async (v) => {
  try { const l = await API.get('/dashboard/activity?limit=200'); v.innerHTML = `<div class="card"><div class="table-wrap"><table><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead><tbody>${l.map((x) => `<tr><td>${fdate(x.createdAt)}</td><td>${esc(x.userName || '—')}</td><td>${esc(x.action)}</td><td class="muted">${esc(x.detail)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No activity yet</td></tr>'}</tbody></table></div></div>`; } catch (x) { v.innerHTML = `<div class="empty">${esc(x.message)}</div>`; }
});
