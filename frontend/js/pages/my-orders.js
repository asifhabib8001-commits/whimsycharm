(async () => {
  if (!Auth.require()) return;
  await Settings.applyPage('my-orders', 'My Orders'); const e = UI.esc;
  const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];
  async function load() {
    UI.mount('<div class="container section"><h1>My orders</h1><div id="ol">' + UI.skel(2) + '</div></div>');
    let orders, rets = []; try { [orders, rets] = await Promise.all([API.get('/orders/my'), API.get('/returns/mine').catch(() => [])]); } catch (x) { return ($('#ol').innerHTML = `<div class="empty"><p>${e(x.message)}</p></div>`); }
    if (!orders.length) return ($('#ol').innerHTML = '<div class="empty"><h3>No orders yet</h3><a class="btn btn-gold" href="index.html">Start shopping</a></div>');
    $('#ol').innerHTML = orders.map((o) => {
      const idx = STEPS.indexOf(o.status), r = rets.find((x) => x.order === o._id), payPending = o.paymentMethod === 'Online' && ['Pending', 'Failed'].includes(o.paymentStatus) && o.status !== 'Cancelled';
      return `<div class="card order"><div class="order-head"><div><b>${e(o.orderNo)}</b><br><small class="muted">${UI.date(o.createdAt)}</small></div><div><span class="badge ${o.status === 'Cancelled' ? 'bad' : o.status === 'Delivered' ? 'ok' : 'warn'}">${e(o.status)}</span> <span class="badge ${o.paymentStatus === 'Paid' ? 'ok' : ''}">${e(o.paymentMethod)} · ${e(o.paymentStatus)}</span></div></div>
      ${o.status !== 'Cancelled' ? `<div class="track" aria-label="Order progress">${STEPS.map((s, i) => `<div class="st ${i <= idx ? 'done' : ''}">${s}</div>`).join('')}</div>` : ''}
      ${o.trackingId ? `<p><b>Tracking ID:</b> ${e(o.trackingId)}</p>` : ''}
      <div class="order-items">${o.items.map((i) => `<div class="it">${i.image ? `<img src="${e(i.image)}" alt="" loading="lazy">` : ''}<div>${e(i.name)} × ${i.qty}${(i.customization || []).map((c) => `<br><small class="muted">${e(c.label)}: ${e(c.value)}</small>`).join('')}</div><b style="margin-left:auto">${UI.money(i.price * i.qty)}</b></div>`).join('')}</div>
      <p style="margin-top:var(--s-3)"><b>Total: ${UI.money(o.total)}</b></p>${r ? `<p><span class="badge warn">${e(r.type)} request: ${e(r.status)}</span></p>` : ''}
      <div class="order-actions">${payPending ? `<button class="btn btn-gold btn-sm" data-pay="${o._id}">Pay now</button>` : ''}${o.finalized ? `<button class="btn btn-outline btn-sm" data-inv="${o._id}" data-no="${e(o.invoiceNo || o.orderNo)}">Invoice</button>` : ''}${['Placed', 'Packed'].includes(o.status) ? `<button class="btn btn-danger btn-sm" data-cancel="${o._id}">Cancel order</button>` : ''}${o.status === 'Delivered' && !r ? `<button class="btn btn-lav btn-sm" data-ret="${o._id}">Return / replace</button>` : ''}</div></div>`;
    }).join('');
  }
  document.addEventListener('click', async (ev) => {
    const t = ev.target.closest('button'); if (!t) return;
    try {
      if (t.dataset.inv) { const b = await API.blob(`/orders/${t.dataset.inv}/invoice`), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = t.dataset.no + (b.type.includes('html') ? '.html' : '.pdf'); a.click(); }
      if (t.dataset.cancel && confirm('Do you want to cancel this order?')) { await API.put(`/orders/${t.dataset.cancel}/cancel`, {}); UI.toast('Order cancelled', 'ok'); load(); }
      if (t.dataset.pay) { const d = await API.post('/payment/retry/' + t.dataset.pay); if (await Cart.pay(d.razorpay, d.order)) { UI.toast('Payment successful', 'ok'); load(); } }
      if (t.dataset.ret) {
        const photos = [], m = UI.modal(`<h3>Return / replace request</h3><form id="rf"><div class="field"><label for="rt">Request type</label><select id="rt"><option>Return</option><option>Replace</option><option>Refund</option></select></div><div class="field"><label for="rr">Reason</label><textarea id="rr" required></textarea></div><div class="field"><label for="rp">Photos (optional)</label><input id="rp" type="file" accept="image/*" multiple><div class="thumbs" id="rl"></div></div><button class="btn btn-gold btn-block">Submit request</button></form>`);
        Upload.bind($('#rp', m.el), $('#rl', m.el), photos, 4, 'returns');
        $('#rf', m.el).addEventListener('submit', async (x) => { x.preventDefault(); try { const d = await API.post('/returns', { orderId: t.dataset.ret, type: $('#rt', m.el).value, reason: $('#rr', m.el).value, photos }); UI.toast(d.message, 'ok'); m.close(); load(); } catch (er) { UI.toast(er.message, 'err'); } });
      }
    } catch (x) { UI.toast(x.message, 'err'); }
  });
  load();
})();
