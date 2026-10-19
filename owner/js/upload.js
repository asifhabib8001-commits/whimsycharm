const Upload = {
  // Chhoti file seedha backend se, badi video Cloudinary par signed direct upload (Vercel 4.5MB limit se bachne ke liye)
  async file(file, folder = 'misc') {
    if (!API.demo && file.size > 4 * 1024 * 1024) {
      if (file.size > 100 * 1024 * 1024) throw new Error('File is larger than 100MB');
      const g = await API.get('/upload/signature?folder=' + encodeURIComponent(folder));
      const fd = new FormData(); fd.append('file', file); fd.append('api_key', g.apiKey); fd.append('timestamp', g.timestamp); fd.append('signature', g.signature); fd.append('folder', g.folder);
      const r = await fetch(`https://api.cloudinary.com/v1_1/${g.cloudName}/auto/upload`, { method: 'POST', body: fd }), d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || 'Upload failed');
      return { url: d.secure_url, publicId: d.public_id, type: d.resource_type === 'video' ? 'video' : 'image' };
    }
    const fd = new FormData(); fd.append('file', file); fd.append('folder', folder);
    return API.post('/upload', fd);
  },
};
