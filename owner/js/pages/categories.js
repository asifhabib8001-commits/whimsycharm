runPage('Categories', (v) => Crud(v, {
  title: 'Categories', single: 'category', list: '/categories/admin/all', base: '/categories', defaults: { active: true, order: 0 },
  columns: [{ label: 'Photo', render: (r) => thumb(r) }, { label: 'Name', key: 'name' }, { label: 'Order', key: 'order' }, { label: 'Visible', render: (r) => yesno(r.active) }],
  fields: [{ name: 'name', label: 'Category name', type: 'text', required: true }, { name: 'order', label: 'Display order', type: 'number' }, { name: 'image', label: 'Category photo', type: 'image', folder: 'categories' }, { name: 'active', label: 'Show on website', type: 'checkbox' }],
}));
