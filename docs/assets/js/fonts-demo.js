/** Font catalog pages — loads Google Fonts + renders sortable table */
const FontsDemo = {
  data: null,

  async load() {
    if (!this.data) {
      this.data = await fetch('assets/data/fonts.json').then(r => r.json());
    }
    return this.data;
  },

  gfName(name) {
    return name.trim().replace(/\s+/g, '+');
  },

  injectGoogleFonts(fonts) {
    if (!fonts.length) return;
    const families = fonts.map(f => `family=${this.gfName(f)}:wght@300;400;600;700`).join('&');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    document.head.appendChild(link);
  },

  esc(s) {
    const d = document.createElement('span');
    d.textContent = s ?? '';
    return d.innerHTML;
  },

  cssFamily(name) {
    return `"${name.replace(/"/g, '')}", sans-serif`;
  },

  renderTable(fonts, sampleText) {
    const tbody = fonts.map((name, i) => `
      <tr data-name="${this.esc(name.toLowerCase())}">
        <td>${i + 1}</td>
        <td>${this.esc(name)}</td>
        <td class="sample-text" style="font-family:${this.cssFamily(name)}">${this.esc(sampleText)}</td>
        <td><span class="sizeVal">18</span>px</td>
        <td><button type="button" class="rowInc">+</button></td>
        <td><button type="button" class="rowDec">−</button></td>
        <td><input type="color" value="#e6edf3" class="colorPicker" title="Text colour"></td>
      </tr>`).join('');

    return `
      <label class="font-search">Search: <input type="search" id="fontSearch" placeholder="Filter fonts on this page…"></label>
      <p class="font-count">${fonts.length} fonts on this page</p>
      <div class="font-table-wrap">
        <table id="fontTable" class="font-table">
          <thead><tr>
            <th data-sort="num">#</th>
            <th data-sort="name">Font name</th>
            <th>Example</th>
            <th>Size</th>
            <th colspan="2">Adjust</th>
            <th>Colour</th>
          </tr></thead>
          <tbody>${tbody}</tbody>
        </table>
      </div>`;
  },

  wireTable(root) {
    const table = root.querySelector('#fontTable');
    if (!table) return;
    const search = root.querySelector('#fontSearch');

    search?.addEventListener('input', () => {
      const term = search.value.toLowerCase();
      table.tBodies[0].rows.forEach(row => {
        const name = row.dataset.name || '';
        row.style.display = name.includes(term) ? '' : 'none';
      });
    });

    table.tBodies[0].rows.forEach(row => {
      const sample = row.querySelector('.sample-text');
      const sizeVal = row.querySelector('.sizeVal');
      row.querySelector('.rowInc')?.addEventListener('click', () => {
        let sz = parseInt(sizeVal.textContent, 10) + 1;
        sizeVal.textContent = sz;
        sample.style.fontSize = sz + 'px';
      });
      row.querySelector('.rowDec')?.addEventListener('click', () => {
        let sz = Math.max(8, parseInt(sizeVal.textContent, 10) - 1);
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
      `<a href="demo-fonts-${slug}.html"${slug === current ? ' class="active"' : ''}>${this.esc(cat.title)} <small>(${cat.fonts.length})</small></a>`
    ).join('')} <a href="demo-fonts-effects.html">Effects playground</a></nav>`;
  },

  async initCategory(slug) {
    const root = document.getElementById('fonts-root');
    if (!root) return;
    const data = await this.load();
    const cat = data.categories[slug];
    if (!cat) {
      root.innerHTML = '<p>Unknown font category.</p>';
      return;
    }
    this.injectGoogleFonts(cat.fonts);
    root.innerHTML = this.renderNav(data.categories, slug) +
      `<h2>${this.esc(cat.title)}</h2><p class="font-lead">${this.esc(cat.description)}</p>` +
      this.renderTable(cat.fonts, data.sampleText);
    this.wireTable(root);
  },

  async initHub() {
    const root = document.getElementById('fonts-root');
    if (!root) return;
    const data = await this.load();
    const total = Object.values(data.categories).reduce((n, c) => n + c.fonts.length, 0);
    root.innerHTML = `
      <p class="font-lead">${total} Google Fonts across ${Object.keys(data.categories).length} category pages. Each page loads only its fonts.</p>
      <div class="font-hub">${Object.entries(data.categories).map(([slug, cat]) => `
        <a class="font-hub-card" href="demo-fonts-${slug}.html">
          <strong>${this.esc(cat.title)}</strong>
          <span>${cat.fonts.length} fonts</span>
          <p>${this.esc(cat.description)}</p>
        </a>`).join('')}
        <a class="font-hub-card" href="demo-fonts-effects.html">
          <strong>Effects playground</strong>
          <span>40+ effects</span>
          <p>Neon, glitch, hover animations — pick any loaded font.</p>
        </a>
      </div>`;
  }
  async initEffects() {
    const controls = document.getElementById('effects-controls');
    const root = document.getElementById('effects-root');
    if (!controls || !root) return;
    const data = await this.load();
    const allFonts = [...new Set(Object.values(data.categories).flatMap(c => c.fonts))].sort();
    // Load fonts in chunks (Google Fonts URL length limit)
    for (let i = 0; i < allFonts.length; i += 40) {
      this.injectGoogleFonts(allFonts.slice(i, i + 40));
    }
    controls.innerHTML = `
      <label>Font <select id="playgroundFont">${allFonts.map(f =>
        `<option value="${this.esc(f)}">${this.esc(f)}</option>`).join('')}</select></label>
      <label>Size <button type="button" id="playInc">+</button><button type="button" id="playDec">−</button></label>
      <label>Colour <input type="color" id="playColor" value="#e6edf3"></label>`;
    const effects = [
      ['effect-wave', 'Wave'], ['effect-neon', 'Neon glow'], ['effect-rainbow', 'Rainbow'],
      ['effect-glitch', 'Glitch', true], ['effect-shadow', 'Colour shadow'], ['effect-skew', 'Skew'],
      ['effect-rotate', 'Rotate'], ['effect-blur', 'Blur'], ['effect-outline', 'Outline'],
      ['effect-pulse', 'Pulse'], ['effect-wobble', 'Wobble'], ['effect-bounce', 'Bounce'],
      ['effect-fire', 'Fire glow'], ['effect-flicker', 'Neon flicker'],
      ['effect-bold-neon', 'Bold neon wobble'], ['effect-italic-rainbow', 'Italic rainbow'],
      ['effect-spaced-glitch', 'Spaced glitch', true], ['hover-grow', 'Hover: grow'],
      ['hover-rotate', 'Hover: rotate'], ['hover-skew', 'Hover: skew']
    ];
    root.innerHTML = `<div id="playgroundText" class="sample-text effect-wave" data-text="The quick brown fox">The quick brown fox jumps over the lazy dog</div>` +
      effects.map(([cls, label, glitch]) =>
        `<p class="sample-text ${cls}"${glitch ? ' data-text="' + label + '"' : ''}>${label}</p>`).join('');
    const fontSel = document.getElementById('playgroundFont');
    const samples = root.querySelectorAll('.sample-text');
    const applyFont = () => {
      samples.forEach(el => {
        el.style.fontFamily = this.cssFamily(fontSel.value);
        if (el.dataset.text !== undefined) el.dataset.text = el.textContent;
      });
    };
    fontSel.addEventListener('change', applyFont);
    applyFont();
    document.getElementById('playColor')?.addEventListener('input', e => {
      samples.forEach(el => { if (!el.classList.contains('effect-rainbow') && !el.classList.contains('effect-italic-rainbow')) el.style.color = e.target.value; });
    });
    document.getElementById('playInc')?.addEventListener('click', () => samples.forEach(el => {
      el.style.fontSize = (parseInt(getComputedStyle(el).fontSize, 10) + 2) + 'px';
    }));
    document.getElementById('playDec')?.addEventListener('click', () => samples.forEach(el => {
      el.style.fontSize = Math.max(10, parseInt(getComputedStyle(el).fontSize, 10) - 2) + 'px';
    }));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const slug = document.body.dataset.fontCategory;
  if (slug === 'hub') FontsDemo.initHub();
  else if (slug === 'effects') FontsDemo.initEffects();
  else if (slug) FontsDemo.initCategory(slug);
});
