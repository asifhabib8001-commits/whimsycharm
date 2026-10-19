// Har owner page par sabse pehle chalta hai: token check, customer site se handoff (#t=...), phir page render
const Guard = {
  ready: (async () => {
    const m = location.hash.match(/t=([^&]+)/);
    if (m) { localStorage.setItem('wco_token', decodeURIComponent(m[1])); history.replaceState(null, '', location.pathname + location.search); }
    if (!localStorage.getItem('wco_token')) { location.href = 'index.html'; return false; }
    try { const d = await API.get('/auth/me'); if (d.user.role !== 'owner') throw 0; window.OWNER = d.user; return true; }
    catch { localStorage.removeItem('wco_token'); location.href = 'index.html'; return false; }
  })(),
  logout() { localStorage.removeItem('wco_token'); location.href = 'index.html'; },
};
// page scripts: runPage('Title', (view) => {...})
const runPage = (title, fn) => Guard.ready.then((ok) => ok && fn(Shell.mount(title)));
