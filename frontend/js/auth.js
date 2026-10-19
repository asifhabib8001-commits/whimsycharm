const Auth = {
  get token() { return localStorage.getItem('wc_token'); },
  get user() { try { return JSON.parse(localStorage.getItem('wc_user')); } catch { return null; } },
  get loggedIn() { return !!this.token && !!this.user; },
  set(token, user) { localStorage.setItem('wc_token', token); localStorage.setItem('wc_user', JSON.stringify(user)); },
  clear() { localStorage.removeItem('wc_token'); localStorage.removeItem('wc_user'); },
  async refresh() { if (!this.token) return null; try { const d = await API.get('/auth/me'); localStorage.setItem('wc_user', JSON.stringify(d.user)); return d.user; } catch { return null; } },
  logout() { this.clear(); location.href = 'index.html'; },
  require() {
    if (this.loggedIn) return true;
    location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search);
    return false;
  },
  async afterLogin(d) { this.set(d.token, d.user); await Wishlist.sync(); },
};
