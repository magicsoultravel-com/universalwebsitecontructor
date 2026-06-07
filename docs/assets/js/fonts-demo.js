/** Font catalog — Google Fonts tables with sample text + size controls */
const FontsDemo = {
  data: null,
  sampleText: 'Lorem ipsum dolor sit amet',
  baseSize: 18,

  async load() {
    if (!this.data) {
      const r = await fetch('assets/data/fonts.json');
      if (!r.ok) throw new Error('Could not load fonts.json');
      this.data = await r.json();
      this.sampleText = this.data.sampleText || this.sampleText;
    }
    return this.data;
  },

  gfName(name) {
    return encodeURIComponent(name.trim()).replace(/%20/g, '+');
  },

  injectGoogleFonts(fonts) {
    if (!fonts.length) return;
    const chunk = 15;
    for (let i = 0; i < fonts.length; i += chunk) {
      const families = fonts.slice(i, i + chunk).map(f => `family=${this.gfName(f)}`).join('&');
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
      document.head.appendChild(link);
    }
  },

  esc(s) {
    const d = document.createElement('span');
    d.textContent = s ?? '';
    return d.innerHTML;
  },

  cssFamily(name) {
    return `"${String(name).replace(/"/g, '')}", sans-serif`;
  },

  renderToolbar() {
    return `
      <div class="font-toolbar">
        <label>Sample text
          <input type="text" id="sampleTextInput" value="${this.esc(this.sampleText)}" size="48">
        </label>
        <label>All sizes
          <button type="button" id="globalDec">−</button>
          <span id="globalSize">${this.baseSize}</span>px
          <button type="button" id="globalInc">+</button>
        </label>
        <button type="button" id="resetSample" class="font-btn">Reset to Lorem ipsum</button>
      </div>`;
  },

  renderTable(fonts) {
    const tbody = fonts.map((name, i) => `
      <tr data-name="${this.esc(name.toLowerCase())}">
        <td>${i + 1}</td>
        <td>${this.esc(name)}</td>
        <td class="sample-text" style="font-family:${this.cssFamily(name)};font-size:${this.baseSize}px">${this.esc(this.sampleText)}</td>
        <td><span class="sizeVal">${this.baseSize}</span>px</td>
        <td><button type="button" class="rowInc">+</button></td>
        <td><button type="button" class="rowDec">−</button></td>
        <td><input type="color" value="#e6edf3" class="colorPicker" title="Text colour"></td>
      </tr>`).join('');

    return `
      ${this.renderToolbar()}
      <label class="font-search">Filter: <input type="search" id="fontSearch" placeholder="Search font name…"></label>
      <p class="font-count">${fonts.length} fonts</p>
      <div class="font-table-wrap">
        <table id="fontTable" class="font-table">
          <thead><tr>
            <th data-sort="num">#</th>
            <th data-sort="name">Font name</th>
            <th>Preview</th>
            <th>Size</th>
            <th colspan="2">Row</th>
            <th>Colour</th>
          </tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>`;
  },

  wireTable(root) {
    const table = root.querySelector('#fontTable');
    if (!table) return;

    const applySampleText = (text) => {
      this.sampleText = text;
      root.querySelectorAll('.sample-text').forEach(el => { el.textContent = text; });
    };

    const applyGlobalSize = (sz) => {
      this.baseSize = sz;
      root.querySelector('#globalSize').textContent = sz;
      table.tBodies[0].rows.forEach(row => {
        row.querySelector('.sizeVal').textContent = sz;
        row.querySelector('.sample-text').style.fontSize = sz + 'px';
      });
    };

    root.querySelector('#sampleTextInput')?.addEventListener('input', e => applySampleText(e.target.value));
    root.querySelector('#resetSample')?.addEventListener('click', () => {
      const def = this.data?.sampleText || 'Lorem ipsum dolor sit amet';
      root.querySelector('#sampleTextInput').value = def;
      applySampleText(def);
    });
    root.querySelector('#globalInc')?.addEventListener('click', () => applyGlobalSize(this.baseSize + 1));
    root.querySelector('#globalDec')?.addEventListener('click', () => applyGlobalSize(Math.max(8, this.baseSize - 1)));

    root.querySelector('#fontSearch')?.addEventListener('input', e => {
      const term = e.target.value.toLowerCase();
      table.tBodies[0].rows.forEach(row => {
        row.style.display = (row.dataset.name || '').includes(term) ? '' : 'none';
      });
    });

    table.tBodies[0].rows.forEach(row => {
      const sample = row.querySelector('.sample-text');
      const sizeVal = row.querySelector('.sizeVal');
      row.querySelector('.rowInc')?.addEventListener('click', () => {
        const sz = parseInt(sizeVal.textContent, 10) + 1;
        sizeVal.textContent = sz;
        sample.style.fontSize = sz + 'px';
      });
      row.querySelector('.rowDec')?.addEventListener('click', () => {
        const sz = Math.max(8, parseInt(sizeVal.textContent, 10) - 1);
        sizeVal.textContent = sz;
        sample.style.fontSize = sz + 'px';
      });
      row.querySelector('.colorPicker')?.addEventListener('input', e => {
        sample.style.color = e.target.value;
      });
    });

    table.querySelectorAll('th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        const rows = Array.from(table.tBodies[0].rows);
        const asc = !th.classList.contains('sorted-asc');
        table.querySelectorAll('th').forEach(h => h.classList.remove('sorted-asc', 'sorted-desc'));
        th.classList.add(asc ? 'sorted-asc' : 'sorted-desc');
        rows.sort((a, b) => {
          const av = key === 'num' ? parseInt(a.cells[0].textContent, 10) : a.cells[1].textContent;
          const bv = key === 'num' ? parseInt(b.cells[0].textContent, 10) : b.cells[1].textContent;
          return asc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
        });
        rows.forEach(r => table.tBodies[0].appendChild(r));
      });
    });
  },

  renderNav(categories, current) {
    return `<nav class="font-nav">${Object.entries(categories).map(([slug, cat]) =>
      `<a href="demo-fonts-${slug}.html"${slug === current ? ' class="active"' : ''}>${this.esc(cat.title)} (${cat.fonts.length})</a>`
    ).join('')}<a href="demo-fonts-effects.html">Effects</a></nav>`;
  },

  showError(root, msg) {
    root.innerHTML = `<p class="font-error">${this.esc(msg)}</p>`;
  },

  async initCategory(slug) {
    const root = document.getElementById('fonts-root');
    if (!root) return;
    root.innerHTML = '<p class="font-loading">Loading fonts…</p>';
    try {
      const data = await this.load();
      const cat = data.categories[slug];
      if (!cat) { this.showError(root, 'Unknown category.'); return; }
      this.injectGoogleFonts(cat.fonts);
      root.innerHTML = this.renderNav(data.categories, slug) +
        `<h2>${this.esc(cat.title)}</h2><p class="font-lead">${this.esc(cat.description)}</p>` +
        this.renderTable(cat.fonts);
      this.wireTable(root);
    } catch (e) {
      this.showError(root, 'Failed to load: ' + e.message);
    }
  },

  async initHub() {
    const root = document.getElementById('fonts-root');
    if (!root) return;
    try {
      const data = await this.load();
      const total = Object.values(data.categories).reduce((n, c) => n + c.fonts.length, 0);
      root.innerHTML = `
        <p class="font-lead">${total} Google Fonts in ${Object.keys(data.categories).length} category pages. Each page has a text box and size controls.</p>
        <div class="font-hub">${Object.entries(data.categories).map(([slug, cat]) => `
          <a class="font-hub-card" href="demo-fonts-${slug}.html">
            <strong>${this.esc(cat.title)}</strong><span>${cat.fonts.length} fonts</span>
            <p>${this.esc(cat.description)}</p>
          </a>`).join('')}
          <a class="font-hub-card" href="demo-fonts-effects.html">
            <strong>Effects playground</strong><span>animations</span>
            <p>Neon, glitch, hover — separate from the font tables.</p>
          </a>
        </div>`;
    } catch (e) {
      this.showError(root, e.message);
    }
  },

  async initEffects() {
    const controls = document.getElementById('effects-controls');
    const root = document.getElementById('effects-root');
    if (!controls || !root) return;
    try {
      const data = await this.load();
      const allFonts = [...new Set(Object.values(data.categories).flatMap(c => c.fonts))].sort();
      for (let i = 0; i < allFonts.length; i += 15) {
        this.injectGoogleFonts(allFonts.slice(i, i + 15));
      }
      controls.innerHTML = `
        <label>Sample <input type="text" id="fxSample" value="The quick brown fox jumps over the lazy dog" size="40"></label>
        <label>Font <select id="playgroundFont">${allFonts.map(f =>
          `<option>${this.esc(f)}</option>`).join('')}</select></label>
        <label>Size <button type="button" id="playInc">+</button><button type="button" id="playDec">−</button></label>
        <label>Colour <input type="color" id="playColor" value="#e6edf3"></label>`;
      const effects = [
        ['effect-wave', 'Wave'], ['effect-neon', 'Neon'], ['effect-rainbow', 'Rainbow'],
        ['effect-glitch', 'Glitch', true], ['effect-shadow', 'Shadow'], ['effect-pulse', 'Pulse'],
        ['effect-fire', 'Fire'], ['hover-grow', 'Hover grow'], ['hover-rotate', 'Hover rotate']
      ];
      root.innerHTML = `<div id="playgroundText" class="sample-text effect-wave">The quick brown fox jumps over the lazy dog</div>` +
        effects.map(([cls, label, glitch]) =>
          `<p class="sample-text ${cls}"${glitch ? ` data-text="${label}"` : ''}>${label}</p>`).join('');
      const fontSel = document.getElementById('playgroundFont');
      const samples = root.querySelectorAll('.sample-text');
      const applyAll = () => {
        const txt = document.getElementById('fxSample').value;
        samples.forEach(el => {
          el.style.fontFamily = FontsDemo.cssFamily(fontSel.value);
          el.textContent = txt;
          if (el.dataset.text !== undefined) el.dataset.text = txt;
        });
      };
      fontSel.addEventListener('change', applyAll);
      document.getElementById('fxSample')?.addEventListener('input', applyAll);
      applyAll();
      document.getElementById('playColor')?.addEventListener('input', e => {
        samples.forEach(el => {
          if (!el.classList.contains('effect-rainbow')) el.style.color = e.target.value;
        });
      });
      document.getElementById('playInc')?.addEventListener('click', () => samples.forEach(el => {
        el.style.fontSize = (parseInt(getComputedStyle(el).fontSize, 10) + 2) + 'px';
      }));
      document.getElementById('playDec')?.addEventListener('click', () => samples.forEach(el => {
        el.style.fontSize = Math.max(10, parseInt(getComputedStyle(el).fontSize, 10) - 2) + 'px';
      }));
    } catch (e) {
      root.innerHTML = `<p class="font-error">${FontsDemo.esc(e.message)}</p>`;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const slug = document.body.dataset.fontCategory;
  if (slug === 'hub') FontsDemo.initHub();
  else if (slug === 'effects') FontsDemo.initEffects();
  else if (slug) FontsDemo.initCategory(slug);
});
