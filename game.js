// ── CONFIG ──────────────────────────────────────────────────────────────────

const CARD_TYPES = {
  cheap:   { cost: 50,    label: '基本款', icon: '🎟️', color: '#9e9e9e', unlockAt: 0,
    weights: [{ outcome:'zero', prob:0.55 }, { outcome:'small', range:[65,200],  prob:0.33 }, { outcome:'big', range:[260,600],   prob:0.12 }] },
  mid:     { cost: 200,   label: '進階款', icon: '🎫', color: '#4a90d9', unlockAt: 0,
    weights: [{ outcome:'zero', prob:0.50 }, { outcome:'small', range:[240,600], prob:0.35 }, { outcome:'big', range:[700,1800],  prob:0.15 }] },
  deluxe:  { cost: 500,   label: '精緻款', icon: '🌟', color: '#a855f7', unlockAt: 0,
    weights: [{ outcome:'zero', prob:0.46 }, { outcome:'small', range:[600,1400],prob:0.35 }, { outcome:'big', range:[1800,5000], prob:0.19 }] },
  premium: { cost: 1200,  label: '豪華款', icon: '💎', color: '#c084fc', unlockAt: 0,
    weights: [{ outcome:'zero', prob:0.42 }, { outcome:'small', range:[1400,3200],prob:0.35 }, { outcome:'big', range:[4500,12000],prob:0.23 }] },
  elite:   { cost: 3000,  label: '菁英款', icon: '🥇', color: '#f59e0b', unlockAt: 1,
    weights: [{ outcome:'zero', prob:0.38 }, { outcome:'small', range:[3500,8000],prob:0.35 }, { outcome:'big', range:[10000,28000],prob:0.27 }] },
  legend:  { cost: 7500,  label: '傳奇款', icon: '🏆', color: '#f97316', unlockAt: 1,
    weights: [{ outcome:'zero', prob:0.35 }, { outcome:'small', range:[8500,20000],prob:0.35 }, { outcome:'big', range:[25000,70000],prob:0.30 }] },
  mythic:  { cost: 18000, label: '神話款', icon: '👑', color: '#ec4899', unlockAt: 2,
    weights: [{ outcome:'zero', prob:0.32 }, { outcome:'small', range:[20000,50000],prob:0.35 }, { outcome:'big', range:[60000,180000],prob:0.33 }] },
  divine:  { cost: 50000, label: '神聖款', icon: '✨', color: '#ffd700', unlockAt: 2,
    weights: [{ outcome:'zero', prob:0.28 }, { outcome:'small', range:[55000,130000],prob:0.35 }, { outcome:'big', range:[160000,500000],prob:0.37 }] },
};

const OUTCOME_CFG = {
  lose:  { label: '扣錢！',  symbols: ['💸','📉','💀'], glow: '#f87171', amtClass: 'amount-lose' },
  zero:  { label: '很遺憾…', symbols: ['🌧️','💨','😮‍💨'], glow: '#64748b', amtClass: 'amount-zero' },
  small: { label: '中獎！',  symbols: ['⭐','💰','✨'],  glow: '#4ade80', amtClass: 'amount-win'  },
  big:   { label: '大獎！！',symbols: ['🏆','👑','💎'],  glow: '#fbbf24', amtClass: 'amount-win'  },
};

const ACHIEVEMENTS = [
  // First-time
  { key:'first_card',        icon:'🎟️', name:'初刮者',     desc:'買下第一張刮刮樂' },
  { key:'first_win',         icon:'⭐',  name:'首勝！',     desc:'第一次中獎' },
  { key:'first_big',         icon:'🏆',  name:'大豐收',     desc:'第一次大獎' },
  { key:'first_wash',        icon:'🧽',  name:'洗碗新手',   desc:'第一次洗碗' },
  { key:'first_drop',        icon:'🎁',  name:'神秘掉落',   desc:'第一次獲得升級道具' },
  { key:'first_prestige',    icon:'♾️',  name:'超越自我',   desc:'完成第一次重生' },
  { key:'first_jackpot',     icon:'🎰',  name:'幸運光顧',   desc:'第一次觸發 Jackpot Fever' },
  { key:'first_broke',       icon:'💔',  name:'人生低谷',   desc:'第一次餘額歸零' },
  { key:'first_unlock',      icon:'🔓',  name:'新視野',     desc:'解鎖新刮刮樂' },
  { key:'first_autoearning', icon:'🤖',  name:'不勞而獲',   desc:'第一次獲得被動收入' },
  { key:'first_zero',        icon:'😶',  name:'空手而回',   desc:'第一次刮出沒中獎' },
  { key:'title_click',       icon:'🎮',  name:'好奇心',     desc:'點擊遊戲標題' },
  // Volume
  { key:'scratch_10',        icon:'📋',  name:'練習刮卡',   desc:'刮了10張刮刮樂' },
  { key:'scratch_50',        icon:'📦',  name:'刮卡達人',   desc:'刮了50張刮刮樂' },
  { key:'scratch_100',       icon:'🗂️',  name:'百刮不倦',   desc:'刮了100張刮刮樂' },
  { key:'scratch_500',       icon:'⚡',  name:'刮卡狂魔',   desc:'刮了500張刮刮樂' },
  { key:'wash_100',          icon:'💧',  name:'勤勞洗碗',   desc:'洗了100個碗' },
  { key:'wash_1000',         icon:'🌊',  name:'洗碗達人',   desc:'洗了1,000個碗' },
  { key:'wash_10000',        icon:'🌀',  name:'洗碗傳說',   desc:'洗了10,000個碗' },
  { key:'deck_5',            icon:'🃏',  name:'桌面混亂',   desc:'桌上同時有5張刮刮樂' },
  // Money
  { key:'balance_5k',        icon:'💵',  name:'小有餘裕',   desc:'擁有5,000籌碼' },
  { key:'balance_20k',       icon:'💴',  name:'中等富裕',   desc:'擁有20,000籌碼' },
  { key:'balance_100k',      icon:'💰',  name:'大富翁',     desc:'擁有100,000籌碼' },
  { key:'balance_1m',        icon:'🤑',  name:'百萬俱樂部', desc:'擁有1,000,000籌碼' },
  { key:'earn_50k',          icon:'📈',  name:'五萬累積',   desc:'累積賺取50,000籌碼' },
  { key:'earn_500k',         icon:'📊',  name:'財源廣進',   desc:'累積賺取500,000籌碼' },
  { key:'earn_5m',           icon:'🏦',  name:'傳奇富豪',   desc:'累積賺取5,000,000籌碼' },
  { key:'first_goal',        icon:'🎯',  name:'達標！',     desc:'第一次達到周目目標金額' },
  // Card variety
  { key:'buy_all_types',     icon:'🎪',  name:'刮遍全場',   desc:'每種刮刮樂都買過至少一次' },
  { key:'unlock_elite',      icon:'🥇',  name:'進階解鎖',   desc:'解鎖菁英款刮刮樂' },
  { key:'unlock_myth',       icon:'👑',  name:'神話降臨',   desc:'解鎖神話款刮刮樂' },
  { key:'divine_scratch',    icon:'✨',  name:'神聖時刻',   desc:'購買神聖款刮刮樂' },
  { key:'divine_big',        icon:'🌟',  name:'天降橫財',   desc:'神聖款中大獎' },
  { key:'jackpot_gold',      icon:'🏆',  name:'金手指',     desc:'在 Jackpot 中選中最高獎箱' },
  // Streaks & special
  { key:'streak_3',          icon:'🔥',  name:'三連勝',     desc:'連贏3次' },
  { key:'back_to_back',      icon:'🎆',  name:'雙黃蛋',     desc:'連續兩張大獎' },
  { key:'lucky_7',           icon:'7️⃣',  name:'幸運7',      desc:'中獎金額包含數字7' },
  { key:'lucky_777',         icon:'🎰',  name:'三個7',      desc:'中獎金額包含777' },
  { key:'broke_win',         icon:'🌅',  name:'鹹魚翻身',   desc:'餘額低於100時中獎' },
  { key:'goal_exact',        icon:'💫',  name:'分毫不差',   desc:'中獎後金額剛好達到周目目標' },
  // Upgrades
  { key:'drop_click',        icon:'👆',  name:'點擊加速',   desc:'獲得點擊類升級道具' },
  { key:'drop_auto',         icon:'⚙️',  name:'自動賺錢',   desc:'獲得自動收入升級道具' },
  { key:'all_upgrades',      icon:'🧰',  name:'全套收集',   desc:'集齊8種升級道具（每種至少1個）' },
  { key:'upgrade_3',         icon:'🔼',  name:'三級達人',   desc:'任一道具累積3個' },
  { key:'upgrade_5',         icon:'⏫',  name:'五級大師',   desc:'任一道具累積5個' },
  // Prestige
  { key:'prestige_3',        icon:'🌀',  name:'三周目',     desc:'進入第3周目' },
  { key:'prestige_5',        icon:'💠',  name:'五周目',     desc:'進入第5周目' },
  { key:'mult_2',            icon:'✌️',  name:'雙倍成長',   desc:'獎勵倍率達到×2.0' },
  { key:'mult_3',            icon:'🚀',  name:'三倍速成',   desc:'獎勵倍率達到×3.0' },
  // Easter eggs
  { key:'night_owl',         icon:'🦉',  name:'夜貓子',     desc:'在凌晨0–5點遊玩' },
  { key:'wash_while_rich',   icon:'🫧',  name:'富豪洗碗',   desc:'在擁有10,000籌碼時洗碗' },
];

// Upgrades — drop-only, no buy buttons
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

  zero() {
    if (!this.enabled) return;
    const c = this._getCtx(); if (!c) return;
    this._tone(120, 'sine', 0, 0.18, 0.12);
    this._tone(90, 'sine', 0.06, 0.22, 0.10);
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
  stats: {
    games: 0, wins: 0, bestWin: 0, streak: 0,
    totalEarned: 0,
    cardTypesBought: {},
    prevWasBig: false,
  },
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
  achievements: [],
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
      stats:   {
        ...state.stats,
        totalEarned: state.stats.totalEarned,
        cardTypesBought: { ...state.stats.cardTypesBought },
        prevWasBig: state.stats.prevWasBig,
      },
      // Strip internal _new flag before persisting
      deck: state.deck.map(({ _new, ...c }) => c),
      job: {
        upgrades:      { ...state.job.upgrades },
        totalWashed:   state.job.totalWashed,
        bankruptShown: state.job.bankruptShown,
      },
      prestige: { ...state.prestige },
      achievements: [...state.achievements],
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
      state.stats.totalEarned     = s.stats.totalEarned     ?? 0;
      state.stats.cardTypesBought = s.stats.cardTypesBought ?? {};
      state.stats.prevWasBig      = s.stats.prevWasBig      ?? false;
    }
    if (Array.isArray(s.deck)) {
      state.deck = s.deck;
      // Migrate old 'lose' deck cards
      state.deck.forEach(c => {
        if (c.outcome === 'lose') { c.outcome = 'zero'; c.amount = 0; }
      });
    }
    if (s.job) {
      state.job.upgrades      = s.job.upgrades      ?? {};
      state.job.totalWashed   = s.job.totalWashed   ?? 0;
      state.job.bankruptShown = s.job.bankruptShown ?? false;
    }
    if (s.prestige) {
      state.prestige.level      = s.prestige.level      ?? 0;
      state.prestige.multiplier = s.prestige.multiplier ?? 1.0;
    }
    state.achievements = s.achievements ?? [];
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
    updateBodyWealth();
  }
  state.balanceAF = requestAnimationFrame(tick);
}

function setBalanceInstant(v) {
  state.balance = v;
  $balance.textContent = v.toLocaleString();
  refreshUpgradeAvailability();
  updateGoalUI();
  updateBodyWealth();
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

// ── WEALTH BACKGROUND ────────────────────────────────────────────────────────

function updateBodyWealth() {
  const classes = ['wealth-debt','wealth-poor','wealth-medium','wealth-rich','wealth-goal'];
  classes.forEach(c => document.body.classList.remove(c));
  const b = state.balance;
  const goal = currentGoal();
  if (b <= 0) document.body.classList.add('wealth-debt');
  else if (b / goal < 0.2) document.body.classList.add('wealth-poor');
  else if (b / goal < 0.5) document.body.classList.add('wealth-medium');
  else if (b / goal < 0.9) document.body.classList.add('wealth-rich');
  else document.body.classList.add('wealth-goal');
}

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
    const row = document.createElement('div');
    row.className = `upgrade-item ${owned > 0 ? 'collected' : 'undiscovered'}`;
    row.dataset.key = u.key;
    const descText = u.type === 'click' ? `每次洗碗 +${u.effect}/次` : `+${u.effect}/秒`;
    row.innerHTML = `
      <div class="up-icon">${owned > 0 ? u.icon : '❓'}</div>
      <div class="up-info">
        <div class="up-name">${owned > 0 ? u.name : '神秘道具'}${owned > 1 ? `<span class="up-count">×${owned}</span>` : ''}</div>
        <div class="up-desc ${u.type}">${owned > 0 ? descText : '刮刮樂掉落'}</div>
      </div>
      <div class="up-level-badge">${owned > 0 ? `Lv${owned}` : '?'}</div>
    `;
    $upgradesList.appendChild(row);
  }
}

function refreshUpgradeAvailability() {}

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
      // Animate only the newest copy of the just-obtained upgrade
      if (u.key === popKey && i === display - 1) el.classList.add('pop-in');
      container.appendChild(el);
    }
  }
}

// ── UPGRADE DROP SYSTEM ───────────────────────────────────────────────────────

const DROP_RATES = { cheap:0.04, mid:0.07, deluxe:0.10, premium:0.14, elite:0.18, legend:0.23, mythic:0.28, divine:0.35 };
const MAX_UPGRADE_LEVEL = 10;

function rollUpgradeDrop(cardType) {
  const rate = DROP_RATES[cardType] || 0.05;
  if (Math.random() > rate) return null;
  const eligible = UPGRADES.filter(u => (state.job.upgrades[u.key] || 0) < MAX_UPGRADE_LEVEL);
  if (!eligible.length) return null;
  const undiscovered = eligible.filter(u => !state.job.upgrades[u.key]);
  const pool = undiscovered.length > 0 ? undiscovered : eligible;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showUpgradeDrop(u) {
  const banner = document.createElement('div');
  banner.className = 'upgrade-drop-banner';
  banner.innerHTML = `<span class="udb-icon">${u.icon}</span><span class="udb-text">獲得 <strong>${u.name}</strong>！ <span class="udb-sub">${u.type==='click'?`+${u.effect}/次`:`+${u.effect}/秒`}</span></span>`;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('visible'));
  setTimeout(() => {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 600);
  }, 2800);
}

// ── ACHIEVEMENT SYSTEM ────────────────────────────────────────────────────────

function checkAchievement(key) {
  if (!Array.isArray(state.achievements)) state.achievements = [];
  if (state.achievements.includes(key)) return;
  const ach = ACHIEVEMENTS.find(a => a.key === key);
  if (!ach) return;
  state.achievements.push(key);
  showAchievementToast(ach);
  saveState();
}

function showAchievementToast(ach) {
  const el = document.createElement('div');
  el.className = 'ach-toast';
  el.innerHTML = `<span class="ach-toast-icon">${ach.icon}</span><div><div class="ach-toast-title">成就解鎖</div><div class="ach-toast-name">${ach.name}</div></div>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 500);
  }, 3200);
}

function renderAchievements() {
  const grid = document.getElementById('ach-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const unlocked = state.achievements || [];
  for (const ach of ACHIEVEMENTS) {
    const done = unlocked.includes(ach.key);
    const el = document.createElement('div');
    el.className = `ach-item ${done ? 'done' : 'locked'}`;
    el.title = ach.desc;
    el.innerHTML = `<div class="ach-icon">${done ? ach.icon : '🔒'}</div><div class="ach-name">${done ? ach.name : '???'}</div>`;
    grid.appendChild(el);
  }
  const count = document.getElementById('ach-count');
  if (count) count.textContent = `${unlocked.length} / ${ACHIEVEMENTS.length}`;
}

function toggleAchievements() {
  const overlay = document.getElementById('ach-overlay');
  if (!overlay) return;
  const hidden = overlay.classList.toggle('hidden');
  if (!hidden) renderAchievements();
}

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
  const r = Math.random();
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
  if (cfg.unlockAt > state.prestige.level) return;
  if (state.balance < cfg.cost) {
    showModal('💸', '籌碼不足', `需要 ${cfg.cost} 籌碼才能購買「${cfg.label}」！\n試試打工區洗碗賺錢吧！`);
    return;
  }

  const prev = state.balance;
  state.balance -= cfg.cost;
  animateBalance(prev, state.balance);
  SFX.buy();
  saveState();

  // Particle emit from ticket list area
  const btn = document.querySelector(`#ticket-list .buy-btn[data-type="${type}"]`);
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

  state.stats.cardTypesBought[type] = (state.stats.cardTypesBought[type] || 0) + 1;
  const total = Object.values(state.stats.cardTypesBought).reduce((a,b) => a+b, 0);
  checkAchievement('first_card');
  if (total >= 10) checkAchievement('scratch_10');
  if (total >= 50) checkAchievement('scratch_50');
  if (total >= 100) checkAchievement('scratch_100');
  if (total >= 500) checkAchievement('scratch_500');
  if (state.deck.length >= 5) checkAchievement('deck_5');
  if (type === 'divine') checkAchievement('divine_scratch');
  const typesUnlocked = Object.keys(CARD_TYPES).filter(k => CARD_TYPES[k].unlockAt <= state.prestige.level);
  const typesBought = typesUnlocked.every(k => state.stats.cardTypesBought[k]);
  if (typesBought) checkAchievement('buy_all_types');

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
    if (!cfg) return;
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

function renderTicketList() {
  const list = document.getElementById('ticket-list');
  if (!list) return;
  list.innerHTML = '';
  for (const [type, cfg] of Object.entries(CARD_TYPES)) {
    const locked = cfg.unlockAt > state.prestige.level;
    const div = document.createElement('div');
    div.className = `ticket-option card-${type} ${locked ? 'locked-tier' : ''}`;
    div.innerHTML = `
      <div class="ticket-thumb">${locked ? '🔒' : cfg.icon}</div>
      <div class="ticket-name">${locked ? '???' : cfg.label}</div>
      <div class="ticket-price">${locked ? `第${cfg.unlockAt+1}周目解鎖` : cfg.cost.toLocaleString()+' 💰'}</div>
      ${locked ? '' : `<button class="buy-btn" data-type="${type}">購買</button>`}
    `;
    if (!locked) {
      div.querySelector('.buy-btn').addEventListener('click', () => buyCard(type));
    }
    list.appendChild(div);
  }
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

  const oc = OUTCOME_CFG[outcome] || OUTCOME_CFG.zero;

  const cardBgs = {
    cheap:   'linear-gradient(135deg,#1a1a2e,#2d3561)',
    mid:     'linear-gradient(135deg,#0a1628,#1d3557)',
    deluxe:  'linear-gradient(135deg,#2d1f4e,#4a3570)',
    premium: 'linear-gradient(135deg,#3b0764,#5d1f8f)',
    elite:   'linear-gradient(135deg,#1a1200,#3d2e00)',
    legend:  'linear-gradient(135deg,#1f0a00,#5c2000)',
    mythic:  'linear-gradient(135deg,#150030,#300050)',
    divine:  'linear-gradient(135deg,#2a1800,#5a3800)',
  };
  $cardResult.style.background = cardBgs[type] || cardBgs.cheap;

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

  const scratchColors = {
    cheap:   ['#8e8e8e','#d8d8d8','#b0b0b0','#d8d8d8','#8e8e8e'],
    mid:     ['#5a7fa8','#9abcdc','#7a9fc0','#9abcdc','#5a7fa8'],
    deluxe:  ['#7a4ab8','#c49aec','#9a6ad8','#c49aec','#7a4ab8'],
    premium: ['#9a30d8','#d070ff','#b050ef','#d070ff','#9a30d8'],
    elite:   ['#b87800','#f0c840','#d4a020','#f0c840','#b87800'],
    legend:  ['#d04000','#ff8040','#e86020','#ff8040','#d04000'],
    mythic:  ['#800080','#d060d0','#a040a0','#d060d0','#800080'],
    divine:  ['#c0a000','#fff080','#e0c840','#fff080','#c0a000'],
  };
  const cols = scratchColors[state.currentCard?.type] || scratchColors.cheap;
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   cols[0]);
  grad.addColorStop(0.28,cols[1]);
  grad.addColorStop(0.5, cols[2]);
  grad.addColorStop(0.72,cols[3]);
  grad.addColorStop(1,   cols[4]);
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

  const oc = OUTCOME_CFG[state.currentCard.outcome] || OUTCOME_CFG.zero;
  $cardResult.style.transition = 'box-shadow 0.5s ease';
  $cardResult.style.boxShadow  = `0 0 40px ${oc.glow}, 0 0 80px ${oc.glow}50`;

  applyReward();
  $backBtn.classList.remove('hidden');
}

function applyReward() {
  const { type, outcome, amount: rawAmount } = state.currentCard;

  // Remove this card from the desk
  state.deck = state.deck.filter(c => c.id !== state.currentCard.id);

  // Apply prestige multiplier only to positive winnings
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
      checkAchievement('first_jackpot');
      setTimeout(() => showJackpot(type), 1800);
    }
  } else {
    state.stats.streak = 0;
    updateStreakUI();
  }

  if (amount > 0) state.stats.totalEarned = (state.stats.totalEarned||0) + amount;

  checkAchievement('first_card'); // harmless dup guard
  if (outcome === 'zero') checkAchievement('first_zero');
  if (outcome === 'big' || outcome === 'small') {
    checkAchievement('first_win');
    if (state.balance < 100 + amount) checkAchievement('broke_win');
    if (String(amount).includes('7')) checkAchievement('lucky_7');
    if (String(amount).includes('777')) checkAchievement('lucky_777');
    if (state.balance >= currentGoal()) checkAchievement('first_goal');
    const tot = state.stats.totalEarned || 0;
    if (tot >= 50000) checkAchievement('earn_50k');
    if (tot >= 500000) checkAchievement('earn_500k');
    if (tot >= 5000000) checkAchievement('earn_5m');
  }
  if (outcome === 'big') {
    checkAchievement('first_big');
    if (type === 'divine') checkAchievement('divine_big');
    if (state.stats.prevWasBig) checkAchievement('back_to_back');
    state.stats.prevWasBig = true;
  } else {
    state.stats.prevWasBig = false;
  }
  if (state.stats.streak >= 3) checkAchievement('streak_3');
  if (state.balance >= 5000) checkAchievement('balance_5k');
  if (state.balance >= 20000) checkAchievement('balance_20k');
  if (state.balance >= 100000) checkAchievement('balance_100k');
  if (state.balance >= 1000000) checkAchievement('balance_1m');

  triggerEffects(outcome);
  saveState();

  if (state.balance === 0 && !state.job.bankruptShown) {
    state.job.bankruptShown = true;
    checkAchievement('first_broke');
    setTimeout(() => {
      SFX.bankrupt();
      showModal(
        '💔', '破產了！',
        '別擔心，到「💼 打工」分頁洗碗賺回籌碼吧！'
      );
    }, 900);
  }

  setTimeout(() => {
    const drop = rollUpgradeDrop(type);
    if (drop) {
      state.job.upgrades[drop.key] = (state.job.upgrades[drop.key] || 0) + 1;
      recalcJobStats();
      renderUpgrades();
      renderGear(drop.key);
      showUpgradeDrop(drop);
      SFX.upgrade();
      checkAchievement('first_drop');
      if (drop.type === 'click') checkAchievement('drop_click');
      if (drop.type === 'auto') { checkAchievement('drop_auto'); checkAchievement('first_autoearning'); }
      const allCollected = UPGRADES.every(u => state.job.upgrades[u.key] > 0);
      if (allCollected) checkAchievement('all_upgrades');
      const maxOwned = Math.max(...UPGRADES.map(u => state.job.upgrades[u.key]||0));
      if (maxOwned >= 3) checkAchievement('upgrade_3');
      if (maxOwned >= 5) checkAchievement('upgrade_5');
      saveState();
    }
  }, 1500);
}

function triggerEffects(outcome) {
  const rect = $canvas.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;

  switch (outcome) {
    case 'big':
      SFX.bigWin();
      flash('rgba(255,215,0,0.4)');
      setTimeout(() => flash('rgba(255,215,0,0.25)'), 200);
      Particles.emit('bigWin', cx, cy);
      break;
    case 'small':
      SFX.win();
      flash('rgba(74,222,128,0.18)');
      Particles.emit('win', cx, cy);
      break;
    case 'zero':
      SFX.zero();
      flash('rgba(80,80,120,0.35)');
      shakeCard();
      break;
    case 'lose':
      SFX.lose();
      flash('rgba(248,113,113,0.35)');
      flash('rgba(0,0,0,0.25)');
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

  // Check if user picked the highest multiplier chest
  const maxAmount = Math.max(...state.jackpotMultipliers.map(v => multiply(v)));
  if (amount === maxAmount) checkAchievement('jackpot_gold');

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

// ── WASH DISH ────────────────────────────────────────────────────────────────

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

  checkAchievement('first_wash');
  if (state.job.totalWashed >= 100) checkAchievement('wash_100');
  if (state.job.totalWashed >= 1000) checkAchievement('wash_1000');
  if (state.job.totalWashed >= 10000) checkAchievement('wash_10000');
  if (state.balance >= 10000) checkAchievement('wash_while_rich');
}

// Auto income tick — runs every second
setInterval(() => {
  if (state.job.autoIncome <= 0) return;
  state.balance += state.job.autoIncome;
  $balance.textContent = state.balance.toLocaleString();
  refreshUpgradeAvailability();
  updateStats();
  updateGoalUI();
  updateBodyWealth();
}, 1000);

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

  checkAchievement('first_prestige');
  if (state.prestige.level >= 3) checkAchievement('prestige_3');
  if (state.prestige.level >= 5) checkAchievement('prestige_5');
  if (state.prestige.multiplier >= 2.0) checkAchievement('mult_2');
  if (state.prestige.multiplier >= 3.0) checkAchievement('mult_3');
  if (state.prestige.level >= 1) checkAchievement('first_unlock');
  if (state.prestige.level >= 1) checkAchievement('unlock_elite');
  if (state.prestige.level >= 2) checkAchievement('unlock_myth');
  renderTicketList();

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
renderTicketList();
updateBodyWealth();

// Achievement button
document.getElementById('ach-btn').addEventListener('click', toggleAchievements);
document.getElementById('ach-overlay-close').addEventListener('click', toggleAchievements);

// Title easter egg
let titleClickCount = 0;
document.getElementById('app-title').addEventListener('click', () => {
  titleClickCount++;
  if (titleClickCount === 1) checkAchievement('title_click');
});

// Night owl check
const _initHour = new Date().getHours();
if (_initHour >= 0 && _initHour < 5) checkAchievement('night_owl');
