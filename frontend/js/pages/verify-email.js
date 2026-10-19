(async () => {
  await Settings.applyPage('verify-email', 'Verify email'); const t = UI.qs('token');
  UI.mount('<div class="auth-wrap"><div class="auth-card center"><h1>Email verification</h1><p id="r" class="muted">Verifying…</p><a class="btn btn-gold" href="index.html">Continue</a></div></div>');
  try { const d = await API.post('/auth/verify-email', { token: t }); $('#r').textContent = '✓ ' + d.message; await Auth.refresh(); } catch (x) { $('#r').textContent = x.message; }
})();
