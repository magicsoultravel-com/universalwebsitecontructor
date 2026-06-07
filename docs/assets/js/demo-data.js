/** Load JSON seed data and render simple static demos */
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
  }
};

async function initDeveloperBlogger() {
  const root = document.getElementById('dev-blogger-root');
  if (!root) return;
  const posts = await DemoData.load('assets/data/developer-blogger.json');
  const isAdmin = () => typeof DemoAuth !== 'undefined' && DemoAuth.isAdmin();
  function render() {
    const key = 'uwec-dev-blogger';
    let data = posts;
    try {
      const stored = localStorage.getItem(key);
      if (stored) data = JSON.parse(stored);
    } catch (_) {}
    root.innerHTML = data.map(p => `
      <article style="margin:16px 0;padding:16px;background:#1a1a1a;border-radius:12px">
        <h3>${DemoData.esc(p.title)}</h3>
        <time style="color:#888">${DemoData.esc(p.date)}</time>
        <div>${DemoData.esc(p.content)}</div>
      </article>`).join('') || '<p>No posts yet.</p>';
    const admin = document.getElementById('dev-blogger-admin');
    if (admin) {
      admin.style.display = isAdmin() ? 'block' : 'none';
    }
  }
  render();
  document.getElementById('dev-blogger-add')?.addEventListener('click', () => {
    if (!isAdmin()) return;
    const title = prompt('Title');
    if (!title) return;
    const content = prompt('Content') || '';
    const key = 'uwec-dev-blogger';
    let data = posts;
    try { const s = localStorage.getItem(key); if (s) data = JSON.parse(s); } catch (_) {}
    data.unshift({ id: Date.now(), date: new Date().toISOString().slice(0,19).replace('T',' '), title, content });
    localStorage.setItem(key, JSON.stringify(data));
    render();
  });
  setInterval(render, 500);
}

async function initGallery() {
  const root = document.getElementById('gallery-root');
  if (!root) return;
  const metaDir = 'assets/data/gallery/metadata/';
  const files = ['68bf54d7682e78.58113563.json','68bf57a2e77788.54626782.json','68bf57b6d964e2.08538274.json','68bf57c0b7f905.15739495.json','68bf57c45cb8b6.29001598.json','68bf58dc21b6c0.62960793.json'];
  const items = [];
  for (const f of files) {
    try { items.push(await DemoData.load(metaDir + f)); } catch (_) {}
  }
  root.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px">` +
    items.map(m => {
      const img = m.filename ? `assets/data/gallery/images/${m.filename}` : '';
      return `<figure style="margin:0;padding:8px;background:#1a1a1a;border-radius:8px">
        ${img ? `<img src="${img}" alt="" style="width:100%;border-radius:6px">` : ''}
        <figcaption>${DemoData.esc(m.title || m.caption || 'Image')}</figcaption>
      </figure>`;
    }).join('') + '</div>';
}

async function initMusicBlogger() {
  const root = document.getElementById('music-blogger-root');
  if (!root) return;
  try {
    const data = await DemoData.load('assets/data/music-blogger.json');
    const posts = Array.isArray(data) ? data : (data.posts || []);
    root.innerHTML = posts.slice(0, 10).map(p =>
      `<div style="margin:8px 0"><strong>${DemoData.esc(p.title || p.name)}</strong> — ${DemoData.esc(p.artist || p.url || '')}</div>`
    ).join('') || '<p>No entries.</p>';
  } catch {
    root.innerHTML = '<p>Music blogger data not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDeveloperBlogger();
  initGallery();
  initMusicBlogger();
});
