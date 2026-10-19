const API = (() => {
  const base = () => (WCO.API_URL || '').replace(/\/$/, '');
  const DEMO = !WCO.API_URL;
  async function req(method, path, body) {
    const h = {}, t = localStorage.getItem('wco_token'); if (t) h.Authorization = 'Bearer ' + t;
    if (DEMO) {
      try { return await MockAPI.handle(method, path, body, t); }
      catch (e) { if (e.status === 401 && t) { localStorage.removeItem('wco_token'); location.href = 'index.html'; } throw e; }
    }
    let b; if (body instanceof FormData) b = body; else if (body !== undefined) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body); }
    let r; try { r = await fetch(base() + path, { method, headers: h, body: b }); } catch { throw new Error('Cannot reach the server'); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { if (r.status === 401 && t) { localStorage.removeItem('wco_token'); location.href = 'index.html'; } throw new Error(d.message || 'Something went wrong'); }
    return d;
  }
  return { demo: DEMO, get: (p) => req('GET', p), post: (p, b) => req('POST', p, b), put: (p, b) => req('PUT', p, b), del: (p, b) => req('DELETE', p, b) };
})();
