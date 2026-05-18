// ── CONFIG ──────────────────────────────────────────────────────────────────

// Payout ranges are tuned so that "small" / "big" outcomes always net a
// profit above the ticket cost — winning never feels like a net loss.
const CARD_TYPES = {
  cheap: {
    cost: 50, label: '基本款', icon: '🎟️',
    weights: [
      { outcome: 'lose',  range: [-80,  -10], prob: 0.30 },
      { outcome: 'zero',  range: [0,    0],   prob: 0.30 },
      { outcome: 'small', range: [70,   220], prob: 0.30 },  // min > 50 cost
      { outcome: 'big',   range: [280,  700], prob: 0.10 },
    ],
  },
  mid: {
    cost: 150, label: '進階款', icon: '🎫',
    weights: [
      { outcome: 'lose',  range: [-200, -30], prob: 0.32 },
      { outcome: 'zero',  range: [0,    0],   prob: 0.25 },
      { outcome: 'small', range: [200,  500], prob: 0.30 },  // min > 150 cost
      { outcome: 'big',   range: [750,  1800],prob: 0.13 },
    ],
  },
  premium: {
    cost: 500, label: '豪華款', icon: '💎',
    weights: [
      { outcome: 'lose',  range: [-700, -100], prob: 0.32 },
      { outcome: 'zero',  range: [0,    0],    prob: 0.20 },
      { outcome: 'small', range: [700,  1500], prob: 0.30 }, // min > 500 cost
      { outcome: 'big',   range: [2200, 5500], prob: 0.18 },
    ],
  },
};

const OUTCOME_CFG = {
  lose:  { label: '扣錢！', symbols: ['💸', '📉', '💀'], glow: '#f87171', amtClass: 'amount-lose' },
  zero:  { label: '沒中獎', symbols: ['😐', '🎲', '😑'], glow: '#94a3b8', amtClass: 'amount-zero' },
  small: { label: '中獎！', symbols: ['⭐', '💰', '✨'], glow: '#4ade80', amtClass: 'amount-win'  },
  big:   { label: '大獎！', symbols: ['🏆', '👑', '💎'], glow: '#fbbf24', amtClass: 'amount-win'  },
};

// Upgrades — Cookie Clicker style with 1.15x cost growth per purchase
const UPGRADES = [
  // Click upgrades — boost manual dishwashing earnings
  { key: 'gloves',  name: '橡膠手套',     icon: '🧤', baseCost: 100,    effect: 1,   type: 'click' },
  { key: 'soap',    name: '高效洗碗精',   icon: '🧴', baseCost: 500,    effect: 4,   type: 'click' },
  { key: 'sprayer', name: '高壓水槍',     icon: '💦', baseCost: 2500,   effect: 15,  type: 'click' },
  { key: 'license', name: '洗碗大師證照', icon: '📜', baseCost: 15000,  effect: 80,  type: 'click' },

  // Auto upgrades — passive income per second
  { key: 'dishwasher', name: '家用洗碗機',  icon: '🍽️', baseCost: 800,    effect: 2,   type: 'auto' },
  { key: 'robot',      name: '洗碗機器人',  icon: '🤖', baseCost: 5000,   effect: 12,  type: 'auto' },
  { key: 'ai',         name: 'AI 廚房系統', icon: '🧠', baseCost: 30000,  effect: 60,  type: 'auto' },
  { key: 'chain',      name: '連鎖餐廳',    icon: '🏪', baseCost: 200000, effect: 350, type: 'auto' },
];

const COST_GROWTH = 1.15;
const upgradeCost = (u, owned) => Math.ceil(u.baseCost * Math.pow(COST_GROWTH, owned));

// ── AUDIO ────────────────────────────────────────────────────────────────────

const SFX = {
  enabled: true,
  _ctx: null,
  _scratchThrottle: false,

  _getCtx() {
    try {
      if (!this._ctx)
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      return this._ctx;
    } catch { return null; }
  },

  resume() {
    const c = this._getCtx();
    if (c?.state === 'suspended') c.resume();
  },

  _tone(freq, type, delay, dur, vol = 0.28) {
    if (!this.enabled) return;
    const c = this._getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, c.currentTime + delay);
    env.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.012);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.connect(env);
    env.connect(c.destination);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
  },

  _noise(dur, freq = 1400, vol = 0.1) {
    if (!this.enabled) return;
    const c = this._getCtx();
    if (!c) return;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const flt = c.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.value = freq;
    flt.Q.value = 1.2;
    const env = c.createGain();
    env.gain.setValueAtTime(vol, c.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.connect(flt);
    flt.connect(env);
    env.connect(c.destination);
    src.start();
    src.stop(c.currentTime + dur);
  },

  scratch() {
    if (this._scratchThrottle) return;
    this._noise(0.055, 1600, 0.07);
    this._scratchThrottle = true;
    setTimeout(() => { this._scratchThrottle = false; }, 55);
  },

  buy() {
    this._tone(880,  'sine', 0,    0.07, 0.2);
    this._tone(1320, 'sine', 0.07, 0.09, 0.14);
  },

  wash() {
    // Quick bubbly "splash" tone
    this._noise(0.08, 3200, 0.06);
    this._tone(660, 'sine', 0, 0.06, 0.1);
  },

  upgrade() {
    [523.25, 659.25, 783.99].forEach((f, i) =>
      this._tone(f, 'triangle', i * 0.05, 0.18, 0.18)
    );
  },

  reveal() {
    this._noise(0.18, 2200, 0.14);
    this._tone(900, 'sine', 0.1, 0.2, 0.09);
  },

  win() {
    [261.63, 329.63, 392, 523.25].forEach((f, i) =>
      this._tone(f, 'sine', i * 0.09, 0.38, 0.22)
    );
  },

  bigWin() {
    [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this._tone(f, 'triangle', i * 0.07, 0.55, 0.26)
    );
    [261.63, 329.63, 392, 523.25].forEach(f =>
      this._tone(f, 'sine', 0.62, 1.2, 0.16)
    );
  },

  lose() {
    [392, 349.23, 293.66, 220].forEach((f, i) =>
      this._tone(f, 'sawtooth', i * 0.1, 0.2, 0.13)
    );
  },

  jackpot() {
    const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => this._tone(f, 'triangle', i * 0.055, 0.75, 0.26));
    [523.25, 659.25, 783.99, 1046.5].forEach(f =>
      this._tone(f, 'sine', 0.55, 2.2, 0.14)
    );
    [1046.5, 1318.5, 1568, 2093].forEach((f, i) =>
      this._tone(f, 'sine', 0.8 + i * 0.065, 0.45, 0.11)
    );
  },

  bankrupt() {
    const c = this._getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, c.currentTime + 2.4);
    env.gain.setValueAtTime(0.28, c.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.4);
    osc.connect(env);
    env.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 2.5);
  },
};

// ── PARTICLES ────────────────────────────────────────────────────────────────

const Particles = {
  canvas: null, ctx: null, list: [], raf: null,

  init() {
    this.canvas = document.getElementById('particle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this._resize();
    window.addEventListener('resize', () => this._resize());
  },

  _resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  emit(type, x, y) {
    const counts = { bigWin: 110, win: 50, buy: 12, wash: 8, upgrade: 24, jackpot: 200 };
    const n = counts[type] ?? 20;
    for (let i = 0; i < n; i++) this.list.push(this._make(type, x, y));
    if (!this.raf) this._loop();
  },

  _make(type, x, y) {
    const angle = Math.random() * Math.PI * 2;
    const isBig = type === 'bigWin' || type === 'jackpot';
    const spd = isBig              ? 5 + Math.random() * 13
              : type === 'wash'    ? 1 + Math.random() * 3
              : 2 + Math.random() * 7;
    const PALETTES = {
      bigWin:  ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6bff','#ffffff','#f59e0b'],
      win:     ['#ffd700','#ffec8b','#fff8dc','#f59e0b','#fbbf24'],
      buy:     ['#a78bfa','#818cf8','#c4b5fd'],
      wash:    ['#67e8f9','#a5f3fc','#ffffff','#cffafe','#0891b2'],
      upgrade: ['#34d399','#6ee7b7','#a7f3d0','#10b981'],
      jackpot: ['#ffd700','#ff6bff','#ffffff','#f59e0b','#ff6b6b','#4d96ff','#ffd93d','#6bcb77'],
    };
    const pal = PALETTES[type] ?? PALETTES.win;
    return {
      x, y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd - (isBig ? 8 : type === 'wash' ? 2 : 3.5),
      size: isBig            ? 5 + Math.random() * 12
          : type === 'wash'  ? 3 + Math.random() * 6
          : 4 + Math.random() * 8,
      color: pal[Math.floor(Math.random() * pal.length)],
      life: 1,
      decay: type === 'wash' ? 0.025 + Math.random() * 0.02 : 0.013 + Math.random() * 0.022,
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.22,
      shape: isBig ? (Math.random() > 0.45 ? 'rect' : 'circle') : 'circle',
    };
  },

  _loop() {
    this.raf = requestAnimationFrame(() => this._loop());
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.list = this.list.filter(p => p.life > 0.02);
    if (!this.list.length) {
      cancelAnimationFrame(this.raf);
      this.raf = null;
      return;
    }

    for (const p of this.list) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.22;
      p.vx *= 0.99;
      p.life -= p.decay;
      p.rot  += p.rotSpd;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size * 0.28, p.size, p.size * 0.56);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },
};

// ── STATE ────────────────────────────────────────────────────────────────────

let state = {
  balance: 1000,
  deck: [],          // cards purchased but not yet scratched
  currentCard: null,
  revealed: false,
  isDrawing: false,
  balanceAF: null,
  stats: { games: 0, wins: 0, bestWin: 0, streak: 0 },
  jackpotMultipliers: [],
  job: {
    upgrades: {},
    clickPower: 1,
    autoIncome: 0,
    totalWashed: 0,
    bankruptShown: false,
  },
  prestige: {
    level: 0,        // 0 = first cycle (displayed as 周目 1)
    multiplier: 1.0, // earnings multiplier (×1.0, ×1.1, ×1.2 …)
  },
  activeTab: 'shop',
};

// Goal scaling — each cycle the bar grows ~2.5× while multiplier only +0.1×
function currentGoal() {
  return Math.round(10000 * Math.pow(2.5, state.prestige.level));
}
function nextMultiplier() {
  return Math.round((state.prestige.multiplier + 0.1) * 10) / 10;
}
function multiply(amount) {
  return Math.floor(amount * state.prestige.multiplier);
}

// ── DOM REFS ─────────────────────────────────────────────────────────────────

const $balance       = document.getElementById('balance');
const $shop          = document.getElementById('shop');
const $jobCenter     = document.getElementById('job-center');
const $scratchArea   = document.getElementById('scratch-area');
const $overlay       = document.getElementById('overlay');
const $canvas        = document.getElementById('scratch-canvas');
const $cardResult    = document.getElementById('card-result');
const $progressBar   = document.getElementById('scratch-progress-bar');
const $progressLbl   = document.getElementById('scratch-progress-label');
const $soundBtn      = document.getElementById('sound-toggle');
const $flash         = document.getElementById('flash-overlay');
const $shine         = document.querySelector('.card-shine');
const $tabs          = document.getElementById('tabs');
const $backBtn       = document.getElementById('back-btn');
const $washBtn       = document.getElementById('wash-btn');
const $jobClickP     = document.getElementById('job-click-power');
const $jobAutoIncome = document.getElementById('job-auto-income');
const $upgradesList  = document.getElementById('upgrades-list');
const ctx            = $canvas.getContext('2d');

// ── PERSISTENCE ──────────────────────────────────────────────────────────────

const SAVE_KEY = 'scratchy_save';

let _suppressSave = false;
function saveState() {
  if (_suppressSave) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      balance: state.balance,
      stats:   { ...state.stats },
      // Strip internal _new flag before persisting
      deck: state.deck.map(({ _new, ...c }) => c),
      job: {
        upgrades:      { ...state.job.upgrades },
        totalWashed:   state.job.totalWashed,
        bankruptShown: state.job.bankruptShown,
      },
      prestige: { ...state.prestige },
    }));
  } catch { /* storage unavailable — skip silently */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.balance === 'number') state.balance = s.balance;
    if (s.stats) {
      state.stats.games   = s.stats.games   ?? 0;
      state.stats.wins    = s.stats.wins    ?? 0;
      state.stats.bestWin = s.stats.bestWin ?? 0;
      state.stats.streak  = s.stats.streak  ?? 0;
    }
    if (Array.isArray(s.deck)) state.deck = s.deck;
    if (s.job) {
      state.job.upgrades      = s.job.upgrades      ?? {};
      state.job.totalWashed   = s.job.totalWashed   ?? 0;
      state.job.bankruptShown = s.job.bankruptShown ?? false;
    }
    if (s.prestige) {
      state.prestige.level      = s.prestige.level      ?? 0;
      state.prestige.multiplier = s.prestige.multiplier ?? 1.0;
    }
  } catch { /* corrupted save — start fresh */ }
}

window.addEventListener('beforeunload', saveState);
setInterval(saveState, 15_000); // catch auto-income drift

// ── BALANCE ANIMATION ────────────────────────────────────────────────────────

function animateBalance(from, to) {
  if (state.balanceAF) cancelAnimationFrame(state.balanceAF);
  const dur   = Math.min(700, 200 + Math.abs(to - from) * 0.4);
  const start = performance.now();
  const delta = to - from;

  $balance.className = delta > 0 ? 'up' : delta < 0 ? 'down' : '';

  function tick(now) {
    const t    = Math.min((now - start) / dur, 1);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    $balance.textContent = Math.round(from + delta * ease).toLocaleString();
    if (t < 1) {
      state.balanceAF = requestAnimationFrame(tick);
    } else {
      $balance.textContent = to.toLocaleString();
      $balance.className = '';
      refreshUpgradeAvailability();
    }
    updateGoalUI();
  }
  state.balanceAF = requestAnimationFrame(tick);
}

function setBalanceInstant(v) {
  state.balance = v;
  $balance.textContent = v.toLocaleString();
  refreshUpgradeAvailability();
  updateGoalUI();
}

// ── GOAL / PRESTIGE UI ──────────────────────────────────────────────────────
function updateGoalUI() {
  const goal = currentGoal();
  const have = Math.max(0, state.balance);
  const pct  = Math.min(100, (have / goal) * 100);
  const bar  = document.getElementById('goal-bar');
  const fill = document.getElementById('goal-bar-fill');
  const text = document.getElementById('goal-bar-text');
  const cyc  = document.getElementById('goal-cycle-num');
  const mlt  = document.getElementById('goal-multiplier');
  const fab  = document.getElementById('prestige-btn');
  if (!bar) return;
  fill.style.width = `${pct}%`;
  text.textContent = `${have.toLocaleString()} / ${goal.toLocaleString()}`;
  cyc.textContent  = state.prestige.level + 1;
  mlt.textContent  = state.prestige.multiplier.toFixed(1);
  const reached = have >= goal;
  bar.classList.toggle('complete', reached);
  if (fab) {
    fab.classList.toggle('locked', !reached);
    fab.title = reached
      ? `重生！倍率 ×${state.prestige.multiplier.toFixed(1)} → ×${nextMultiplier().toFixed(1)}`
      : `達到 ${goal.toLocaleString()} 籌碼後可進入下一周目`;
  }
}

// ── SCREEN EFFECTS ───────────────────────────────────────────────────────────

function flash(color) {
  $flash.style.background = color;
  $flash.classList.add('active');
  setTimeout(() => $flash.classList.remove('active'), 60);
}

function shakeCard() {
  $cardResult.classList.remove('shake');
  void $cardResult.offsetWidth;
  $cardResult.classList.add('shake');
}

function showFloatingText(text, anchor, color = '#67e8f9') {
  const rect = anchor.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = 'float-text';
  el.textContent = text;
  el.style.color = color;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top  = `${rect.top + 12}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

// ── STATS ────────────────────────────────────────────────────────────────────

function updateStats() { /* stat bar removed — no-op kept for call-site compatibility */ }

// ── JOB / UPGRADES ───────────────────────────────────────────────────────────

function recalcJobStats() {
  let click = 1, auto = 0;
  for (const [key, count] of Object.entries(state.job.upgrades)) {
    const u = UPGRADES.find(x => x.key === key);
    if (!u || !count) continue;
    if (u.type === 'click') click += u.effect * count;
    else                    auto  += u.effect * count;
  }
  // Bake the prestige multiplier into displayed click power / auto income
  state.job.clickPower = Math.max(1, Math.floor(click * state.prestige.multiplier));
  state.job.autoIncome = Math.floor(auto * state.prestige.multiplier);
  $jobClickP.textContent     = `+${state.job.clickPower.toLocaleString()}`;
  $jobAutoIncome.textContent = `+${state.job.autoIncome.toLocaleString()}`;
}

function renderUpgrades() {
  $upgradesList.innerHTML = '';
  for (const u of UPGRADES) {
    const owned = state.job.upgrades[u.key] || 0;
    const cost  = upgradeCost(u, owned);
    const canBuy = state.balance >= cost;

    const row = document.createElement('div');
    row.className = `upgrade-item ${canBuy ? 'affordable' : ''}`;
    row.dataset.key = u.key;

    const descClass = u.type === 'click' ? 'click' : 'auto';
    const descText  = u.type === 'click'
      ? `每次洗碗 +${u.effect}`
      : `+${u.effect}/秒（被動）`;

    row.innerHTML = `
      <div class="up-icon">${u.icon}</div>
      <div class="up-info">
        <div class="up-name">${u.name}${owned > 0 ? `<span class="up-count">×${owned}</span>` : ''}</div>
        <div class="up-desc ${descClass}">${descText}</div>
      </div>
      <button class="up-buy" data-key="${u.key}" ${canBuy ? '' : 'disabled'}>
        ${cost.toLocaleString()}
      </button>
    `;
    $upgradesList.appendChild(row);
  }

  $upgradesList.querySelectorAll('.up-buy').forEach(btn =>
    btn.addEventListener('click', () => buyUpgrade(btn.dataset.key))
  );
}

function refreshUpgradeAvailability() {
  $upgradesList.querySelectorAll('.upgrade-item').forEach(row => {
    const key   = row.dataset.key;
    const u     = UPGRADES.find(x => x.key === key);
    const owned = state.job.upgrades[key] || 0;
    const cost  = upgradeCost(u, owned);
    const can   = state.balance >= cost;
    const btn   = row.querySelector('.up-buy');
    btn.disabled    = !can;
    btn.textContent = cost.toLocaleString();
    row.classList.toggle('affordable', can);
  });
}

// Base positions around the plate — each upgrade has its own quadrant,
// kept well clear of the plate (radius ≈ 130px when plate is 260px wide).
const GEAR_POSITIONS = {
  gloves:     { x: -200, y:  -55, r: -16, icon: '🧤' },
  soap:       { x:  198, y:  -68, r:  12, icon: '🧴' },
  sprayer:    { x: -212, y:   70, r: -10, icon: '💦' },
  license:    { x:  205, y:   85, r:  18, icon: '📜' },
  dishwasher: { x:   15, y: -200, r:   4, icon: '🍽️' },
  robot:      { x:  -15, y:  205, r:  -4, icon: '🤖' },
  ai:         { x: -228, y:    8, r: -22, icon: '🧠' },
  chain:      { x:  225, y:   18, r:  16, icon: '🏪' },
};

// Cluster offsets for duplicate copies (deterministic, spirals outward)
const COPY_OFFSETS = [
  [  0,   0], [-30,  18], [ 28, -16], [-22, -28],
  [ 34,  24], [-12,  34], [ 18, -36], [-38,   4],
  [ 38,  -4], [  4,  38], [ -4, -38], [-30, -18],
];
const MAX_COPIES = 12;
const FLOAT_DELAYS = ['0s', '0.3s', '0.6s', '0.9s', '1.2s', '1.5s', '1.8s', '2.1s'];

function renderGear(popKey) {
  const container = document.getElementById('wash-gear');
  if (!container) return;
  container.innerHTML = '';
  let delayIdx = 0;
  for (const u of UPGRADES) {
    const count = state.job.upgrades[u.key] || 0;
    if (count === 0) continue;
    const pos = GEAR_POSITIONS[u.key];
    if (!pos) continue;
    const display = Math.min(count, MAX_COPIES);
    for (let i = 0; i < display; i++) {
      const [ox, oy] = COPY_OFFSETS[i % COPY_OFFSETS.length];
      const el = document.createElement('div');
      el.className = 'gear-item';
      el.textContent = pos.icon;
      el.style.setProperty('--gx', `${pos.x + ox}px`);
      el.style.setProperty('--gy', `${pos.y + oy}px`);
      el.style.setProperty('--gr', `${pos.r + (i % 2 ? 6 : -6)}deg`);
      el.style.setProperty('--gd', FLOAT_DELAYS[(delayIdx++) % FLOAT_DELAYS.length]);
      // Animate only the newest copy of the just-bought upgrade
      if (u.key === popKey && i === display - 1) el.classList.add('pop-in');
      container.appendChild(el);
    }
  }
}

function buyUpgrade(key) {
  SFX.resume();
  const u = UPGRADES.find(x => x.key === key);
  if (!u) return;
  const owned = state.job.upgrades[key] || 0;
  const cost  = upgradeCost(u, owned);
  if (state.balance < cost) {
    showModal('💸', '籌碼不足', `需要 ${cost.toLocaleString()} 籌碼！`);
    return;
  }

  const prev = state.balance;
  state.balance -= cost;
  state.job.upgrades[key] = owned + 1;

  animateBalance(prev, state.balance);
  recalcJobStats();
  renderUpgrades();
  renderGear(key);   // fly-in the newly purchased icon
  SFX.upgrade();
  saveState();

  const btn = $upgradesList.querySelector(`.up-buy[data-key="${key}"]`);
  if (btn) {
    const r = btn.getBoundingClientRect();
    Particles.emit('upgrade', r.left + r.width / 2, r.top + r.height / 2);
  }
}

function washDish() {
  SFX.resume();
  const earn = state.job.clickPower;
  const prev = state.balance;
  state.balance += earn;
  state.job.totalWashed++;

  animateBalance(prev, state.balance);
  SFX.wash();
  saveState();

  $washBtn.classList.remove('bounce');
  void $washBtn.offsetWidth;
  $washBtn.classList.add('bounce');

  const r = $washBtn.getBoundingClientRect();
  Particles.emit('wash', r.left + r.width / 2, r.top + r.height * 0.4);
  showFloatingText(`+${earn}`, $washBtn, '#67e8f9');
}

// Auto income tick — runs every second
setInterval(() => {
  if (state.job.autoIncome <= 0) return;
  state.balance += state.job.autoIncome;
  $balance.textContent = state.balance.toLocaleString();
  refreshUpgradeAvailability();
  updateStats();
  updateGoalUI();
}, 1000);

// ── TABS ─────────────────────────────────────────────────────────────────────

function switchTab(name) {
  state.activeTab = name;
  $tabs.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name)
  );
  $shop.classList.toggle('hidden', name !== 'shop');
  $jobCenter.classList.toggle('hidden', name !== 'job');
  updateScreenChrome();
}

function updateScreenChrome() {
  const inScratch = !$scratchArea.classList.contains('hidden');
  const jobFocus  = state.activeTab === 'job' && !inScratch;
  document.body.classList.toggle('focus-job', jobFocus);
}

// ── GAME LOGIC ───────────────────────────────────────────────────────────────

function rollResult(type) {
  const cfg = CARD_TYPES[type];
  const r   = Math.random();
  let cum = 0, chosen = cfg.weights[cfg.weights.length - 1];
  for (const w of cfg.weights) {
    cum += w.prob;
    if (r < cum) { chosen = w; break; }
  }
  if (chosen.outcome === 'zero') return { outcome: 'zero', amount: 0 };
  const [min, max] = chosen.range;
  return { outcome: chosen.outcome, amount: Math.round(min + Math.random() * (max - min)) };
}

function buyCard(type) {
  SFX.resume();
  const cfg = CARD_TYPES[type];
  if (state.balance < cfg.cost) {
    showModal('💸', '籌碼不足', `需要 ${cfg.cost} 籌碼才能購買「${cfg.label}」！\n試試打工區洗碗賺錢吧！`);
    return;
  }

  const prev = state.balance;
  state.balance -= cfg.cost;
  animateBalance(prev, state.balance);
  SFX.buy();
  saveState();

  const btn = document.querySelector(`.buy-btn[data-type="${type}"]`);
  if (btn) {
    const r = btn.getBoundingClientRect();
    Particles.emit('buy', r.left + r.width / 2, r.top + r.height / 2);
  }

  const { outcome, amount } = rollResult(type);
  state.deck.push({
    id:      Date.now() + Math.random(),
    type, outcome, amount,
    rot: (Math.random() * 22 - 11),
    x:   5  + Math.random() * 68,
    y:   5  + Math.random() * 52,
    _new: true,
  });
  renderDeck();
}

function renderDeck() {
  const container = document.getElementById('deck-container');
  const hint      = document.getElementById('desk-hint');
  if (!container) return;

  container.innerHTML = '';
  hint.classList.toggle('hidden', state.deck.length > 0);

  state.deck.forEach((card, idx) => {
    const cfg = CARD_TYPES[card.type];
    const div = document.createElement('div');
    div.className = `deck-card type-${card.type}`;
    div.dataset.id = card.id;
    div.style.setProperty('--rot', `${card.rot}deg`);
    div.style.left = `${card.x}%`;
    div.style.top  = `${card.y}%`;
    div.style.zIndex = idx + 1;

    div.innerHTML = `
      <div class="dc-top">
        <div class="dc-thumb">${cfg.icon}</div>
        <div class="dc-name">${cfg.label}</div>
      </div>
      <div class="dc-silver"></div>
    `;

    if (card._new) {
      div.classList.add('card-landing');
      card._new = false;
      setTimeout(() => div.classList.remove('card-landing'), 500);
    }

    div.addEventListener('click', () => openCard(card.id));
    container.appendChild(div);
  });
}

function openCard(cardId) {
  const card = state.deck.find(c => c.id === cardId);
  if (!card) return;
  state.currentCard = card;
  state.revealed    = false;
  showScratchArea(card.type, card.outcome, card.amount);
}

function showScratchArea(type, outcome, amount) {
  $shop.classList.add('hidden');
  $jobCenter.classList.add('hidden');
  $tabs.classList.add('hidden');
  $scratchArea.classList.remove('hidden');
  $backBtn.classList.add('hidden');
  updateScreenChrome();
  $cardResult.classList.add('hidden');
  $cardResult.style.boxShadow = '';
  $cardResult.classList.remove('shake');
  $progressBar.style.width = '0%';
  $progressLbl.textContent  = '0%';
  $shine.classList.remove('hidden');

  const oc = OUTCOME_CFG[outcome];

  $cardResult.style.background = {
    cheap:   'linear-gradient(135deg,#1b4332,#2d6a4f)',
    mid:     'linear-gradient(135deg,#0a1628,#1d3557)',
    premium: 'linear-gradient(135deg,#3b0764,#6d2b8f)',
  }[type];

  const syms = $cardResult.querySelectorAll('.prize-symbol');
  oc.symbols.forEach((s, i) => { if (syms[i]) syms[i].textContent = s; });

  document.getElementById('result-text').textContent   = oc.label;
  const $amt = document.getElementById('result-amount');
  const displayAmt = amount > 0 ? multiply(amount) : amount;
  $amt.textContent  = displayAmt > 0 ? `+${displayAmt.toLocaleString()} 籌碼` : displayAmt < 0 ? `${displayAmt.toLocaleString()} 籌碼` : '無獎勵';
  $amt.className    = oc.amtClass;

  $cardResult.classList.remove('hidden');
  initScratchCanvas();
}

function exitScratchMode() {
  $scratchArea.classList.add('hidden');
  $tabs.classList.remove('hidden');
  switchTab(state.activeTab);
  renderDeck();
}

function initScratchCanvas() {
  const W = $canvas.parentElement.clientWidth;
  const H = Math.round(W * 0.54);
  $canvas.width  = W;
  $canvas.height = H;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   '#8e8e8e');
  grad.addColorStop(0.28,'#d8d8d8');
  grad.addColorStop(0.5, '#b0b0b0');
  grad.addColorStop(0.72,'#d8d8d8');
  grad.addColorStop(1,   '#8e8e8e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.035;
  for (let y = 0; y < H; y += 2)
    for (let x = 0; x < W; x += 2)
      if (Math.random() > 0.5) { ctx.fillStyle = '#000'; ctx.fillRect(x, y, 2, 2); }
  ctx.globalAlpha = 1;

  ctx.globalAlpha = 0.11;
  ctx.fillStyle   = '#444';
  ctx.font        = `${Math.max(10, Math.round(W * 0.031))}px sans-serif`;
  for (let y = 22; y < H; y += 28)
    for (let x = 0; x < W; x += 96)
      ctx.fillText('✨ 刮刮樂 ✨', x + (y % 56 === 22 ? 0 : 48), y);
  ctx.globalAlpha = 1;

  ctx.fillStyle   = 'rgba(50,50,50,0.65)';
  ctx.font        = `bold ${Math.round(W * 0.05)}px sans-serif`;
  ctx.textAlign   = 'center';
  ctx.fillText('✦ 刮開看看 ✦', W / 2, H / 2);
  ctx.font        = `${Math.round(W * 0.033)}px sans-serif`;
  ctx.fillStyle   = 'rgba(50,50,50,0.45)';
  ctx.fillText('用手指或滑鼠刮除', W / 2, H / 2 + Math.round(W * 0.06));
  ctx.textAlign   = 'left';

  attachScratchEvents();
}

// ── SCRATCH LOGIC ────────────────────────────────────────────────────────────

function getScratchPos(e) {
  const rect   = $canvas.getBoundingClientRect();
  const scaleX = $canvas.width  / rect.width;
  const scaleY = $canvas.height / rect.height;
  const src    = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

function scratchAt(x, y) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  SFX.scratch();
  updateProgress();
}

function updateProgress() {
  if (state.revealed) return;
  const data = ctx.getImageData(0, 0, $canvas.width, $canvas.height).data;
  let transparent = 0;
  for (let i = 3; i < data.length; i += 16)
    if (data[i] < 128) transparent++;
  const pct = transparent / (data.length / 16);
  const display = Math.min(Math.round(pct * 100), 100);
  $progressBar.style.width = `${display}%`;
  $progressLbl.textContent = `${display}%`;
  if (pct > 0.55) revealCard();
}

function revealCard() {
  if (state.revealed) return;
  state.revealed = true;

  SFX.reveal();
  ctx.clearRect(0, 0, $canvas.width, $canvas.height);
  $progressBar.style.width = '100%';
  $progressLbl.textContent = '100%';
  $shine.classList.add('hidden');

  const oc = OUTCOME_CFG[state.currentCard.outcome];
  $cardResult.style.transition = 'box-shadow 0.5s ease';
  $cardResult.style.boxShadow  = `0 0 40px ${oc.glow}, 0 0 80px ${oc.glow}50`;

  applyReward();
  $backBtn.classList.remove('hidden');
}

function applyReward() {
  const { type, outcome, amount: rawAmount } = state.currentCard;

  // Remove this card from the desk
  state.deck = state.deck.filter(c => c.id !== state.currentCard.id);

  // Apply prestige multiplier only to positive winnings (losses stay as-is)
  const amount = rawAmount > 0 ? multiply(rawAmount) : rawAmount;

  const prev = state.balance;
  state.balance = Math.max(0, state.balance + amount);
  animateBalance(prev, state.balance);

  state.stats.games++;
  if (amount > 0) {
    state.stats.wins++;
    if (amount > state.stats.bestWin) state.stats.bestWin = amount;
    state.stats.streak++;
    updateStreakUI();
    if (state.stats.streak >= 5) {
      state.stats.streak = 0;
      updateStreakUI();
      setTimeout(() => showJackpot(type), 1800);
    }
  } else {
    state.stats.streak = 0;
    updateStreakUI();
  }

  triggerEffects(outcome);
  saveState();

  if (state.balance === 0 && !state.job.bankruptShown) {
    state.job.bankruptShown = true;
    setTimeout(() => {
      SFX.bankrupt();
      showModal(
        '💔', '破產了！',
        '別擔心，到「💼 打工」分頁洗碗賺回籌碼吧！'
      );
    }, 900);
  }
}

function triggerEffects(outcome) {
  const rect = $canvas.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  switch (outcome) {
    case 'big':
      SFX.bigWin();
      flash('rgba(255,215,0,0.22)');
      Particles.emit('bigWin', cx, cy);
      break;
    case 'small':
      SFX.win();
      flash('rgba(74,222,128,0.18)');
      Particles.emit('win', cx, cy);
      break;
    case 'lose':
      SFX.lose();
      flash('rgba(248,113,113,0.18)');
      shakeCard();
      break;
  }
}

// ── JACKPOT ───────────────────────────────────────────────────────────────────

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateStreakUI() {
  const s = state.stats.streak;
  const $banner = document.getElementById('streak-banner');
  if (s > 0) {
    document.getElementById('streak-count').textContent = s;
    document.getElementById('streak-need').textContent = 5 - s;
    $banner.classList.remove('hidden');
  } else {
    $banner.classList.add('hidden');
  }
}

function showJackpot(type) {
  const cardCost = CARD_TYPES[type].cost;
  state.jackpotMultipliers = shuffleArray([
    Math.round(cardCost * 1.5),
    Math.round(cardCost * 3),
    Math.round(cardCost * 5),
  ]);

  document.getElementById('jackpot-result').classList.add('hidden');
  document.querySelectorAll('.chest-btn').forEach(b => {
    b.disabled = false;
    b.classList.remove('chosen');
  });
  document.getElementById('jackpot-overlay').classList.remove('hidden');

  SFX.jackpot();
  flash('rgba(255,215,0,0.3)');
  Particles.emit('jackpot', window.innerWidth / 2, window.innerHeight / 3);
}

function pickChest(idx) {
  SFX.resume();
  const amount = multiply(state.jackpotMultipliers[idx]);

  document.querySelectorAll('.chest-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === idx) b.classList.add('chosen');
  });

  setTimeout(() => {
    const prev = state.balance;
    state.balance += amount;
    animateBalance(prev, state.balance);
    updateStats();

    document.getElementById('jackpot-chosen-emoji').textContent = '🎊';
    document.getElementById('jackpot-result-amount').textContent = `+${amount.toLocaleString()} 籌碼`;
    document.getElementById('jackpot-result').classList.remove('hidden');

    saveState();
    SFX.bigWin();
    flash('rgba(255,215,0,0.45)');
    Particles.emit('jackpot', window.innerWidth / 2, window.innerHeight / 3);
    Particles.emit('bigWin', window.innerWidth / 2, window.innerHeight / 2);
  }, 500);
}

// ── MODAL ────────────────────────────────────────────────────────────────────

function showModal(emoji, title, msg) {
  document.getElementById('modal-emoji').textContent = emoji;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-msg').textContent   = msg;
  $overlay.classList.remove('hidden');
  document.getElementById('modal-close').onclick = () => {
    $overlay.classList.add('hidden');
  };
}

// ── EVENTS ───────────────────────────────────────────────────────────────────

function attachScratchEvents() {
  $canvas.onmousedown  = (e) => { state.isDrawing = true;  const p = getScratchPos(e); scratchAt(p.x, p.y); };
  $canvas.onmousemove  = (e) => { if (!state.isDrawing) return; const p = getScratchPos(e); scratchAt(p.x, p.y); };
  $canvas.onmouseup    = () => { state.isDrawing = false; };
  $canvas.onmouseleave = () => { state.isDrawing = false; };
  $canvas.ontouchstart = (e) => { e.preventDefault(); state.isDrawing = true;  const p = getScratchPos(e); scratchAt(p.x, p.y); };
  $canvas.ontouchmove  = (e) => { e.preventDefault(); if (!state.isDrawing) return; const p = getScratchPos(e); scratchAt(p.x, p.y); };
  $canvas.ontouchend   = () => { state.isDrawing = false; };
}

document.querySelectorAll('.buy-btn').forEach(btn =>
  btn.addEventListener('click', () => buyCard(btn.dataset.type))
);

$backBtn.addEventListener('click', () => {
  exitScratchMode();
});

$soundBtn.addEventListener('click', () => {
  SFX.resume();
  SFX.enabled = !SFX.enabled;
  $soundBtn.textContent = SFX.enabled ? '🔊' : '🔇';
  $soundBtn.title       = SFX.enabled ? '關閉音效' : '開啟音效';
});

$tabs.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (btn) switchTab(btn.dataset.tab);
});

$washBtn.addEventListener('click', washDish);

document.querySelectorAll('.chest-btn').forEach(btn =>
  btn.addEventListener('click', () => pickChest(parseInt(btn.dataset.idx)))
);

document.getElementById('jackpot-close').addEventListener('click', () => {
  document.getElementById('jackpot-overlay').classList.add('hidden');
  exitScratchMode();
});

// ── PRESTIGE / FULL RESET ──────────────────────────────────────────────────
function doPrestige() {
  const goal = currentGoal();
  if (state.balance < goal) return;
  SFX.resume();
  const oldMult = state.prestige.multiplier;
  const newMult = nextMultiplier();
  state.prestige.level += 1;
  state.prestige.multiplier = newMult;

  // Soft reset: clear gameplay progress, keep prestige + cumulative stats
  state.balance = 1000;
  state.deck = [];
  state.job.upgrades = {};
  state.job.totalWashed = 0;
  state.job.bankruptShown = false;
  state.stats.streak = 0;
  state.jackpotMultipliers = [];

  recalcJobStats();
  renderUpgrades();
  renderGear(null);
  renderDeck();
  updateStreakUI();
  setBalanceInstant(state.balance);
  saveState();

  // Celebration: rainbow burst + modal
  flash('rgba(192,132,252,0.35)');
  Particles.emit('jackpot', window.innerWidth / 2, window.innerHeight / 2);
  SFX.bigWin();
  showModal(
    '∞',
    `第 ${state.prestige.level + 1} 周目開始！`,
    `所有獎勵倍率 ×${oldMult.toFixed(1)} → ×${newMult.toFixed(1)}，下一個目標 ${currentGoal().toLocaleString()} 籌碼。`
  );
}

function doFullReset() {
  if (!confirm('確定要完全重置遊戲嗎？\n所有金錢、升級、周目進度都將清空。')) return;
  // Stop the beforeunload + interval handlers from re-saving in-memory
  // state on top of the cleared storage before the reload completes.
  _suppressSave = true;
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  location.reload();
}

document.getElementById('prestige-btn').addEventListener('click', doPrestige);
document.getElementById('full-reset-btn').addEventListener('click', doFullReset);

// ── INIT ─────────────────────────────────────────────────────────────────────

loadState();
Particles.init();
animateBalance(0, state.balance);
recalcJobStats();
renderUpgrades();
renderGear(null);   // restore purchased gear icons from saved state
updateStreakUI();
updateGoalUI();
switchTab('shop');
renderDeck();
