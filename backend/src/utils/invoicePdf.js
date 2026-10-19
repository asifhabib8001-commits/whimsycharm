const PDF = require('pdfkit');
module.exports = (o, s) => new Promise((resolve, reject) => {
  const d = new PDF({ margin: 50 }), b = [];
  d.on('data', (c) => b.push(c)); d.on('end', () => resolve(Buffer.concat(b))); d.on('error', reject);
  const inv = s.invoice || {};
  d.fontSize(22).fillColor('#b8860b').text(inv.businessName || s.businessName);
  d.fontSize(10).fillColor('#444').text(inv.address || s.address || '');
  if (inv.gstNumber) d.text('GSTIN: ' + inv.gstNumber);
  d.moveDown().fontSize(16).fillColor('#000').text('INVOICE');
  d.fontSize(10).text(`Invoice: ${o.invoiceNo || o.orderNo}    Order: ${o.orderNo}    Date: ${new Date(o.createdAt).toLocaleDateString('en-IN')}`);
  d.text(`Payment: ${o.paymentMethod} (${o.paymentStatus})`);
  const a = o.address;
  d.moveDown().text('Bill To:', { underline: true }).text(`${a.name}, ${a.phone}`).text(`${a.line1} ${a.line2 || ''}, ${a.city}, ${a.state || ''} - ${a.pincode}`);
  d.moveDown();
  o.items.forEach((i, n) => {
    const c = (i.customization || []).map((x) => `${x.label}: ${x.value}`).join(', ');
    d.text(`${n + 1}. ${i.name} x${i.qty} - Rs ${(i.price * i.qty).toFixed(2)}${c ? '\n     ' + c : ''}`);
  });
  d.moveDown();
  const row = (l, v) => d.text(`${l}: Rs ${v.toFixed(2)}`, { align: 'right' });
  row('Subtotal', o.subtotal); row('Shipping', o.shipping);
  if (o.giftWrapCharge) row('Gift wrap', o.giftWrapCharge);
  if (o.codCharge) row('COD charge', o.codCharge);
  if (o.discount) row('Discount', -o.discount);
  d.fontSize(13).text(`Total: Rs ${o.total.toFixed(2)}`, { align: 'right' });
  d.moveDown(2).fontSize(9).fillColor('#777').text('Thank you for shopping with WhimsyCharm. Handmade with love.', { align: 'center' });
  d.end();
});
