// Owner login: yahin se username + password, phir owner panel khulta hai
(async () => {
  await Settings.applyPage('settings', 'Settings');
  UI.mount(`<div class="auth-wrap"><div class="auth-card"><h1 class="center">Owner login</h1><p class="center muted">For WhimsyCharm owners only.</p>${API.demo ? '<p class="form-msg">Demo login: <b>whimsycharm</b> / <b>demo123</b></p>' : ''}<div id="m"></div><form id="f"><div class="field"><label for="u">Username</label><input id="u" autocomplete="username" autocapitalize="none" required></div><div class="field"><label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required></div><button class="btn btn-gold btn-block">Login to owner panel</button></form></div></div>`);
  $('#f').addEventListener('submit', async (ev) => {
    ev.preventDefault(); const b = $('button.btn', ev.target); b.disabled = true;
    try {
      const d = await API.post('/auth/owner-login', { username: $('#u').value.trim(), password: $('#p').value });
      const base = WC_CONFIG.OWNER_URL.replace(/\/$/, ''), probe = new URL(base + '/index.html', location.href);
      if (location.protocol.startsWith('http') && probe.origin === location.origin) {
        let ok = false; try { ok = (await fetch(probe.href, { method: 'HEAD' })).ok; } catch { ok = false; }
        if (!ok) { $('#m').innerHTML = `<div class="form-msg err" role="alert">Login is correct, but the owner panel was not found at <b>${UI.esc(probe.pathname)}</b>. In VS Code, open the whole <b>whimsycharm</b> folder (not only the frontend folder) and start Live Server from the main index.html. If this site is deployed, set OWNER_URL in js/config.js.</div>`; b.disabled = false; return; }
      }
      location.href = base + '/index.html#t=' + encodeURIComponent(d.token);
    }
    catch (x) { $('#m').innerHTML = `<div class="form-msg err" role="alert">${UI.esc(x.message)}</div>`; b.disabled = false; }
  });
})();
