// 数字墓园 V2 · 主逻辑
// API 对接 / 主题 / 分类 / 登录 / 蜡烛 / 留言 / 提交

// API 地址：dev 走 8002，prod 走同源（或指定后端域名）
// docker 浏览器环境（camofox 等）需要 host.docker.internal
const isDockerBrowser = location.hostname !== '127.0.0.1' && location.hostname !== 'localhost';
const API_HOST = isDockerBrowser ? 'http://host.docker.internal:8002' : `${location.protocol}//${location.hostname}:8002`;
const API = API_HOST + '/api';
const DEFAULT_LIMIT = 50;
let allGames = [];
let offset = 0;
let hasMore = true;

// === Helpers ===
function $(s) { return document.querySelector(s); }
function $$(s) { return document.querySelectorAll(s); }

// === 主题 ===
function initTheme() {
  const saved = localStorage.getItem('cemetery_theme') || 'dusk';
  setTheme(saved);
  $$('.theme-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === saved);
    b.addEventListener('click', () => setTheme(b.dataset.theme));
  });
}
function setTheme(t) {
  document.body.dataset.theme = t;
  localStorage.setItem('cemetery_theme', t);
  $$('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
}

// === Auth ===
let token = localStorage.getItem('cemetery_token');
let user = null;

function isLoggedIn() { return !!token; }

function updateAuthUI() {
  const area = $('#auth-area');
  if (isLoggedIn() && user) {
    area.innerHTML = `<span style="color:var(--text-warm);font-size:.85rem">👤 ${user.name} (${user.role})</span>
      <button id="logout-btn" class="header-btn">退出</button>`;
    $('#logout-btn')?.addEventListener('click', logout);
    $('#submit-tomb-btn').disabled = false;
  } else {
    area.innerHTML = `<button id="login-btn" class="header-btn">登录</button>`;
    $('#login-btn')?.addEventListener('click', showAuthModal);
    $('#submit-tomb-btn').disabled = true;
  }
}

async function tryAutoLogin() {
  if (!token) return;
  try {
    const r = await fetch(API + '/auth/me');
    if (r.ok) { user = await r.json(); }
  } catch(e) { /* no /me yet, skip */ }
  updateAuthUI();
}

function logout() {
  token = null; user = null;
  localStorage.removeItem('cemetery_token');
  updateAuthUI();
  closeAllModals();
}

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const r = await fetch(API + path, { ...opts, headers });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(e.detail || r.statusText);
    }
    return r;
  } catch(e) {
    throw e;
  }
}

// === 模态框 ===
function closeAllModals() {
  $$('.modal').forEach(m => m.hidden = true);
}

// === 登录 ===
function showAuthModal() {
  const box = $('#auth-box');
  box.innerHTML = `
    <button class="modal-close" data-close>×</button>
    <h3>登录</h3>
    <input id="auth-email" placeholder="邮箱" type="email" />
    <input id="auth-password" placeholder="密码" type="password" />
    <button class="modal-btn" id="auth-submit">登录</button>
    <div class="auth-toggle">还没有账号？<a id="auth-switch">注册</a></div>
  `;
  let mode = 'login';
  $('#auth-switch').addEventListener('click', () => {
    mode = mode === 'login' ? 'register' : 'login';
    box.querySelector('h3').textContent = mode === 'login' ? '登录' : '注册';
    $('#auth-submit').textContent = mode === 'login' ? '登录' : '注册';
    if (mode === 'register') {
      if (!box.querySelector('#auth-name')) {
        const inp = document.createElement('input');
        inp.id = 'auth-name'; inp.placeholder = '显示名';
        box.querySelector('#auth-email').before(inp);
      }
    } else {
      const n = $('#auth-name'); if (n) n.remove();
    }
  });
  $('#auth-submit').addEventListener('click', async () => {
    const email = $('#auth-email').value;
    const password = $('#auth-password').value;
    const name = $('#auth-name')?.value || email.split('@')[0];
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { email, password, name };
      const r = await api(endpoint, { method: 'POST', body: JSON.stringify(body) });
      const d = await r.json();
      token = d.token; user = d.user;
      localStorage.setItem('cemetery_token', token);
      updateAuthUI();
      $('#auth-modal').hidden = true;
    } catch(e) {
      alert(e.message);
    }
  });
  $('#auth-modal').hidden = false;
  box.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => $('#auth-modal').hidden = true));
}

// === 加载游戏 ===
async function loadGames(reset = false) {
  if (reset) { offset = 0; allGames = []; hasMore = true; }
  const selP = $('#filter-publisher').value;
  const selY = $('#filter-year').value;
  const selR = $('#filter-reason').value;
  const search = $('#filter-search').value.trim();

  const params = new URLSearchParams({ offset: String(offset), limit: String(DEFAULT_LIMIT), sort: 'candles' });
  if (selP) params.set('publisher', selP);
  if (selY) params.set('death_year', selY);
  if (selR) params.set('death_reason', selR);

  try {
    const r = await fetch(API + '/games?' + params.toString());
    const data = await r.json();
    if (reset) allGames = data;
    else allGames = allGames.concat(data);
    offset += data.length;
    hasMore = data.length >= DEFAULT_LIMIT;

    // 前端搜索过滤
    let display = allGames;
    if (search) {
      display = allGames.filter(g => g.name.includes(search));
    }
    renderTombs(display);
    $('#status-line').textContent = `后端连接正常 · ${allGames.length} 款游戏`;
    $('#load-more-wrap').hidden = !hasMore || search;
    return display;
  } catch(e) {
    // fallback: 静态 JSON
    try {
      const r = await fetch('/static/games.json');
      const data = await r.json();
      allGames = data;
      renderTombs(data);
      $('#status-line').textContent = '使用静态缓存 · ' + data.length + ' 款游戏';
    } catch(e2) {
      $('#cemetery').innerHTML = '<div class="loading">⚰️ 无法连接后端，请确认服务已启动</div>';
      $('#status-line').textContent = '后端离线';
    }
    return [];
  }
}

function renderTombs(games) {
  const container = $('#cemetery');
  if (games.length === 0) {
    container.innerHTML = '<div class="loading">🪦 没有找到匹配的墓碑</div>';
    return;
  }
  // 随机错位
  const offsets = games.map(() => (Math.random() - 0.5) * 30);
  container.innerHTML = games.map((g, i) => `
    <article class="tomb candle-${g.candle_count > 0 ? 'lit' : 'off'}" data-id="${g.id}" style="transform: translateY(${offsets[i].toFixed(0)}px)">
      <div class="tomb-candle">🕯️</div>
      <div class="tomb-stone" title="${g.comment}">
        <div class="tomb-icon">${g.icon}</div>
        <div class="tomb-name">${g.name}</div>
        <div class="tomb-years">${g.release_date.slice(0,4)} — ${g.death_date.slice(0,4)}</div>
        <div class="tomb-comment">${g.comment}</div>
      </div>
      <div class="tomb-base"></div>
      <div class="tomb-candle-count">${g.candle_count > 0 ? '🕯️' + g.candle_count : ''}</div>
    </article>
  `).join('');

  container.querySelectorAll('.tomb').forEach(el => {
    el.addEventListener('click', () => showDetail(el.dataset.id));
  });
}

// === 详情 ===
async function showDetail(id) {
  const g = allGames.find(x => x.id === parseInt(id));
  if (!g) return;

  const content = $('#modal-content');
  content.innerHTML = `
    <button class="modal-close" data-close>×</button>
    <div class="modal-icon">${g.icon}</div>
    <h2 class="modal-name">${g.name}</h2>
    <div style="text-align:center;color:var(--text-warm);font-family:monospace">${g.release_date} — ${g.death_date} · ${g.publisher} · ${g.game_type} · ${g.platform}</div>
    <div class="modal-section"><div class="modal-section-title">📜 墓志铭</div><div class="modal-section-content">${g.epitaph}</div></div>
    <div class="modal-section"><div class="modal-section-title">💀 评语</div><div class="modal-section-content modal-comment">${g.comment}</div></div>
    <div class="modal-section"><div class="modal-section-title">⏳ 一生</div><ul class="timeline">
      <li>${g.release_date} 公测上线</li><li>… 曾经被人热爱过 …</li>
      <li>${g.death_date} ${g.death_reason_emoji} ${g.death_reason}</li>
      <li>${g.death_date} 🪦 入土为安</li>
    </ul></div>
    <div class="modal-actions">
      <button class="modal-btn" id="candle-btn">🕯️ 点蜡烛 (${g.candle_count})</button>
    </div>
    <div class="comments-wrp">
      <h4 style="color:var(--text-warm)">💬 留言板</h4>
      <div id="comments-list">加载中…</div>
      <div class="comment-input" id="comment-input" ${isLoggedIn() ? '' : 'hidden'}>
        <input id="comment-text" placeholder="写下你的回忆…" />
        <button class="modal-btn" id="comment-submit">发表</button>
      </div>
      <p id="comment-login-hint" style="font-size:.8rem;color:var(--text-warm);text-align:center;margin-top:8px;${isLoggedIn() ? 'display:none' : ''}">
        <a style="color:var(--accent);cursor:pointer;text-decoration:underline" id="comment-login-link">登录</a> 后可以发表留言
      </p>
    </div>
  `;

  $('#modal').hidden = false;
  content.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => $('#modal').hidden = true));

  // 蜡烛
  $('#candle-btn').addEventListener('click', async () => {
    try {
      const r = await fetch(API + '/candles/' + g.id, { method: 'POST', headers: token ? { Authorization: 'Bearer ' + token } : {} });
      const d = await r.json();
      g.candle_count = d.count;
      $('#candle-btn').textContent = `🕯️ 已点 (${d.count})`;
      loadGames(true);
    } catch(e) { alert('点蜡烛失败: ' + e.message); }
  });

  // 留言
  $('#comment-login-link')?.addEventListener('click', () => { $('#modal').hidden = true; showAuthModal(); });
  $('#comment-submit')?.addEventListener('click', async () => {
    const txt = $('#comment-text').value.trim();
    if (!txt) return;
    try {
      await api(`/comments/game/${g.id}?content=${encodeURIComponent(txt)}`, { method: 'POST' });
      $('#comment-text').value = '';
      loadComments(g.id);
    } catch(e) { alert('留言失败: ' + e.message); }
  });

  loadComments(g.id);
}

async function loadComments(game_id) {
  try {
    const r = await fetch(API + '/comments/game/' + game_id);
    const data = await r.json();
    const list = $('#comments-list');
    if (data.length === 0) {
      list.innerHTML = '<p style="color:var(--text-warm);font-size:.8rem">还没有留言，来做第一个吧</p>';
    } else {
      list.innerHTML = data.map(c => `
        <div class="comment-item">
          <div class="cmt-name">👤 ${c.user_name}</div>
          <div>${c.content}</div>
          <div class="cmt-time">${c.created_at ? c.created_at.slice(0, 10) : ''}</div>
        </div>
      `).join('');
    }
  } catch(e) {
    $('#comments-list').innerHTML = '<p style="color:var(--text-warm)">留言加载失败</p>';
  }
}

// === 筛选 ===
function initFilters() {
  const pubs = [...new Set(allGames.map(g => g.publisher))].sort();
  const years = [...new Set(allGames.map(g => g.death_date.slice(0,4)))].sort().reverse();
  const reasons = [...new Set(allGames.map(g => g.death_reason))].sort();

  $('#filter-publisher').innerHTML = '<option value="">全部厂商</option>' + pubs.map(p => `<option value="${p}">${p}</option>`).join('');
  $('#filter-year').innerHTML = '<option value="">全部年份</option>' + years.map(y => `<option value="${y}">${y}</option>`).join('');
  $('#filter-reason').innerHTML = '<option value="">全部死因</option>' + reasons.map(r => `<option value="${r}">${r}</option>`).join('');

  ['filter-publisher', 'filter-year', 'filter-reason', 'filter-search'].forEach(id => {
    $('#' + id).addEventListener('change', () => loadGames(true));
  });
}

// === 加载更多 ===
$('#load-more-btn')?.addEventListener('click', () => loadGames());

// === 提交墓碑 ===
$('#submit-tomb-btn').addEventListener('click', showSubmitModal);
function showSubmitModal() {
  if (!isLoggedIn()) { alert('请先登录'); return; }
  const box = $('#submit-box');
  box.innerHTML = `
    <button class="modal-close" data-close>×</button>
    <h3>🪦 提交新墓碑</h3>
    <input id="s-name" placeholder="游戏名" />
    <input id="s-publisher" placeholder="发行商" />
    <select id="s-type"><option>端游</option><option>手游</option><option>页游</option></select>
    <input id="s-release" placeholder="上线日期 YYYY-MM" />
    <input id="s-death" placeholder="停运日期 YYYY-MM" />
    <input id="s-reason" placeholder="死因" />
    <input id="s-icon" placeholder="图标 emoji" value="🪦" />
    <textarea id="s-epitaph" placeholder="墓志铭"></textarea>
    <textarea id="s-comment" placeholder="一句幽默评语"></textarea>
    <button class="modal-btn" id="s-submit">提交（需审核）</button>
    <p id="s-msg" style="text-align:center;color:var(--accent);margin-top:8px;font-size:.8rem"></p>
  `;
  $('#submit-modal').hidden = false;
  box.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => $('#submit-modal').hidden = true));
  $('#s-submit').addEventListener('click', async () => {
    const body = {
      name: $('#s-name').value, publisher: $('#s-publisher').value, game_type: $('#s-type').value,
      release_date: $('#s-release').value, death_date: $('#s-death').value, death_reason: $('#s-reason').value,
      epitaph: $('#s-epitaph').value, comment: $('#s-comment').value, icon: $('#s-icon').value,
    };
    try {
      const r = await api('/games', { method: 'POST', body: JSON.stringify(body) });
      const d = await r.json();
      $('#s-msg').textContent = '✅ ' + d.message;
    } catch(e) {
      $('#s-msg').textContent = '❌ ' + e.message;
    }
  });
}

// === 弹窗关闭 ===
document.addEventListener('click', e => {
  if (e.target.dataset.close) closeAllModals();
});

// === Init ===
(async () => {
  initTheme();
  await tryAutoLogin();
  const games = await loadGames(true);
  initFilters();
})();
