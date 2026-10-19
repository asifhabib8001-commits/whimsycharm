(async () => {
  if (!Auth.require()) return;
  const s = await Settings.applyPage('checkout', 'Checkout'), e = UI.esc, buy = UI.qs('buy');
  let items = buy ? JSON.parse(localStorage.getItem('wc_buynow') || '[]') : Cart.items();
  if (!items.length) return UI.mount('<div class="container"><div class="empty"><h3>Nothing to checkout</h3><a class="btn btn-gold" href="index.html">Shop now</a></div></div>');
  const u = Auth.user || {}, a0 = (u.addresses || [])[0] || {}, v = (k, d = '') => e(a0[k] || d);
  let coupon = '', q = null;
  UI.mount(`<div class="container section"><h1>Checkout</h1><div class="co-layout"><form id="co" novalidate><div id="msg"></div>
    <section class="co-step"><h3><span class="n">1</span>Delivery details</h3><div class="row two"><div class="field"><label for="n">Full name</label><input id="n" autocomplete="name" value="${v('name', u.name)}" required></div><div class="field"><label for="ph">Phone</label><input id="ph" type="tel" inputmode="numeric" autocomplete="tel" value="${v('phone', u.phone)}" required></div></div>
      <div class="field"><label for="l1">Address</label><input id="l1" autocomplete="address-line1" value="${v('line1')}" required></div><div class="field"><label for="l2">Landmark / area (optional)</label><input id="l2" value="${v('line2')}"></div>
      <div class="row two"><div class="field"><label for="ct">City</label><input id="ct" autocomplete="address-level2" value="${v('city')}" required></div><div class="field"><label for="stt">State</label><input id="stt" autocomplete="address-level1" value="${v('state')}"></div></div>
      <div class="field"><label for="pin">Pincode</label><input id="pin" inputmode="numeric" maxlength="6" autocomplete="postal-code" value="${v('pincode')}" required><div class="hint" id="pinr" aria-live="polite"></div></div></section>
    <section class="co-step"><h3><span class="n">2</span>Gift &amp; coupon</h3><label class="check"><input type="checkbox" id="gw"><span>Gift wrap${s.giftWrapPrice ? ` (+${UI.money(s.giftWrapPrice)})` : ''}</span></label>
      <div class="field" id="gmw" hidden style="margin-top:var(--s-3)"><label for="gm">Gift message</label><textarea id="gm" maxlength="300"></textarea></div>
      <div class="field" style="margin-top:var(--s-3)"><label for="cp">Coupon code</label><div class="pin-check"><input id="cp" autocapitalize="characters" placeholder="Enter code"><button class="btn btn-lav" id="cpb" type="button">Apply</button></div><div class="hint" id="cpr" aria-live="polite"></div></div>
      <div class="field"><label for="nt">Note to us (optional)</label><input id="nt" maxlength="500"></div></section>
    <section class="co-step"><h3><span class="n">3</span>Payment method</h3><label class="pay-opt"><input type="radio" name="pm" value="Online" checked><span><b>Pay online</b><br><small class="muted">UPI, cards, netbanking (Razorpay)</small></span></label><label class="pay-opt" id="codo"><input type="radio" name="pm" value="COD"><span><b>Cash on delivery</b><br><small class="muted" id="codn"></small></span></label></section></form>
    <aside class="summary"><h3>Order summary</h3><div id="sum"><div class="skel" style="height:140px"></div></div><button class="btn btn-gold btn-block" id="pay" form="co" disabled style="margin-top:var(--s-3)">Pay Now</button><div class="secure">🔒 Secure payment by Razorpay</div></aside></div></div>`);

  const pm = () => $('input[name=pm]:checked').value, msg = (t, c = 'err') => { $('#msg').innerHTML = t ? `<div class="form-msg ${c}">${e(t)}</div>` : ''; };
  async function requote() {
    const pin = $('#pin').value.trim();
    try {
      q = await API.post('/orders/quote', { items: Cart.payload(items), pincode: /^\d{6}$/.test(pin) ? pin : undefined, couponCode: coupon || undefined, giftWrap: $('#gw').checked, paymentMethod: pm() });
      $('#pinr').textContent = /^\d{6}$/.test(pin) ? '✓ Delivery available' : ''; msg('');
      const L = (l, v, c = '') => `<div class="line ${c}"><span>${l}</span><b>${v}</b></div>`;
      $('#sum').innerHTML = items.map((i, idx) => `<div class="line"><span>${e(i.name)} × ${i.qty}</span><span>${UI.money(q.lines[idx].price * i.qty)}</span></div>`).join('') + '<hr style="border:0;border-top:1px dashed var(--border)">' + L('Subtotal', UI.money(q.subtotal)) + L('Shipping', q.shipping ? UI.money(q.shipping) : 'Free') + (q.codCharge ? L('COD charge', UI.money(q.codCharge)) : '') + (q.giftWrapCharge ? L('Gift wrap', UI.money(q.giftWrapCharge)) : '') + (q.discount ? L('Discount', '− ' + UI.money(q.discount), 'disc') : '') + L('Total', UI.money(q.total), 'total');
      $('#pay').textContent = pm() === 'COD' ? `Place Order · ${UI.money(q.total)}` : `Pay Now · ${UI.money(q.total)}`; $('#pay').disabled = false;
      $('#codo').hidden = !q.codAvailable; if (!q.codAvailable && pm() === 'COD') { $$('input[name=pm]')[0].checked = true; }
      $('#codn').textContent = s.shipping?.codCharge ? `Extra ${UI.money(s.shipping.codCharge)} COD charge` : '';
    } catch (x) { $('#pay').disabled = true; if (/pincode|deliver/i.test(x.message)) $('#pinr').textContent = '✗ ' + x.message; else msg(x.message); if (/Coupon|coupon/.test(x.message)) { coupon = ''; $('#cpr').textContent = x.message; requote_noCoupon(); } }
  }
  async function requote_noCoupon() { try { coupon = ''; await requote(); } catch { /* ignore */ } }
  $('#pin').addEventListener('change', requote); $('#gw').addEventListener('change', () => { $('#gmw').hidden = !$('#gw').checked; requote(); }); $$('input[name=pm]').forEach((r) => r.addEventListener('change', requote));
  $('#cpb').addEventListener('click', async () => { const c = $('#cp').value.trim(); if (!c) return; coupon = c; await requote(); if (q && coupon) { $('#cpr').textContent = q.discount ? `✓ ${coupon.toUpperCase()} applied, you save ${UI.money(q.discount)}` : ''; } });
  await requote();

  $('#co').addEventListener('submit', async (ev) => {
    ev.preventDefault(); msg('');
    const addr = { name: $('#n').value.trim(), phone: $('#ph').value.trim(), line1: $('#l1').value.trim(), line2: $('#l2').value.trim(), city: $('#ct').value.trim(), state: $('#stt').value.trim(), pincode: $('#pin').value.trim() };
    if (!addr.name || !/^\d{10}$/.test(addr.phone.replace(/\D/g, '').slice(-10)) || !addr.line1 || !addr.city || !/^\d{6}$/.test(addr.pincode)) return msg('Please enter a valid name, 10-digit phone, address, city and 6-digit pincode.');
    const btn = $('#pay'); btn.disabled = true; const label = btn.textContent; btn.textContent = 'Please wait…';
    try {
      const d = await API.post('/orders', { items: Cart.payload(items), address: addr, paymentMethod: pm(), couponCode: coupon || undefined, gift: { wrap: $('#gw').checked, message: $('#gm').value }, note: $('#nt').value });
      if (!(u.addresses || []).length) API.put('/auth/profile', { addresses: [addr] }).catch(() => {});
      const done = () => { buy ? localStorage.removeItem('wc_buynow') : Cart.clear(); location.href = 'order-success.html?id=' + d.order._id; };
      if (pm() === 'COD') return done();
      const paid = await Cart.pay(d.razorpay, d.order);
      if (paid) done(); else { msg('Payment was not completed. You can pay again from My Orders.'); btn.disabled = false; btn.textContent = label; localStorage.removeItem('wc_buynow'); setTimeout(() => (location.href = 'my-orders.html'), 2500); }
    } catch (x) { msg(x.message); btn.disabled = false; btn.textContent = label; }
  });
})();
