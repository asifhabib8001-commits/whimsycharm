const API = (() => {
  const base = () => (WC_CONFIG.API_URL || '').replace(/\/$/, '');
  const DEMO = !WC_CONFIG.API_URL;
  async function req(method, path, body, blob) {
    const h = {}, t = localStorage.getItem('wc_token');
    if (DEMO) {
      try { const d = await MockAPI.handle(method, path, body, t); return blob ? new Blob([d.html], { type: 'text/html' }) : d; }
      catch (e) { if (e.status === 401 && t && window.Auth) Auth.clear(); throw e; }
    }
    if (t) h.Authorization = 'Bearer ' + t;
    let b;
    if (body instanceof FormData) b = body; else if (body !== undefined) { h['Content-Type'] = 'application/json'; b = JSON.stringify(body); }
    let r;
    try { r = await fetch(base() + path, { method, headers: h, body: b }); }
    catch { throw new Error('Cannot reach the server. Please check your internet connection.'); }
    if (blob) { if (!r.ok) throw new Error('Download failed'); return r.blob(); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { if (r.status === 401 && t && window.Auth) Auth.clear(); const e = new Error(d.message || 'Something went wrong'); e.status = r.status; throw e; }
    return d;
  }
  return { demo: DEMO, get: (p) => req('GET', p), post: (p, b) => req('POST', p, b), put: (p, b) => req('PUT', p, b), del: (p) => req('DELETE', p), blob: (p) => req('GET', p, undefined, true) };
})();
