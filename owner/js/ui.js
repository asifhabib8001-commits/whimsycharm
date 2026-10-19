const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
const fdate = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const getp = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
const setp = (o, p, v) => { const k = p.split('.'); let c = o; k.slice(0, -1).forEach((x) => (c = c[x] = c[x] || {})); c[k.at(-1)] = v; };
const toast = (m, t = '') => { let b = $('.toasts'); if (!b) { b = document.createElement('div'); b.className = 'toasts'; document.body.appendChild(b); } const e = document.createElement('div'); e.className = 'toast ' + t; e.textContent = m; b.appendChild(e); setTimeout(() => e.remove(), 3500); };

const NAV = [['dashboard', 'Dashboard', '▦'], ['orders', 'Orders', '🧾'], ['products', 'Products', '🛍'], ['categories', 'Categories', '🗂'], ['reviews', 'Reviews', '★'], ['coupons', 'Coupons', '％'], ['enquiries', 'Enquiries', '✉'], ['delivery', 'Delivery', '🚚'], ['content', 'Content', '📝'], ['site-settings', 'Site Settings', '⚙'], ['activity-log', 'Activity Log', '⏱'], ['change-password', 'Change Password', '🔑']];
const Shell = {
  mount(title) {
    const cur = document.body.dataset.page; document.title = title + ' | WhimsyCharm Owner';
    document.body.innerHTML = `<aside class="side" id="side"><div class="logo">WhimsyCharm<small>Owner panel</small></div><nav aria-label="Owner menu">${NAV.map(([p, l, i]) => `<a href="${p}.html" class="${p === cur ? 'active' : ''}" ${p === cur ? 'aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${l}</a>`).join('')}</nav><div class="foot"><a href="${esc(WCO.SITE_URL)}" target="_blank" rel="noopener">↗ View website</a><button id="lo">Logout</button></div></aside>
      <div class="scrim" id="scrim" hidden></div><div class="main">${API.demo ? '<div class="demo-bar">DEMO MODE · sample data saved in this browser only · set API_URL in js/config.js to go live</div>' : ''}<header class="topbar"><button class="menu" id="mn" aria-label="Menu">☰</button><h1>${esc(title)}</h1></header><main class="view" id="view"></main></div>`;
    const tg = (o) => { $('#side').classList.toggle('open', o); $('#scrim').hidden = !o; };
    $('#mn').onclick = () => tg(true); $('#scrim').onclick = () => tg(false); $('#lo').onclick = Guard.logout;
    return $('#view');
  },
  modal(title, body, { wide } = {}) {
    const o = document.createElement('div'); o.className = 'ovl'; o.innerHTML = `<div class="mdl" role="dialog" aria-modal="true" ${wide ? 'style="max-width:900px"' : ''}><button class="x" aria-label="Close">×</button><h2>${esc(title)}</h2></div>`;
    const m = $('.mdl', o); typeof body === 'string' ? m.insertAdjacentHTML('beforeend', body) : m.appendChild(body);
    const close = () => o.remove(); o.addEventListener('click', (e) => { if (e.target === o || e.target.closest('.x')) close(); }); document.body.appendChild(o); return { el: m, close };
  },
};

/* ---------- Form builder (field spec -> form -> nested object) ---------- */
const PAGES = ['home', 'category', 'product', 'cart', 'checkout', 'contact', 'reviews', 'gallery', 'about', 'faq', 'custom-order', 'bulk-enquiry', 'login', 'my-orders'];
const F = {
  mediaWidget(box, val, { multi, accept, folder, onChange }) {
    let v = multi ? [...(val || [])] : val && val.url ? { ...val } : null;
    const draw = () => {
      const items = multi ? v : v ? [v] : [];
      box.innerHTML = `<div class="media-box">${items.map((m, i) => `<span class="media-item">${(m.type === 'video' || /\.(mp4|webm|mov)$/i.test(m.url)) ? `<video src="${esc(m.url)}" muted></video>` : `<img src="${esc(m.url)}" alt="">`}<button type="button" data-rm="${i}" aria-label="Remove">×</button></span>`).join('')}
        ${multi || !v ? `<label class="btn sm lav" style="cursor:pointer">+ Upload<input type="file" hidden accept="${accept}" ${multi ? 'multiple' : ''}></label>` : ''}</div>`;
      onChange(multi ? v : v || { url: '', publicId: '' });
    };
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { multi ? v.splice(+b.dataset.rm, 1) : (v = null); draw(); } });
    box.addEventListener('change', async (e) => {
      if (e.target.type !== 'file') return; const lab = e.target.closest('label'); lab.firstChild.textContent = 'Uploading…';
      for (const f of [...e.target.files]) { try { const r = await Upload.file(f, folder); const m = { url: r.url, publicId: r.publicId, type: r.type }; multi ? v.push(m) : (v = m); } catch (x) { toast(x.message, 'err'); } }
      draw();
    });
    draw();
  },
  field(fd, val, st) {
    if (fd.section) return `<div class="sec">${esc(fd.section)}</div>`;
    const id = 'f_' + fd.name.replace(/\W/g, '_'), cls = fd.full || ['textarea', 'images', 'options', 'bgmap', 'seomap'].includes(fd.type) ? 'fld full' : 'fld';
    const lab = `<label for="${id}">${esc(fd.label)}</label>`, hint = fd.hint ? `<div class="hint">${esc(fd.hint)}</div>` : '';
    switch (fd.type) {
      case 'textarea': return `<div class="${cls}">${lab}<textarea id="${id}" name="${fd.name}">${esc(val)}</textarea>${hint}</div>`;
      case 'number': return `<div class="${cls}">${lab}<input id="${id}" name="${fd.name}" type="number" step="any" value="${esc(val ?? '')}">${hint}</div>`;
      case 'date': return `<div class="${cls}">${lab}<input id="${id}" name="${fd.name}" type="date" value="${val ? String(val).slice(0, 10) : ''}">${hint}</div>`;
      case 'checkbox': return `<div class="${cls}"><label class="chk"><input id="${id}" name="${fd.name}" type="checkbox" ${val ? 'checked' : ''}>${esc(fd.label)}</label>${hint}</div>`;
      case 'csv': return `<div class="${cls}">${lab}<input id="${id}" name="${fd.name}" type="text" value="${esc(Array.isArray(val) ? val.join(', ') : val || '')}">${hint || '<div class="hint">Separate with commas</div>'}</div>`;
      case 'select': { const v = val && val._id ? val._id : val; return `<div class="${cls}">${lab}<select id="${id}" name="${fd.name}"><option value="">${esc(fd.placeholder || 'Select…')}</option>${(fd.options || []).map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(v ?? '') ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}</select>${hint}</div>`; }
      case 'image': case 'video': case 'media': case 'images': case 'flatmedia': return `<div class="${cls}"><span class="lbl">${esc(fd.label)}</span><div data-w="${fd.name}"></div>${hint}</div>`;
      case 'options': return `<div class="${cls}"><span class="lbl">${esc(fd.label)}</span><div data-w="${fd.name}"></div><button type="button" class="btn sm lav" data-addopt="${fd.name}">+ Add option</button>${hint}</div>`;
      case 'bgmap': return `<div class="${cls}"><span class="lbl">${esc(fd.label)}</span>${hint}${PAGES.map((p) => `<div class="maprow"><b>${p}</b><div data-bg="${p}"></div></div>`).join('')}</div>`;
      case 'seomap': return `<div class="${cls}"><span class="lbl">${esc(fd.label)}</span>${PAGES.map((p) => { const s = (val || {})[p] || {}; return `<div class="maprow" data-seo="${p}"><b>${p}</b><div class="fgrid" style="grid-template-columns:1fr"><input type="text" data-k="title" placeholder="Page title" value="${esc(s.title)}"><input type="text" data-k="description" placeholder="Meta description" value="${esc(s.description)}"><input type="text" data-k="keywords" placeholder="Keywords (comma separated)" value="${esc(s.keywords)}"></div></div>`; }).join('')}</div>`;
      default: return `<div class="${cls}">${lab}<input id="${id}" name="${fd.name}" type="${fd.type === 'password' ? 'password' : 'text'}" value="${esc(val ?? '')}" ${fd.required ? 'required' : ''}>${hint}</div>`;
    }
  },
  build(fields, vals = {}) {
    const f = document.createElement('form'); f.className = 'fgrid'; f._st = {};
    f.innerHTML = fields.map((fd) => this.field(fd, fd.type === 'flatmedia' ? vals : getp(vals, fd.name || ''), f._st)).join('');
    fields.forEach((fd) => {
      const w = $(`[data-w="${fd.name}"]`, f);
      if (['image', 'video', 'media', 'images', 'flatmedia'].includes(fd.type) && w) {
        const multi = fd.type === 'images', init = fd.type === 'flatmedia' ? { url: vals.url, publicId: vals.publicId, type: vals.type } : getp(vals, fd.name);
        this.mediaWidget(w, init, { multi, accept: fd.type === 'image' || multi ? 'image/*' : fd.type === 'video' ? 'video/*' : 'image/*,video/*', folder: fd.folder || 'misc', onChange: (v) => (f._st[fd.name] = v) });
      }
      if (fd.type === 'options' && w) {
        const row = (o = {}) => `<div class="optrow"><input type="text" data-k="label" placeholder="Label (e.g. Name, Colour)" value="${esc(o.label)}"><select data-k="type">${['text', 'select', 'color'].map((t) => `<option ${o.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select><input type="text" data-k="choices" placeholder="Choices (comma separated)" value="${esc((o.choices || []).join(', '))}"><input type="number" data-k="extraPrice" placeholder="+₹" value="${esc(o.extraPrice || '')}"><button type="button" class="btn sm danger" data-del>×</button></div>`;
        (getp(vals, fd.name) || []).forEach((o) => w.insertAdjacentHTML('beforeend', row(o)));
        $(`[data-addopt="${fd.name}"]`, f).onclick = () => w.insertAdjacentHTML('beforeend', row());
        w.addEventListener('click', (e) => e.target.closest('[data-del]') && e.target.closest('.optrow').remove());
      }
      if (fd.type === 'bgmap') PAGES.forEach((p) => this.mediaWidget($(`[data-bg="${p}"]`, f), ((vals.pageBackgrounds || {})[p]), { multi: false, accept: 'image/*,video/*', folder: 'backgrounds', onChange: (v) => { (f._st[fd.name] = f._st[fd.name] || {})[p] = v; } }));
    });
    return f;
  },
  read(f, fields) {
    const out = {};
    for (const fd of fields) {
      if (fd.section) continue; const el = f.elements[fd.name]; let v;
      switch (fd.type) {
        case 'checkbox': v = el.checked; break;
        case 'number': v = el.value === '' ? undefined : Number(el.value); break;
        case 'date': v = el.value ? new Date(el.value).toISOString() : null; break;
        case 'csv': v = el.value.split(',').map((x) => x.trim()).filter(Boolean); break;
        case 'image': case 'video': case 'media': case 'images': v = f._st[fd.name] ?? (fd.type === 'images' ? [] : undefined); break;
        case 'flatmedia': Object.assign(out, f._st[fd.name] || {}); continue;
        case 'options': v = $$('.optrow', $(`[data-w="${fd.name}"]`, f)).map((r) => { const g = (k) => $(`[data-k=${k}]`, r).value.trim(); return { label: g('label'), type: g('type'), choices: g('choices').split(',').map((x) => x.trim()).filter(Boolean), extraPrice: Number(g('extraPrice')) || 0 }; }).filter((o) => o.label); break;
        case 'bgmap': v = {}; PAGES.forEach((p) => { const m = (f._st[fd.name] || {})[p]; if (m) v[p] = m.url ? { type: m.type || 'image', url: m.url, publicId: m.publicId } : { type: 'image', url: '', publicId: '' }; }); break;
        case 'seomap': v = {}; $$('[data-seo]', f).forEach((r) => { v[r.dataset.seo] = Object.fromEntries($$('[data-k]', r).map((i) => [i.dataset.k, i.value.trim()])); }); break;
        default: v = el ? el.value.trim() : undefined;
      }
      if (v !== undefined) setp(out, fd.name, v);
    }
    return out;
  },
};

/* ---------- Generic list + add/edit modal ---------- */
function Crud(view, o) {
  view.innerHTML = `<div class="page-head"><h2>${esc(o.title)}</h2><button class="btn gold" id="add">+ Add ${esc(o.single || 'new')}</button></div>${o.intro ? `<p class="muted">${o.intro}</p>` : ''}<div class="card"><div class="table-wrap" id="tbl"></div></div>`;
  let rows = [];
  const load = async () => {
    $('#tbl', view).innerHTML = '<div class="empty">Loading…</div>';
    try { const d = await API.get(o.list); rows = Array.isArray(d) ? d : d.items; } catch (x) { return ($('#tbl', view).innerHTML = `<div class="empty">${esc(x.message)}</div>`); }
    if (!rows.length) return ($('#tbl', view).innerHTML = `<div class="empty">Nothing here yet. Click “+ Add”.</div>`);
    $('#tbl', view).innerHTML = `<table><thead><tr>${o.columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}<th></th></tr></thead><tbody>${rows.map((r, i) => `<tr>${o.columns.map((c) => `<td>${c.render ? c.render(r) : esc(getp(r, c.key))}</td>`).join('')}<td><div class="actions"><button class="btn sm" data-e="${i}">Edit</button><button class="btn sm danger" data-d="${i}">Delete</button></div></td></tr>`).join('')}</tbody></table>`;
  };
  const edit = async (row) => {
    const fields = typeof o.fields === 'function' ? await o.fields() : o.fields, form = F.build(fields, row || o.defaults || {});
    const wrap = document.createElement('div'); wrap.appendChild(form); wrap.insertAdjacentHTML('beforeend', '<div class="bar"><button class="btn" data-c>Cancel</button><button class="btn gold" data-s>Save</button></div>');
    const m = Shell.modal((row ? 'Edit ' : 'Add ') + (o.single || 'item'), wrap, { wide: true });
    $('[data-c]', wrap).onclick = m.close;
    $('[data-s]', wrap).onclick = async (e) => {
      e.target.disabled = true;
      try { const body = F.read(form, fields); row ? await API.put(`${o.base}/${row._id}`, body) : await API.post(o.base, body); toast('Saved', 'ok'); m.close(); load(); } catch (x) { toast(x.message, 'err'); e.target.disabled = false; }
    };
  };
  view.addEventListener('click', async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'add') edit(); else if (b.dataset.e) edit(rows[+b.dataset.e]);
    else if (b.dataset.d && confirm('Delete this item? This cannot be undone.')) { try { await API.del(`${o.base}/${rows[+b.dataset.d]._id}`); toast('Deleted', 'ok'); load(); } catch (x) { toast(x.message, 'err'); } }
  });
  load(); return { reload: load };
}
const thumb = (r, k = 'image') => { const u = Array.isArray(r[k]) ? r[k][0]?.url : r[k]?.url; return u ? `<img class="th" src="${esc(u)}" alt="">` : '<span class="th" style="display:inline-block;width:44px;height:44px;border-radius:8px;background:var(--lav-l)"></span>'; };
const yesno = (v) => `<span class="badge ${v ? 'ok' : 'bad'}">${v ? 'Yes' : 'No'}</span>`;
