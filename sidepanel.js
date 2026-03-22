// ── Theme definitions ────────────────────────────────────────
const THEMES = {
  light: { bg: '255,255,255', dark: false },
  dark:  { bg: '28,28,30',    dark: true  },
  blue:  { bg: '232,240,254', dark: false },
  green: { bg: '232,253,240', dark: false },
  sand:  { bg: '253,248,238', dark: false },
};

const STORAGE_KEY = 'bm_sidebar_v2';

// ── State ────────────────────────────────────────────────────
let state = {
  opacity: 82,
  blur: 20,
  theme: 'light',
  openFolders: {},
};

let allBookmarks = [];

// ── DOM ──────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const tree           = $('bookmark-tree');
const opacitySlider  = $('opacity-slider');
const opacityValue   = $('opacity-value');
const blurSlider     = $('blur-slider');
const blurValue      = $('blur-value');
const searchBar      = $('search-bar');
const searchInput    = $('search-input');
const settingsPanel  = $('settings-panel');

// ── Init ─────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  applySettings();
  await loadBookmarks();
  bindEvents();
}

// ── Persist ──────────────────────────────────────────────────
async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, r => {
      if (r[STORAGE_KEY]) Object.assign(state, r[STORAGE_KEY]);
      resolve();
    });
  });
}

function saveSettings() {
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

// ── Apply visual settings ────────────────────────────────────
function applySettings() {
  const t = THEMES[state.theme] || THEMES.light;
  const root = document.documentElement;

  root.style.setProperty('--bg-color', t.bg);
  root.style.setProperty('--bg-opacity', state.opacity / 100);
  root.style.setProperty('--bg-blur', `${state.blur}px`);
  document.body.classList.toggle('dark', t.dark);

  opacitySlider.value     = state.opacity;
  opacityValue.textContent = `${state.opacity}%`;
  blurSlider.value        = state.blur;
  blurValue.textContent   = `${state.blur}px`;

  document.querySelectorAll('.chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === state.theme);
  });
}

// ── Bookmarks ─────────────────────────────────────────────────
function loadBookmarks() {
  return new Promise(resolve => {
    chrome.bookmarks.getTree(nodes => {
      allBookmarks = nodes;
      renderTree(nodes);
      resolve();
    });
  });
}

function renderTree(nodes) {
  tree.innerHTML = '';
  const root = nodes[0];
  if (!root?.children?.length) {
    tree.innerHTML = '<p class="state-msg">북마크가 없습니다.</p>';
    return;
  }
  root.children.forEach((child, i) => {
    if (child.children?.length) {
      const label = document.createElement('div');
      label.className = 'section-header';
      label.textContent = child.title || '북마크';
      tree.appendChild(label);
      child.children.forEach(item => tree.appendChild(buildNode(item, 0)));
    }
  });
}

function buildNode(node, level) {
  return node.url ? buildBookmark(node, level) : buildFolder(node, level);
}

function buildFolder(node, level) {
  const wrap = document.createElement('div');
  wrap.className = `bm-folder bm-level-${Math.min(level, 4)}`;

  const header = document.createElement('div');
  header.className = 'bm-folder-header';

  // Chevron SVG
  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('class', 'bm-chevron');
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('stroke-width', '2.5');
  chevron.setAttribute('stroke-linecap', 'round');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly.setAttribute('points', '9 18 15 12 9 6');
  chevron.appendChild(poly);

  const icon = document.createElement('span');
  icon.className = 'bm-folder-icon';
  icon.textContent = '📁';

  const title = document.createElement('span');
  title.className = 'bm-folder-title';
  title.textContent = node.title || '(이름 없음)';

  const count = document.createElement('span');
  count.className = 'bm-folder-badge';
  count.textContent = countItems(node.children || []);

  header.append(chevron, icon, title, count);

  const children = document.createElement('div');
  children.className = 'bm-folder-children';

  // Default: top-level open, sub-level follows saved state
  const isOpen = state.openFolders[node.id] !== false;
  if (!isOpen) {
    children.classList.add('collapsed');
  } else {
    chevron.classList.add('open');
    icon.textContent = '📂';
  }

  (node.children || []).forEach(child => {
    children.appendChild(buildNode(child, level + 1));
  });

  header.addEventListener('click', () => {
    const collapsed = children.classList.toggle('collapsed');
    chevron.classList.toggle('open', !collapsed);
    icon.textContent = collapsed ? '📁' : '📂';
    state.openFolders[node.id] = !collapsed;
    saveSettings();
  });

  wrap.append(header, children);
  return wrap;
}

function buildBookmark(node, level) {
  const a = document.createElement('a');
  a.className = `bm-item bm-level-${Math.min(level, 4)}`;
  a.href = node.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = node.url;

  const wrap = document.createElement('div');
  wrap.className = 'bm-favicon-wrap';

  const img = document.createElement('img');
  img.className = 'bm-favicon';
  img.src = faviconUrl(node.url);
  img.onerror = () => { wrap.textContent = '🔗'; img.remove(); };

  wrap.appendChild(img);

  const titleEl = document.createElement('span');
  titleEl.className = 'bm-title';
  titleEl.textContent = node.title || node.url;

  a.append(wrap, titleEl);
  return a;
}

function faviconUrl(url) {
  try {
    return `${new URL(url).origin}/favicon.ico`;
  } catch { return ''; }
}

function countItems(children) {
  let n = 0;
  children.forEach(c => { n += c.url ? 1 : countItems(c.children || []); });
  return n;
}

// ── Search ────────────────────────────────────────────────────
function flatAll(nodes, out = []) {
  nodes.forEach(n => { if (n.url) out.push(n); if (n.children) flatAll(n.children, out); });
  return out;
}

function renderSearch(q) {
  const lq = q.toLowerCase();
  const hits = flatAll(allBookmarks).filter(b =>
    b.title?.toLowerCase().includes(lq) || b.url?.toLowerCase().includes(lq)
  );
  tree.innerHTML = '';
  if (!hits.length) {
    tree.innerHTML = `<p class="state-msg">"${q}"에 대한 결과 없음</p>`;
    return;
  }
  hits.forEach(b => tree.appendChild(buildBookmark(b, 0)));
}

// ── Events ────────────────────────────────────────────────────
function bindEvents() {
  opacitySlider.addEventListener('input', () => {
    state.opacity = +opacitySlider.value;
    opacityValue.textContent = `${state.opacity}%`;
    document.documentElement.style.setProperty('--bg-opacity', state.opacity / 100);
    saveSettings();
  });

  blurSlider.addEventListener('input', () => {
    state.blur = +blurSlider.value;
    blurValue.textContent = `${state.blur}px`;
    document.documentElement.style.setProperty('--bg-blur', `${state.blur}px`);
    saveSettings();
  });

  document.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.theme = btn.dataset.color;
      applySettings();
      saveSettings();
    });
  });

  $('btn-search-toggle').addEventListener('click', () => {
    const hidden = searchBar.classList.toggle('hidden');
    if (!hidden) { searchInput.focus(); }
    else { searchInput.value = ''; renderTree(allBookmarks); }
  });

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    q ? renderSearch(q) : renderTree(allBookmarks);
  });

  $('btn-settings-toggle').addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  $('btn-collapse-all').addEventListener('click', () => {
    document.querySelectorAll('.bm-folder-children').forEach(el => el.classList.add('collapsed'));
    document.querySelectorAll('.bm-chevron').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('.bm-folder-icon').forEach(el => { el.textContent = '📁'; });
    state.openFolders = {};
    saveSettings();
  });

  // Live sync on bookmark changes
  ['onCreated','onRemoved','onChanged','onMoved'].forEach(ev => {
    chrome.bookmarks[ev].addListener(loadBookmarks);
  });
}

init();
