/** Shared demo seed loader — powers module pages from JSON + localStorage */
const DemoData = {
  async load(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error(path);
    return r.json();
  },
  esc(s) {
    const d = document.createElement('div');
    d.textContent = s ?? '';
    return d.innerHTML;
  },
  fmtText(s) {
    return this.esc(s).replace(/\n/g, '<br>');
  },
  ls(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  lsSet(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  isAdmin() {
    return typeof DemoAuth !== 'undefined' && DemoAuth.isAdmin();
  }
};

const DemoModules = {
  async 'developer-blogger'() {
    const root = document.getElementById('module-root');
    if (!root) return;
    const seed = await DemoData.load('assets/data/developer-blogger.json');
    const KEY = 'uwec-dev-blogger';
    const render = () => {
      const data = DemoData.ls(KEY, seed);
      root.innerHTML = data.map(p => `
        <article class="demo-card">
          <h3>${DemoData.esc(p.title)}</h3>
          <time>${DemoData.esc(p.date)}</time>
          <div class="demo-body">${DemoData.fmtText(p.content)}</div>
        </article>`).join('');
      const admin = document.getElementById('demo-admin-bar');
      if (admin) admin.hidden = !DemoData.isAdmin();
    };
    render();
    document.getElementById('demo-add-btn')?.addEventListener('click', () => {
      if (!DemoData.isAdmin()) return;
      const title = prompt('Post title');
      if (!title) return;
      const content = prompt('Content') || '';
      const data = DemoData.ls(KEY, seed);
      data.unshift({ id: Date.now(), date: new Date().toISOString().slice(0, 19).replace('T', ' '), title, content });
      DemoData.lsSet(KEY, data);
      render();
    });
  },

  async gallery() {
    const root = document.getElementById('module-root');
    if (!root) return;
    const files = ['68bf54d7682e78.58113563.json', '68bf57a2e77788.54626782.json', '68bf57b6d964e2.08538274.json', '68bf57c0b7f905.15739495.json', '68bf57c45cb8b6.29001598.json', '68bf58dc21b6c0.62960793.json'];
    const labels = ['Harbour dawn', 'Coastal path', 'Market square', 'Old town lane', 'Sunset pier', 'Rainy café'];
    const items = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const m = await DemoData.load('assets/data/gallery/metadata/' + files[i]);
        m._label = labels[i] || m.title || 'Photo';
        items.push(m);
      } catch (_) {}
    }
    root.innerHTML = `<div class="demo-grid">${items.map(m => {
      const img = m.filename ? `assets/data/gallery/images/${m.filename}` : '';
      const visual = img
        ? `<img src="${img}" alt="">`
        : `<div class="demo-placeholder">📷</div>`;
      return `<figure class="demo-card">${visual}<figcaption>${DemoData.esc(m._label)}</figcaption></figure>`;
    }).join('')}</div>`;
  },

  async 'music-blogger'() {
    const root = document.getElementById('module-root');
    if (!root) return;
    const posts = await DemoData.load('assets/data/music-blogger.json');
    root.innerHTML = posts.map(p => `
      <div class="demo-card">
        <strong>${DemoData.esc(p.title)}</strong>
        <span class="demo-tag">${DemoData.esc(p.genre)}</span>
        <div>${DemoData.esc(p.artist)} · ${DemoData.esc(p.date)}</div>
        ${p.links ? `<a href="${DemoData.esc(p.links)}" target="_blank" rel="noopener">Listen</a>` : ''}
      </div>`).join('');
  },

  async shop() {
    const root = document.getElementById('module-root');
    const menu = await DemoData.load('assets/data/shop.json');
    root.innerHTML = `<p class="demo-lead">${DemoData.esc(menu.subtitle)}</p>` +
      menu.categories.map(cat => `
        <section class="demo-card">
          <h3>${DemoData.esc(cat.name)}</h3>
          ${cat.items.map(it => `
            <div class="demo-menu-row">
              <span><strong>${DemoData.esc(it.name)}</strong><br><small>${DemoData.esc(it.desc)}</small></span>
              <span>${DemoData.esc(it.price)} zł</span>
            </div>`).join('')}
        </section>`).join('');
  },

  async 'clipboard-catcher'() {
    const root = document.getElementById('module-root');
    const seed = await DemoData.load('assets/data/clipboard.json');
    const KEY = 'uwec-clipboard';
    const render = () => {
      const items = DemoData.ls(KEY, seed.items);
      root.innerHTML = `
        <button type="button" id="clip-paste" class="demo-btn">Simulate paste snippet</button>
        <table class="demo-table"><thead><tr><th>Title</th><th>Description</th><th>Type</th><th>Size</th><th>Date</th></tr></thead>
        <tbody>${items.map((it, i) => `<tr>
          <td>${DemoData.esc(it.title)}</td><td>${DemoData.esc(it.description)}</td>
          <td>${DemoData.esc(it.type)}</td><td>${DemoData.esc(it.size)}</td><td>${DemoData.esc(it.date)}</td>
        </tr>`).join('')}</tbody></table>`;
      document.getElementById('clip-paste')?.addEventListener('click', () => {
        const title = prompt('Clip title', 'Quick note');
        if (!title) return;
        items.unshift({ title, description: 'Pasted in demo', type: 'text/plain', size: '0.2 KB', date: new Date().toISOString().slice(0, 10) });
        DemoData.lsSet(KEY, items);
        render();
      });
    };
    render();
  },

  async 'comments-module'() {
    const root = document.getElementById('module-root');
    const seed = await DemoData.load('assets/data/comments.json');
    const KEY = 'uwec-comments';
    const render = () => {
      const msgs = DemoData.ls(KEY, seed.messages);
      root.innerHTML = `
        <form id="shout-form" class="demo-card">
          <textarea name="msg" rows="3" maxlength="255" placeholder="Shout something…"></textarea>
          <button type="submit">Post</button>
        </form>
        <div class="demo-shouts">${msgs.map(m => `
          <div class="demo-card"><strong>${DemoData.esc(m.user)}</strong>: ${DemoData.esc(m.text)}
          <small>${DemoData.esc(m.date)}</small></div>`).join('')}</div>`;
      document.getElementById('shout-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const text = e.target.msg.value.trim();
        if (!text) return;
        msgs.unshift({ user: DemoData.isAdmin() ? 'Demo Admin' : 'Guest', text, date: new Date().toLocaleString() });
        DemoData.lsSet(KEY, msgs);
        render();
      });
    };
    render();
  },

  async 'holiday-planner2'() {
    const root = document.getElementById('module-root');
    const seed = await DemoData.load('assets/data/holiday-planner.json');
    const KEY = 'uwec-trips';
    let active = seed.dossiers[0]?.id;
    const render = () => {
      const trips = DemoData.ls(KEY, seed.dossiers);
      const t = trips.find(x => x.id === active) || trips[0];
      root.innerHTML = `
        <div class="demo-tabs">${trips.map(tr => `
          <button type="button" class="demo-tab${tr.id === t.id ? ' active' : ''}" data-id="${tr.id}">${DemoData.esc(tr.name)}</button>`).join('')}</div>
        <section class="demo-card">
          <h3>${DemoData.esc(t.name)}</h3>
          <ul class="demo-facts">
            <li><strong>Depart:</strong> ${DemoData.esc(t.departure)}</li>
            <li><strong>Return:</strong> ${DemoData.esc(t.return)}</li>
            <li><strong>Destination:</strong> ${DemoData.esc(t.destination)}</li>
            <li><strong>Also:</strong> ${DemoData.esc(t.extra)}</li>
            <li><strong>From:</strong> ${DemoData.esc(t.from)}</li>
          </ul>
          <label>Notes<textarea id="trip-notes" rows="4">${DemoData.esc(t.notes)}</textarea></label>
          <button type="button" id="save-notes" class="demo-btn">Save notes (browser)</button>
        </section>`;
      root.querySelectorAll('.demo-tab').forEach(b => b.onclick = () => { active = b.dataset.id; render(); });
      document.getElementById('save-notes')?.addEventListener('click', () => {
        t.notes = document.getElementById('trip-notes').value;
        DemoData.lsSet(KEY, trips);
        alert('Notes saved locally.');
      });
    };
    render();
  },

  async 'useful-links'() {
    const root = document.getElementById('module-root');
    const links = await DemoData.load('assets/data/useful-links.json');
    root.innerHTML = `<table class="demo-table"><thead><tr><th>Link</th><th>Description</th><th>Added</th></tr></thead>
      <tbody>${links.map(l => `<tr>
        <td><a href="${DemoData.esc(l.url)}" target="_blank" rel="noopener">${DemoData.esc(l.title)}</a></td>
        <td>${DemoData.esc(l.desc)}</td><td>${DemoData.esc(l.date)}</td>
      </tr>`).join('')}</tbody></table>`;
  },

  async info() {
    const root = document.getElementById('module-root');
    const data = await DemoData.load('assets/data/info.json');
    root.innerHTML = data.sections.map(s => `
      <section class="demo-card"><h3>${DemoData.esc(s.title)}</h3><p>${DemoData.esc(s.body)}</p></section>`).join('');
  },

  async 'content-display'() {
    const root = document.getElementById('module-root');
    const articles = await DemoData.load('assets/data/content.json');
    const langs = ['en', 'pl', 'fr', 'de', 'es'];
    let lang = 'en';
    const render = () => {
      root.innerHTML = `
        <div class="demo-lang">${langs.map(l => `
          <button type="button" class="demo-tab${l === lang ? ' active' : ''}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>
        ${articles.slice(0, 3).map(a => `
          <article class="demo-card cms-article">
            <h2>${DemoData.esc(a['title_' + lang] || a.title_en)}</h2>
            <div>${a['content_' + lang] || a.content_en || ''}</div>
          </article>`).join('')}`;
      root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { lang = b.dataset.lang; render(); });
    };
    render();
  },

  async 'jason-constructor'() {
    const root = document.getElementById('module-root');
    const stores = ['developer-blogger.json', 'music-blogger.json', 'checklists.json', 'shop.json', 'caribbean-routes.json'];
    let current = stores[0];
    const render = async () => {
      const data = await DemoData.load('assets/data/' + current);
      root.innerHTML = `
        <div class="demo-tabs">${stores.map(s => `
          <button type="button" class="demo-tab${s === current ? ' active' : ''}" data-f="${s}">${s}</button>`).join('')}</div>
        <textarea id="json-editor" rows="18" class="demo-json">${JSON.stringify(data, null, 2)}</textarea>
        <button type="button" id="json-copy" class="demo-btn">Copy JSON</button>
        <p class="demo-note">Read-only view of bundled seed files. Edits here are not saved — use module demos for interactive localStorage writes.</p>`;
      root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { current = b.dataset.f; render(); });
      document.getElementById('json-copy')?.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById('json-editor').value);
      });
    };
    render();
  },

  async 'caribbean-connections'() {
    const root = document.getElementById('module-root');
    const d = await DemoData.load('assets/data/caribbean-routes.json');
    const ap = d.airports;
    let html = `<h2>${DemoData.esc(d.title)}</h2><p class="demo-lead">Updated ${DemoData.esc(d.updated)} · direct flights & ferries</p>`;
    html += '<div style="overflow-x:auto"><table class="demo-table caribbean-table"><tr><th>↓ / →</th>';
    ap.forEach(a => { html += `<th>${a}</th>`; });
    html += '</tr>';
    ap.forEach(from => {
      html += `<tr><th>${from}</th>`;
      ap.forEach(to => {
        if (from === to) { html += '<td class="na">—</td>'; return; }
        const r = d.routes[from]?.[to];
        if (!r) { html += '<td class="nodirect">No direct</td>'; return; }
        html += `<td class="direct">${DemoData.esc(r.duration)}<br>${r.airlines.map(c => `<span class="air-tag">${c}</span>`).join(' ')}${r.ferry ? ' 🚢' : ''}</td>`;
      });
      html += '</tr>';
    });
    html += '</table></div><p class="demo-lead">Green = direct · Blue = no direct · 🚢 = ferry option</p>';
    root.innerHTML = html;
  },

  async 'caribbean-connections-buttons'() {
    await DemoModules['caribbean-connections']();
    const root = document.getElementById('module-root');
    const bar = document.createElement('div');
    bar.className = 'demo-card';
    bar.innerHTML = `<p>Filter controls demo:</p>
      <button type="button" class="demo-btn" id="c-hide-flights">Toggle flights</button>
      <button type="button" class="demo-btn" id="c-hide-ferry">Toggle ferries</button>
      <select id="c-dest"><option value="">All destinations</option></select>`;
    root.prepend(bar);
    const d = await DemoData.load('assets/data/caribbean-routes.json');
    const sel = document.getElementById('c-dest');
    d.airports.forEach(a => { const o = document.createElement('option'); o.value = a; o.textContent = a; sel.appendChild(o); });
    let showFlights = true, showFerry = true;
    const refresh = () => {
      root.querySelectorAll('.direct').forEach(cell => {
        cell.style.opacity = showFlights ? '1' : '0.25';
        if (!showFerry) cell.innerHTML = cell.innerHTML.replace(/🚢/g, '');
      });
    };
    document.getElementById('c-hide-flights').onclick = () => { showFlights = !showFlights; refresh(); };
    document.getElementById('c-hide-ferry').onclick = () => { showFerry = !showFerry; refresh(); };
  },

  async admin() {
    const root = document.getElementById('module-root');
    const tools = [
      { id: 'content', desc: 'Edit CMS articles across 14 languages — content.json drives the content-display demo.' },
      { id: 'styles', desc: 'Merge CSS modules into main.css. Style inspector shows computed tokens.' },
      { id: 'menu', desc: 'Navigation tree from menu_data.json — hamburger vs mega-menu experiments.' },
      { id: 'gallery', desc: 'Upload metadata + thumbnails. Read-only in static mode with bundled images.' },
      { id: 'backup', desc: 'Export localStorage demo state as JSON download.' },
      { id: 'users', desc: 'Demo admin gate only — sessionStorage simulates login.' }
    ];
    root.innerHTML = tools.map(t => `
      <div class="demo-card admin-tool" data-id="${t.id}">
        <h3>${DemoData.esc(t.id)}</h3><p>${DemoData.esc(t.desc)}</p>
      </div>`).join('');
    root.querySelectorAll('.admin-tool').forEach(el => el.addEventListener('click', () => {
      if (!DemoData.isAdmin()) { alert('Login as Demo Admin first (footer).'); return; }
      el.classList.toggle('selected');
    }));
    document.getElementById('export-demo')?.addEventListener('click', () => {
      if (!DemoData.isAdmin()) return;
      const dump = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('uwec-')) dump[k] = JSON.parse(localStorage.getItem(k));
      }
      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'uwec-demo-export.json';
      a.click();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const demo = document.body.dataset.demo;
  if (demo && DemoModules[demo]) DemoModules[demo]().catch(console.error);
});
