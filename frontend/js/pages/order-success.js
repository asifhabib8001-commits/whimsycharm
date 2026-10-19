(async () => {
  if (!Auth.require()) return;
  await Settings.applyPage('order-success', 'Order placed'); const e = UI.esc;
  let o; try { o = await API.get('/orders/' + UI.qs('id')); } catch { return UI.mount('<div class="empty"><h3>Order not found</h3><a class="btn btn-gold" href="my-orders.html">My orders</a></div>'); }
  const pending = o.paymentMethod === 'Online' && o.paymentStatus !== 'Paid';
  UI.mount(`<div class="container"><div class="success-card"><div class="tick" aria-hidden="true">✓</div><h1>${pending ? 'Confirming your payment…' : 'Thank you for your order!'}</h1>
    <p class="muted">${pending ? 'You will receive an email as soon as the payment is confirmed.' : `A confirmation email has been sent to ${e(Auth.user?.email || '')}.`}</p>
    <div class="card" style="text-align:left;margin-block:var(--s-4)"><p><b>Order no:</b> ${e(o.orderNo)}<br><b>Total:</b> ${UI.money(o.total)} · ${e(o.paymentMethod)} (${e(o.paymentStatus)})<br><b>Deliver to:</b> ${e(o.address.name)}, ${e(o.address.line1)}, ${e(o.address.city)} - ${e(o.address.pincode)}</p>
    ${o.items.map((i) => `<div class="line" style="display:flex;justify-content:space-between"><span>${e(i.name)} × ${i.qty}${i.madeToOrderDays ? ` <small class="muted">(ready in ${i.madeToOrderDays} days)</small>` : ''}</span><span>${UI.money(i.price * i.qty)}</span></div>`).join('')}</div>
    <div class="hero-cta">${o.finalized ? '<button class="btn btn-gold" id="inv">Download invoice</button>' : ''}<a class="btn btn-outline" href="my-orders.html">Track order</a><a class="btn btn-ghost" href="index.html">Continue shopping</a></div></div></div>`);
  $('#inv')?.addEventListener('click', async () => { try { const b = await API.blob(`/orders/${o._id}/invoice`), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = (o.invoiceNo || o.orderNo) + (b.type.includes('html') ? '.html' : '.pdf'); a.click(); } catch (x) { UI.toast(x.message, 'err'); } });
})();
