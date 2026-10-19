runPage('Dashboard', async (v) => {
  v.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const d = await API.get('/dashboard'), max = Math.max(1, ...d.daily.map((x) => x.sales));
    const S = (l, n, href, alert) => `<a class="stat ${alert ? 'alert' : ''}" ${href ? `href="${href}"` : ''}><b>${n}</b><span>${l}</span></a>`;
    v.innerHTML = `<div class="stats">${S('Total sales', money(d.totalSales))}${S('Total orders', d.totalOrders, 'orders.html')}${S('Orders to process', d.pendingOrders, 'orders.html', d.pendingOrders)}${S('Customers', d.customers)}${S('New reviews', d.pendingReviews, 'reviews.html', d.pendingReviews)}${S('Custom orders', d.newCustomOrders, 'enquiries.html', d.newCustomOrders)}${S('Bulk enquiries', d.newBulkEnquiries, 'enquiries.html', d.newBulkEnquiries)}${S('Return requests', d.openReturns, 'enquiries.html', d.openReturns)}${S('Subscribers', d.subscribers, 'content.html')}</div>
    <div class="split"><div><div class="card"><h3>Sales, last 30 days</h3>${d.daily.length ? `<div class="bars" role="img" aria-label="Daily sales chart">${d.daily.map((x) => `<i style="height:${Math.max(3, (x.sales / max) * 100)}%" title="${x._id}: ${money(x.sales)} (${x.orders} orders)"></i>`).join('')}</div>` : '<div class="empty">No sales yet</div>'}</div>
    <div class="card"><h3>Recent orders</h3><div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>${d.recentOrders.map((o) => `<tr><td><a href="orders.html">${esc(o.orderNo)}</a></td><td>${esc(o.address?.name)}</td><td>${money(o.total)}</td><td><span class="badge">${esc(o.status)}</span></td></tr>`).join('') || '<tr><td colspan="4" class="muted">No orders yet</td></tr>'}</tbody></table></div></div></div>
    <div class="card"><h3>Low stock</h3>${d.lowStock.length ? d.lowStock.map((p) => `<p><a href="products.html">${esc(p.name)}</a> <span class="badge ${p.stock ? 'warn' : 'bad'}">${p.stock} left</span></p>`).join('') : '<p class="muted">All good 👍</p>'}</div></div>`;
  } catch (x) { v.innerHTML = `<div class="empty">${esc(x.message)}</div>`; }
});
