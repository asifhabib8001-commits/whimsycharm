runPage('Site Settings', async (v) => {
  let s = await API.get('/settings');
  const fields = [
    { section: 'Business' }, { name: 'businessName', label: 'Business name', type: 'text' }, { name: 'ownerNames', label: 'Owner name(s)', type: 'text' }, { name: 'tagline', label: 'Tagline', type: 'text', full: true }, { name: 'about', label: 'About / Story', type: 'textarea' },
    { section: 'Contact' }, { name: 'phones', label: 'Phone numbers', type: 'csv' }, { name: 'whatsapp', label: 'WhatsApp numbers (the first one is used for the chat button)', type: 'csv' }, { name: 'email', label: 'Email', type: 'text' }, { name: 'address', label: 'Address / city', type: 'text' }, { name: 'mapsLink', label: 'Google Maps link', type: 'text' },
    { name: 'social.instagram', label: 'Instagram link', type: 'text' }, { name: 'social.facebook', label: 'Facebook link', type: 'text' }, { name: 'social.youtube', label: 'YouTube link', type: 'text' },
    { section: 'Branding & home' }, { name: 'logo', label: 'Logo', type: 'image', folder: 'branding' }, { name: 'favicon', label: 'Favicon', type: 'image', folder: 'branding' }, { name: 'hero', label: 'Home hero (photo ya video)', type: 'media', folder: 'hero' },
    { section: 'Page backgrounds (optional photo / video)' }, { name: 'pageBackgrounds', label: 'Background per page', type: 'bgmap' },
    { section: 'SEO' }, { name: 'seo', label: 'Title / description / keywords per page', type: 'seomap' },
    { section: 'Invoice' }, { name: 'invoice.businessName', label: 'Business name on invoice', type: 'text' }, { name: 'invoice.gstNumber', label: 'GST number (if applicable)', type: 'text' }, { name: 'invoice.address', label: 'Address on invoice', type: 'text' },
    { section: 'Chatbot' }, { name: 'chatbot.enabled', label: 'AI chatbot ON', type: 'checkbox' }, { name: 'chatbot.tone', label: 'Chatbot tone', type: 'text', hint: 'e.g. friendly, warm and short' },
  ];
  v.innerHTML = '<div class="card"><div id="sf"></div><div class="bar actions" style="position:sticky;bottom:0;background:var(--card);padding:12px 0;margin-top:14px;justify-content:flex-end"><button class="btn gold" id="ss">Save all changes</button></div></div>';
  const form = F.build(fields, s); $('#sf').appendChild(form);
  $('#ss').onclick = async (e) => { e.target.disabled = true; try { s = await API.put('/settings', F.read(form, fields)); sessionStorage.removeItem('wc_set'); toast('Saved. Website par changes aa gaye.', 'ok'); } catch (x) { toast(x.message, 'err'); } e.target.disabled = false; };
});
