(async () => {
  const m = location.hash.match(/t=([^&]+)/);
  if (m) { localStorage.setItem('wco_token', decodeURIComponent(m[1])); history.replaceState(null, '', location.pathname); }
  if (localStorage.getItem('wco_token')) { try { const d = await API.get('/auth/me'); if (d.user.role === 'owner') return (location.href = 'dashboard.html'); } catch { /* login dikhao */ } localStorage.removeItem('wco_token'); }
  document.body.innerHTML = `<div class="login-wrap"><div class="login-card"><h2 style="text-align:center;color:#8a650c">WhimsyCharm</h2><p class="muted" style="text-align:center">Owner panel login</p>${API.demo ? '<p class="badge warn" style="display:block;text-align:center;margin-bottom:10px">Demo login: <b>whimsycharm</b> / <b>demo123</b></p>' : ''}<div id="m"></div>
    <form id="f" class="fgrid" style="grid-template-columns:1fr"><div class="fld"><label for="u">Username</label><input id="u" type="text" autocomplete="username" autocapitalize="none" required></div><div class="fld"><label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required></div><button class="btn gold">Login</button></form></div></div>`;
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault(); const b = $('button', e.target); b.disabled = true;
    try { const d = await API.post('/auth/owner-login', { username: $('#u').value.trim(), password: $('#p').value }); localStorage.setItem('wco_token', d.token); location.href = 'dashboard.html'; }
    catch (x) { $('#m').innerHTML = `<div class="badge bad" style="display:block;margin-bottom:10px;padding:8px" role="alert">${esc(x.message)}</div>`; b.disabled = false; }
  });
})();
