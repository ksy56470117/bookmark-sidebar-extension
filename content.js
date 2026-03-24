// ── State ────────────────────────────────────────────────────
const STORAGE_KEY = 'bm_sidebar_v2';
let state = { opacity: 0, blur: 16, theme: 'light', openFolders: {}, width: 220, pinned: false };
let allBookmarks = [];
let isOpen = false;

const THEMES = {
  light: { bg: '255,255,255', dark: false },
  dark:  { bg: '28,28,30',    dark: true  },
  blue:  { bg: '232,240,254', dark: false },
  green: { bg: '232,253,240', dark: false },
  sand:  { bg: '253,248,238', dark: false },
};

// ── Inject ───────────────────────────────────────────────────
function injectSidebar() {
  const root = document.createElement('div');
  root.id = 'bm-sidebar-root';
  root.innerHTML = `
    <div id="bm-sidebar" class="bm-closed">

      <!-- Panel -->
      <div id="bm-panel">
        <header id="bm-header">
          <span id="bm-title">북마크</span>
          <div id="bm-controls">
            <button class="bm-btn" id="bm-search-btn" title="검색">
              <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
            </button>
            <button class="bm-btn" id="bm-collapse-btn" title="모두 접기">
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 3 18 9"/><polyline points="6 15 12 21 18 15"/></svg>
            </button>
            <button class="bm-btn" id="bm-settings-btn" title="설정">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button class="bm-btn" id="bm-pin-btn" title="항상 열기">
              <svg viewBox="0 0 24 24"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-2a7 7 0 0 0-4-6.33V4h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.67A7 7 0 0 0 5 15z"/></svg>
            </button>
            <button class="bm-btn" id="bm-close-btn" title="닫기">
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </header>

        <div id="bm-search-bar">
          <div class="bm-search-wrap">
            <svg class="bm-search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
            <input id="bm-search-input" type="text" placeholder="검색" autocomplete="off" spellcheck="false"/>
          </div>
        </div>

        <div id="bm-settings-panel" class="bm-hidden">
          <div class="bm-settings-box">
            <div class="bm-setting-row">
              <span class="bm-setting-label">투명도</span>
              <div class="bm-slider-group">
                <input type="range" id="bm-opacity-slider" min="-40" max="40" value="0" step="1"/>
                <span id="bm-opacity-val">0</span>
              </div>
            </div>
            <div class="bm-setting-row">
              <span class="bm-setting-label">블러</span>
              <div class="bm-slider-group">
                <input type="range" id="bm-blur-slider" min="0" max="40" value="16" step="1"/>
                <span id="bm-blur-val">16px</span>
              </div>
            </div>
            <div class="bm-setting-row">
              <span class="bm-setting-label">너비</span>
              <div class="bm-slider-group">
                <input type="range" id="bm-width-slider" min="160" max="340" value="220" step="10"/>
                <span id="bm-width-val">220px</span>
              </div>
            </div>
            <div class="bm-setting-row bm-color-row">
              <span class="bm-setting-label">테마</span>
              <div class="bm-chips">
                <button class="bm-chip active" data-color="light"  style="background:linear-gradient(135deg,#fff,#e8e8ed)" title="라이트"></button>
                <button class="bm-chip"        data-color="dark"   style="background:linear-gradient(135deg,#1c1c1e,#2c2c2e)" title="다크"></button>
                <button class="bm-chip"        data-color="blue"   style="background:linear-gradient(135deg,#e8f0fe,#c5d8ff)" title="블루"></button>
                <button class="bm-chip"        data-color="green"  style="background:linear-gradient(135deg,#e8fdf0,#c2f0d6)" title="그린"></button>
                <button class="bm-chip"        data-color="sand"   style="background:linear-gradient(135deg,#fdf8ee,#f0e6c8)" title="샌드"></button>
              </div>
            </div>
          </div>
        </div>

        <div id="bm-tree"><p class="bm-state-msg">불러오는 중...</p></div>
      </div>

    </div>
  `;
  document.documentElement.appendChild(root);

  loadSettings().then(() => {
    applySettings();
    if (state.pinned) {
      isOpen = true;
      const sidebar = document.getElementById('bm-sidebar');
      sidebar.classList.add('bm-no-transition');
      sidebar.classList.remove('bm-closed');
      sidebar.classList.add('bm-open');
      requestAnimationFrame(() => sidebar.classList.remove('bm-no-transition'));
    }
    loadBookmarks();
    bindEvents();
  });

  chrome.runtime.onMessage.addListener(handleMessage);
}

function handleMessage(msg) {
  if (msg.action === 'toggle') toggleSidebar();
}

// ── Toggle ────────────────────────────────────────────────────
function toggleSidebar() {
  if (state.pinned) return;
  isOpen = !isOpen;
  const sidebar = document.getElementById('bm-sidebar');
  sidebar.classList.toggle('bm-closed', !isOpen);
  sidebar.classList.toggle('bm-open', isOpen);
}

// ── Settings ──────────────────────────────────────────────────
function loadSettings() {
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

function applySettings() {
  const t = THEMES[state.theme] || THEMES.light;
  const sidebar = document.getElementById('bm-sidebar');
  const panel = document.getElementById('bm-panel');

  sidebar.style.setProperty('--bm-bg', `rgba(${t.bg},${(70 + state.opacity) / 100})`);
  sidebar.style.setProperty('--bm-blur', `${state.blur}px`);
  sidebar.classList.toggle('bm-dark', t.dark);
  panel.style.width = `${state.width}px`;

  document.getElementById('bm-opacity-slider').value = state.opacity;
  document.getElementById('bm-opacity-val').textContent = state.opacity > 0 ? `+${state.opacity}` : `${state.opacity}`;
  document.getElementById('bm-blur-slider').value = state.blur;
  document.getElementById('bm-blur-val').textContent = `${state.blur}px`;
  document.getElementById('bm-width-slider').value = state.width;
  document.getElementById('bm-width-val').textContent = `${state.width}px`;

  document.querySelectorAll('.bm-chip').forEach(b => {
    b.classList.toggle('active', b.dataset.color === state.theme);
  });

  const pinBtn = document.getElementById('bm-pin-btn');
  if (pinBtn) {
    pinBtn.classList.toggle('bm-btn-active', state.pinned);
    document.getElementById('bm-close-btn').style.opacity = state.pinned ? '0.3' : '';
  }
}

// ── Bookmarks ─────────────────────────────────────────────────
function loadBookmarks() {
  chrome.runtime.sendMessage({ action: 'getBookmarks' }, response => {
    if (chrome.runtime.lastError || !response) return;
    allBookmarks = response.nodes;
    renderTree(response.nodes);
  });
}

function renderTree(nodes) {
  const tree = document.getElementById('bm-tree');
  tree.innerHTML = '';
  const root = nodes[0];
  if (!root?.children?.length) {
    tree.innerHTML = '<p class="bm-state-msg">북마크가 없습니다.</p>';
    return;
  }
  root.children.forEach(child => {
    if (child.children?.length) {
      const label = document.createElement('div');
      label.className = 'bm-section-header';
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
  wrap.className = `bm-folder bm-lv${Math.min(level, 4)}`;

  const header = document.createElement('div');
  header.className = 'bm-folder-header';

  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('class', 'bm-folder-icon');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.8');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  const folderPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  folderPath.setAttribute('d', 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z');
  icon.appendChild(folderPath);

  const title = document.createElement('span');
  title.className = 'bm-folder-title';
  title.textContent = node.title || '(이름 없음)';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('class', 'bm-chevron');
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('stroke-width', '2');
  chevron.setAttribute('stroke-linecap', 'round');
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly.setAttribute('points', '9 18 15 12 9 6');
  chevron.appendChild(poly);

  header.append(icon, title, chevron);

  const children = document.createElement('div');
  children.className = 'bm-folder-children';

  const isOpen = state.openFolders[node.id] !== false;
  if (!isOpen) children.classList.add('bm-collapsed');
  else { chevron.classList.add('bm-open'); icon.classList.add('bm-folder-open'); }

  (node.children || []).forEach(c => children.appendChild(buildNode(c, level + 1)));

  header.addEventListener('click', () => {
    const collapsed = children.classList.toggle('bm-collapsed');
    chevron.classList.toggle('bm-open', !collapsed);
    icon.classList.toggle('bm-folder-open', !collapsed);
    state.openFolders[node.id] = !collapsed;
    saveSettings();
  });

  wrap.append(header, children);
  return wrap;
}

function buildBookmark(node, level) {
  const a = document.createElement('a');
  a.className = `bm-item bm-lv${Math.min(level, 4)}`;
  a.href = node.url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.title = node.url;

  const favWrap = document.createElement('div');
  favWrap.className = 'bm-fav-wrap';
  const img = document.createElement('img');
  img.className = 'bm-fav';
  try { img.src = new URL(node.url).origin + '/favicon.ico'; } catch {}
  img.onerror = () => { favWrap.textContent = '🔗'; img.remove(); };
  favWrap.appendChild(img);

  const titleEl = document.createElement('span');
  titleEl.className = 'bm-title';
  titleEl.textContent = node.title || node.url;

  a.append(favWrap, titleEl);
  return a;
}

function countItems(children) {
  let n = 0;
  children.forEach(c => { n += c.url ? 1 : countItems(c.children || []); });
  return n;
}

function flatAll(nodes, out = []) {
  nodes.forEach(n => { if (n.url) out.push(n); if (n.children) flatAll(n.children, out); });
  return out;
}

function renderSearch(q) {
  const tree = document.getElementById('bm-tree');
  const lq = q.toLowerCase();
  const hits = flatAll(allBookmarks).filter(b =>
    b.title?.toLowerCase().includes(lq) || b.url?.toLowerCase().includes(lq)
  );
  tree.innerHTML = '';
  if (!hits.length) { tree.innerHTML = `<p class="bm-state-msg">"${q}" 결과 없음</p>`; return; }
  hits.forEach(b => tree.appendChild(buildBookmark(b, 0)));
}

// ── Events ────────────────────────────────────────────────────
function bindEvents() {
  document.getElementById('bm-pin-btn').addEventListener('click', () => {
    state.pinned = !state.pinned;
    document.getElementById('bm-pin-btn').classList.toggle('bm-btn-active', state.pinned);
    document.getElementById('bm-close-btn').style.opacity = state.pinned ? '0.3' : '';
    if (state.pinned && !isOpen) {
      isOpen = true;
      const sidebar = document.getElementById('bm-sidebar');
      sidebar.classList.remove('bm-closed');
      sidebar.classList.add('bm-open');
    }
    saveSettings();
  });

  document.getElementById('bm-close-btn').addEventListener('click', toggleSidebar);

  document.getElementById('bm-search-btn').addEventListener('click', () => {
    document.getElementById('bm-search-input').focus();
  });

  document.getElementById('bm-search-input').addEventListener('input', e => {
    const q = e.target.value.trim();
    q ? renderSearch(q) : renderTree(allBookmarks);
  });

  document.getElementById('bm-settings-btn').addEventListener('click', () => {
    document.getElementById('bm-settings-panel').classList.toggle('bm-hidden');
  });

  document.getElementById('bm-collapse-btn').addEventListener('click', () => {
    document.querySelectorAll('.bm-folder-children').forEach(el => el.classList.add('bm-collapsed'));
    document.querySelectorAll('.bm-chevron').forEach(el => el.classList.remove('bm-open'));
    document.querySelectorAll('.bm-folder-icon').forEach(el => { el.textContent = '📁'; });
    state.openFolders = {};
    saveSettings();
  });

  document.getElementById('bm-opacity-slider').addEventListener('input', e => {
    state.opacity = +e.target.value;
    document.getElementById('bm-opacity-val').textContent = state.opacity > 0 ? `+${state.opacity}` : `${state.opacity}`;
    document.getElementById('bm-sidebar').style.setProperty('--bm-bg',
      `rgba(${THEMES[state.theme].bg},${(70 + state.opacity) / 100})`);
    saveSettings();
  });

  document.getElementById('bm-blur-slider').addEventListener('input', e => {
    state.blur = +e.target.value;
    document.getElementById('bm-blur-val').textContent = `${state.blur}px`;
    document.getElementById('bm-sidebar').style.setProperty('--bm-blur', `${state.blur}px`);
    saveSettings();
  });

  document.getElementById('bm-width-slider').addEventListener('input', e => {
    state.width = +e.target.value;
    document.getElementById('bm-width-val').textContent = `${state.width}px`;
    document.getElementById('bm-panel').style.width = `${state.width}px`;
    saveSettings();
  });

  document.querySelectorAll('.bm-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      state.theme = btn.dataset.color;
      applySettings();
      saveSettings();
    });
  });

  // Listen for bookmark change notifications from background
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.action === 'reloadBookmarks') loadBookmarks();
  });
}

// ── Entry point (all declarations initialized above) ─────────
if (document.getElementById('bm-sidebar-root')) {
  // Already injected — just toggle
  toggleSidebar();
} else {
  injectSidebar();
}
