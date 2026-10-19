(async () => {
  if (!Auth.require()) return;
  await Settings.applyPage('profile', 'My Account');
  const e = UI.esc; let u = (await Auth.refresh()) || Auth.user;
  let addrs = (u.addresses || []).slice(0, 3);
  const aHtml = () => addrs.map((a, i) => `<div class="addr" data-i="${i}"><div class="row two"><div class="field"><label>Name</label><input data-k="name" value="${e(a.name)}"></div><div class="field"><label>Phone</label><input data-k="phone" value="${e(a.phone)}"></div></div><div class="field"><label>Address</label><input data-k="line1" value="${e(a.line1)}"></div><div class="row two"><div class="field"><label>City</label><input data-k="city" value="${e(a.city)}"></div><div class="field"><label>Pincode</label><input data-k="pincode" value="${e(a.pincode)}" maxlength="6"></div></div><button type="button" class="btn btn-ghost btn-sm" data-del="${i}">Remove address</button></div>`).join('');
  UI.mount(`<div class="container section"><h1>My account</h1><div class="pill-row" style="margin-bottom:var(--s-4)"><a class="chip" href="my-orders.html">My orders</a><a class="chip" href="wishlist.html">Wishlist</a><button class="chip" id="lo">Logout</button></div>
  <div class="form-card"><form id="pf"><div class="field"><label for="pn">Name</label><input id="pn" value="${e(u.name)}" required></div><div class="field"><label for="pp">Phone</label><input id="pp" type="tel" value="${e(u.phone || '')}"></div>
  <div class="field"><label>Email</label><input value="${e(u.email)}" disabled> ${u.emailVerified ? '<span class="badge ok">Verified</span>' : '<span class="badge warn">Not verified</span> <button type="button" class="btn btn-lav btn-sm" id="rv">Resend verification email</button>'}</div>
  <h3>Saved addresses</h3><div id="al">${aHtml()}</div>${addrs.length < 3 ? '<button type="button" class="btn btn-outline btn-sm" id="aa">+ Add address</button>' : ''}<div style="margin-top:var(--s-4)"><button class="btn btn-gold">Save changes</button></div></form></div>
  <div class="form-card" style="margin-top:var(--s-5)"><h3>Change password</h3><form id="cp"><div class="field"><label for="c1">Current password</label><input id="c1" type="password" autocomplete="current-password" required></div><div class="field"><label for="c2">New password (min 6)</label><input id="c2" type="password" autocomplete="new-password" minlength="6" required></div><button class="btn btn-lav">Update password</button></form></div></div>`);
  const read = () => $$('#al .addr').map((d) => Object.fromEntries($$('[data-k]', d).map((i) => [i.dataset.k, i.value.trim()])));
  $('#lo').onclick = () => Auth.logout();
  $('#rv')?.addEventListener('click', async () => { try { await API.post('/auth/resend-verification', {}); UI.toast('Email bhej diya', 'ok'); } catch (x) { UI.toast(x.message, 'err'); } });
  $('#aa')?.addEventListener('click', () => { addrs = read(); addrs.push({}); $('#al').innerHTML = aHtml(); });
  $('#al').addEventListener('click', (ev) => { const b = ev.target.closest('[data-del]'); if (b) { addrs = read(); addrs.splice(+b.dataset.del, 1); $('#al').innerHTML = aHtml(); } });
  $('#pf').addEventListener('submit', async (ev) => { ev.preventDefault(); try { const d = await API.put('/auth/profile', { name: $('#pn').value, phone: $('#pp').value, addresses: read().filter((a) => a.line1) }); Auth.set(Auth.token, d.user); UI.toast('Profile saved', 'ok'); } catch (x) { UI.toast(x.message, 'err'); } });
  $('#cp').addEventListener('submit', async (ev) => { ev.preventDefault(); try { await API.put('/auth/change-password', { currentPassword: $('#c1').value, newPassword: $('#c2').value }); UI.toast('Password updated', 'ok'); ev.target.reset(); } catch (x) { UI.toast(x.message, 'err'); } });
})();
