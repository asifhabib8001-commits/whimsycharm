runPage('Products', (v) => Crud(v, {
  title: 'Products', single: 'product', list: '/products/admin/all', base: '/products', defaults: { active: true, stock: 1, giftWrapAvailable: true, madeToOrderDays: 0 },
  columns: [{ label: 'Photo', render: (r) => thumb(r, 'images') }, { label: 'Name', key: 'name' }, { label: 'Category', render: (r) => esc(r.category?.name) }, { label: 'Price', render: (r) => money(r.price) },
    { label: 'Stock', render: (r) => (r.madeToOrderDays ? `<span class="badge warn">Made to order</span>` : `<span class="badge ${r.stock > 3 ? 'ok' : 'bad'}">${r.stock}</span>`) }, { label: 'Visible', render: (r) => yesno(r.active) }],
  fields: async () => { const cats = await API.get('/categories/admin/all'); return [
    { name: 'name', label: 'Product name', type: 'text', required: true }, { name: 'category', label: 'Category', type: 'select', options: cats.map((c) => ({ v: c._id, l: c.name })) },
    { name: 'price', label: 'Selling price (₹)', type: 'number' }, { name: 'mrp', label: 'MRP / cut price (₹, optional)', type: 'number' },
    { name: 'stock', label: 'Stock quantity', type: 'number' }, { name: 'madeToOrderDays', label: 'Made-to-order days', type: 'number', hint: '0 = ready stock. If greater than 0, "Ready in X days" is shown and stock limits are not applied.' },
    { name: 'material', label: 'Material', type: 'text' }, { name: 'tags', label: 'Tags', type: 'csv' },
    { name: 'description', label: 'Description', type: 'textarea' }, { name: 'careInstructions', label: 'Care instructions', type: 'textarea' },
    { name: 'images', label: 'Photos (the first is the main photo, the second shows on hover)', type: 'images', folder: 'products' }, { name: 'video', label: 'Video (optional)', type: 'video', folder: 'products' },
    { name: 'customizationOptions', label: 'Customization options', type: 'options', hint: 'Example: Name (text), Colour (select: Red, Blue). “+₹” is the extra price when the customer fills it in.' },
    { name: 'giftWrapAvailable', label: 'Gift wrap available', type: 'checkbox' }, { name: 'featured', label: 'Featured', type: 'checkbox' }, { name: 'active', label: 'Show on website', type: 'checkbox' }]; },
}));
