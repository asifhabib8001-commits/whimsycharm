(async () => {
  const s = await Settings.applyPage('custom-order', 'Custom Order'), u = Auth.user || {}, e = UI.esc, photos = [];
  const cats = await API.get('/categories').catch(() => []);
  UI.mount(`<div class="container section"><h1 class="center">Custom order</h1><p class="center muted">Tell us your idea and we will make it just for you ✨</p><div class="divider"></div><div class="form-card"><div id="m"></div><form id="f">
  <div class="row two"><div class="field"><label for="n">Your name</label><input id="n" value="${e(u.name || '')}" required></div><div class="field"><label for="p">Phone / WhatsApp</label><input id="p" type="tel" value="${e(u.phone || '')}" required></div></div>
  <div class="field"><label for="em">Email (optional)</label><input id="em" type="email" value="${e(u.email || '')}"></div>
  <div class="field"><label for="c">What would you like?</label><select id="c"><option value="">Select category</option>${cats.map((c) => `<option>${e(c.name)}</option>`).join('')}<option>Other</option></select></div>
  <div class="field"><label for="d">Describe your idea (colours, size, name, occasion…)</label><textarea id="d" required></textarea></div>
  <div class="row two"><div class="field"><label for="b">Budget (optional)</label><input id="b" placeholder="e.g. ₹1000"></div><div class="field"><label for="nb">Needed by (optional)</label><input id="nb" type="date"></div></div>
  <div class="field"><label for="ph">Reference photos</label>${Auth.loggedIn ? '<input id="ph" type="file" accept="image/*" multiple><div class="thumbs" id="pl"></div>' : '<p class="hint">To attach photos, please <a class="gold-text" href="login.html?next=custom-order.html"><b>log in</b></a>. You can also send the request without photos.</p>'}</div>
  <button class="btn btn-gold btn-block">Send request</button></form></div></div>`);
  if (Auth.loggedIn) Upload.bind($('#ph'), $('#pl'), photos, 5, 'custom-orders');
  $('#f').addEventListener('submit', async (ev) => { ev.preventDefault(); try { const d = await API.post('/custom-orders', { name: $('#n').value, phone: $('#p').value, email: $('#em').value, category: $('#c').value, description: $('#d').value, budget: $('#b').value, neededBy: $('#nb').value, photos }); $('.form-card').innerHTML = `<div class="center"><div class="tick">✓</div><h2>${e(d.message)}</h2><a class="btn btn-gold" href="index.html">Back to home</a></div>`; } catch (x) { $('#m').innerHTML = `<div class="form-msg err">${e(x.message)}</div>`; } });
})();
