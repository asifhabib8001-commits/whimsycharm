const Cart = {
  key: 'wc_cart',
  items() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(i) { localStorage.setItem(this.key, JSON.stringify(i)); this.badge(); },
  snap(p, qty = 1, customization = []) { return { productId: p._id, slug: p.slug, name: p.name, image: p.images?.[0]?.url || '', price: p.price, qty, customization }; },
  add(p, qty = 1, customization = []) {
    const items = this.items(), key = JSON.stringify(customization);
    const ex = items.find((i) => i.productId === p._id && JSON.stringify(i.customization) === key);
    if (ex) ex.qty += qty; else items.push(this.snap(p, qty, customization));
    this.save(items);
  },
  setQty(idx, q) { const i = this.items(); if (i[idx]) { i[idx].qty = Math.max(1, Math.min(20, q)); this.save(i); } },
  remove(idx) { const i = this.items(); i.splice(idx, 1); this.save(i); },
  clear() { this.save([]); },
  count() { return this.items().reduce((a, i) => a + i.qty, 0); },
  payload(items = this.items()) { return items.map((i) => ({ productId: i.productId, qty: i.qty, customization: i.customization })); },
  badge() { const n = this.count(); document.querySelectorAll('[data-cart-count]').forEach((e) => { e.textContent = n; e.hidden = !n; }); },
  buyNow(p, qty = 1, customization = []) { localStorage.setItem('wc_buynow', JSON.stringify([this.snap(p, qty, customization)])); location.href = 'checkout.html?buy=1'; },

  // Razorpay checkout: true = paid, false = user ne band kar diya
  async pay(rz, order) {
    if (rz && rz.demo) { if (!confirm('DEMO PAYMENT\n\nThis is a demo checkout, no real money is used.\nPress OK to simulate a successful payment.')) return false; await API.post('/payment/verify', { demo_order: order._id }); return true; }
    if (!window.Razorpay) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = res; s.onerror = () => rej(new Error('Could not load the payment window')); document.head.appendChild(s); });
    const u = Auth.user || {};
    return new Promise((resolve, reject) => {
      const r = new Razorpay({
        key: rz.key, order_id: rz.orderId, amount: rz.amount, currency: rz.currency, name: 'WhimsyCharm', description: 'Order ' + order.orderNo,
        prefill: { name: order.address.name, email: u.email, contact: order.address.phone }, theme: { color: '#c9a227' },
        handler: async (resp) => { try { await API.post('/payment/verify', resp); resolve(true); } catch (e) { reject(e); } },
        modal: { ondismiss: () => resolve(false) },
      });
      r.on('payment.failed', () => UI.toast('Payment failed. Please try again.', 'err'));
      r.open();
    });
  },
};
