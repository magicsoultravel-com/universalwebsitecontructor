/** Client-side demo admin — no real auth, sessionStorage only */
const DemoAuth = {
  key: 'uwec-demo-user',

  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(this.key));
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.getUser();
  },

  isAdmin() {
    const u = this.getUser();
    return !!(u && u.admin);
  },

  loginAsAdmin() {
    sessionStorage.setItem(this.key, JSON.stringify({
      email: 'demo@uwec.local',
      admin: true
    }));
    this.renderFooter('#demo-auth-footer');
  },

  logout() {
    sessionStorage.removeItem(this.key);
    this.renderFooter('#demo-auth-footer');
  },

  renderFooter(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    const u = this.getUser();
    if (u) {
      el.innerHTML = `<footer class="bottom-login-status">
        ${u.admin ? '<nav class="admin-nav"><a href="demo-admin.html">Admin Panel</a></nav>' : ''}
        <div class="user-status">Logged in as ${u.email} |
          <a href="#" id="demo-logout">Logout</a></div>
      </footer>`;
      el.querySelector('#demo-logout')?.addEventListener('click', e => {
        e.preventDefault();
        this.logout();
      });
    } else {
      el.innerHTML = `<footer class="bottom-login-status">
        <button type="button" id="demo-login-btn">Login as Demo Admin</button>
        <div class="user-status">Not logged in</div>
      </footer>`;
      el.querySelector('#demo-login-btn')?.addEventListener('click', () => this.loginAsAdmin());
    }
  }
};
