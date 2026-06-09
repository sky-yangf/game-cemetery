// 数字墓园 · 主逻辑
// 1. 加载 games.json
// 2. 渲染墓碑网格
// 3. 详情弹窗
// 4. 蜡烛 + "我玩过"（localStorage）

const STORAGE_KEY = 'game_cemetery_local_v1';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { candles: {}, played: {} };
  } catch {
    return { candles: {}, played: {} };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// === 渲染墓碑 ===
async function loadGames() {
  const res = await fetch('./data/games.json');
  return res.json();
}

function renderTombs(games, state) {
  const container = document.getElementById('cemetery');
  document.getElementById('tomb-count').textContent = games.length;

  container.innerHTML = games.map(g => {
    const candleLit = !!state.candles[g.id];
    return `
      <article class="tomb ${candleLit ? 'candle-lit' : ''}" data-id="${g.id}">
        <div class="tomb-candle">🕯️</div>
        <div class="tomb-stone">
          <div class="tomb-icon">${g.icon}</div>
          <div class="tomb-name">${g.name}</div>
          <div class="tomb-years">${g.release.slice(0, 4)} — ${g.death.slice(0, 4)}</div>
          <div class="tomb-reason">${g.deathReasonEmoji} ${g.deathReason}</div>
          <div class="tomb-platform">${g.platform} · ${g.type}</div>
        </div>
        <div class="tomb-base"></div>
        <div class="tomb-hint">👆 点击查看墓志铭</div>
      </article>
    `;
  }).join('');

  // 绑定点击
  container.querySelectorAll('.tomb').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.id, games, state));
  });
}

// === 详情弹窗 ===
function openModal(id, games, state) {
  const g = games.find(x => x.id === id);
  if (!g) return;

  const candleCount = state.candles[id] || 0;
  const played = !!state.played[id];

  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <button class="modal-close" data-close>×</button>
    <div class="modal-icon">${g.icon}</div>
    <h2 class="modal-name">${g.name}</h2>
    <div class="modal-years">${g.release} — ${g.death} · 享年 ${g.lifespan}</div>

    <div class="modal-section">
      <div class="modal-section-title">🏢 发行</div>
      <div class="modal-section-content">${g.publisher}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">⏰ 死因</div>
      <div class="modal-section-content">${g.deathReasonEmoji} ${g.deathReason}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">📜 墓志铭</div>
      <div class="modal-section-content">${g.epitaph}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">💀 评语</div>
      <div class="modal-section-content modal-comment">${g.comment}</div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">⏳ 一生</div>
      <ul class="timeline">
        <li class="timeline-item">
          <span class="timeline-date">${g.release}</span>
          <span>公测上线，承载了无数玩家的期待</span>
        </li>
        <li class="timeline-item">
          <span class="timeline-date">…</span>
          <span>曾经辉煌过，曾经被人热爱过</span>
        </li>
        <li class="timeline-item">
          <span class="timeline-date">${g.death}</span>
          <span>${g.deathReasonEmoji} ${g.deathReason}</span>
        </li>
        <li class="timeline-item">
          <span class="timeline-date">${g.death}</span>
          <span>🪦 入土为安</span>
        </li>
      </ul>
    </div>

    <div class="modal-actions">
      <button class="modal-btn candle-btn ${candleCount > 0 ? 'lit' : ''}" data-candle="${g.id}">
        🕯️ 点蜡烛 ${candleCount > 0 ? `(${candleCount})` : ''}
      </button>
      <button class="modal-btn ${played ? 'lit' : ''}" data-played="${g.id}">
        ${played ? '✅ 我玩过' : '👋 我玩过'}
      </button>
    </div>
  `;

  modal.hidden = false;

  // 关闭
  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  // 蜡烛
  const candleBtn = modal.querySelector('[data-candle]');
  candleBtn?.addEventListener('click', () => {
    const s = loadState();
    s.candles[g.id] = (s.candles[g.id] || 0) + 1;
    saveState(s);
    candleBtn.classList.add('lit');
    candleBtn.innerHTML = `🕯️ 已点 ${s.candles[g.id]} 根蜡烛`;
    // 主页也亮
    const tombEl = document.querySelector(`.tomb[data-id="${g.id}"]`);
    if (tombEl) tombEl.classList.add('candle-lit');
  });

  // 我玩过
  const playedBtn = modal.querySelector('[data-played]');
  playedBtn?.addEventListener('click', () => {
    const s = loadState();
    if (s.played[g.id]) {
      delete s.played[g.id];
    } else {
      s.played[g.id] = true;
    }
    saveState(s);
    openModal(g.id, games, s);
  });
}

function closeModal() {
  document.getElementById('modal').hidden = true;
}

// === Init ===
(async () => {
  const state = loadState();
  const games = await loadGames();
  renderTombs(games, state);
})();
