const Upload = {
  async file(file, folder = 'misc') {
    if (!Auth.loggedIn) throw new Error('Please log in to upload photos');
    const fd = new FormData(); fd.append('file', file); fd.append('folder', folder);
    return API.post('/upload', fd);
  },
  // input se photos lekar store array me daalta hai aur thumbnails dikhata hai
  bind(input, list, store, max = 5, folder = 'misc') {
    const render = () => { list.innerHTML = store.map((p, i) => `<span class="thumb"><img src="${UI.esc(p.url)}" alt=""><button type="button" data-rm="${i}" aria-label="Remove photo">×</button></span>`).join(''); };
    input.addEventListener('change', async () => {
      for (const f of [...input.files]) {
        if (store.length >= max) { UI.toast(`Maximum ${max} photos`); break; }
        try { const r = await this.file(f, folder); store.push({ url: r.url, publicId: r.publicId }); render(); } catch (e) { UI.toast(e.message, 'err'); }
      }
      input.value = '';
    });
    list.addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) { store.splice(+b.dataset.rm, 1); render(); } });
  },
};
