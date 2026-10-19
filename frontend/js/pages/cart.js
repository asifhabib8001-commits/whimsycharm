(async () => {
  await Settings.applyPage('cart', 'Your Cart');
  const e = UI.esc;
  async function render() {
    const items = Cart.items();
    if (!items.length) return UI.mount('<div class="container"><div class="empty"><h3>Your cart is empty</h3><p>Let’s find something lovely.</p><a class="btn btn-gold" href="index.html">Start shopping</a></div></div>');
    let q = null, note = '';
    try { q = await API.post('/orders/quote', { items: Cart.payload() }); } catch (x) { note = x.message; }
    const price = (i, idx) => q?.lines?.[idx]?.price ?? i.price;
    const sub = items.reduce((a, i, idx) => a + price(i, idx) * i.qty, 0);
    UI.mount(`<div class="container section"><h1>Your cart</h1>${note ? `<div class="form-msg err">${e(note)}</div>` : ''}<div class="cart-layout"><div>${items.map((i, idx) => `<div class="cart-item"><a href="product.html?p=${e(i.slug)}"><img src="${e(i.image)}" alt="${e(i.name)}" loading="lazy"></a>
      <div><h3><a href="product.html?p=${e(i.slug)}">${e(i.name)}</a></h3>${i.customization.map((c) => `<div class="meta">${e(c.label)}: ${e(c.value)}</div>`).join('')}<b>${UI.money(price(i, idx))}</b></div>
      <div class="ctrl"><div class="qty"><button data-q="${idx}" data-d="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-q="${idx}" data-d="1" aria-label="Increase">+</button></div><button class="btn btn-ghost btn-sm" data-rm="${idx}">Remove</button></div></div>`).join('')}</div>
      <aside class="summary"><h3>Order summary</h3><div class="line"><span>Subtotal</span><b>${UI.money(sub)}</b></div><p class="muted" style="font-size:var(--fs-xs)">Shipping, coupon and gift options are added at checkout.</p><a class="btn btn-gold btn-block" href="checkout.html">Proceed to checkout</a><a class="btn btn-ghost btn-block" href="index.html" style="margin-top:8px">Continue shopping</a></aside></div></div>`);
    $$('[data-q]').forEach((b) => b.onclick = () => { Cart.setQty(+b.dataset.q, Cart.items()[+b.dataset.q].qty + +b.dataset.d); render(); });
    $$('[data-rm]').forEach((b) => b.onclick = () => { Cart.remove(+b.dataset.rm); render(); });
  }
  render();
})();
