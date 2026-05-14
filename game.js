const CARD_TYPES = {
  cheap: {
    cost: 50,
    label: '基本款',
    minReward: -100,
    maxReward: 300,
    weights: [
      { outcome: 'lose',   range: [-100, -10], prob: 0.35 },
      { outcome: 'zero',   range: [0,   0],    prob: 0.30 },
      { outcome: 'small',  range: [10,  100],  prob: 0.25 },
      { outcome: 'big',    range: [101, 300],  prob: 0.10 },
    ],
  },
  mid: {
    cost: 150,
    label: '進階款',
    minReward: -200,
    maxReward: 800,
    weights: [
      { outcome: 'lose',   range: [-200, -20], prob: 0.35 },
      { outcome: 'zero',   range: [0,   0],    prob: 0.25 },
      { outcome: 'small',  range: [20,  300],  prob: 0.28 },
      { outcome: 'big',    range: [301, 800],  prob: 0.12 },
    ],
  },
  premium: {
    cost: 500,
    label: '豪華款',
    minReward: -500,
    maxReward: 3000,
    weights: [
      { outcome: 'lose',   range: [-500, -50], prob: 0.38 },
      { outcome: 'zero',   range: [0,   0],    prob: 0.20 },
      { outcome: 'small',  range: [50,  800],  prob: 0.28 },
      { outcome: 'big',    range: [801, 3000], prob: 0.14 },
    ],
  },
};

const CARD_BG = {
  cheap:   '#2d6a4f',
  mid:     '#1d3557',
  premium: '#6d2b8f',
};

const RESULT_DISPLAY = {
  lose:  { emoji: '😱', text: '扣錢！' },
  zero:  { emoji: '😐', text: '沒中獎' },
  small: { emoji: '🎉', text: '中獎！' },
  big:   { emoji: '🏆', text: '大獎！' },
};

let state = {
  balance: 1000,
  currentCard: null,
  scratchedPixels: 0,
  totalPixels: 0,
  revealed: false,
  isDrawing: false,
};

// DOM refs
const balanceEl     = document.getElementById('balance');
const shopSection   = document.getElementById('shop');
const scratchSection = document.getElementById('scratch-area');
const historyList   = document.getElementById('history-list');
const overlay       = document.getElementById('overlay');
const canvas        = document.getElementById('scratch-canvas');
const cardResult    = document.getElementById('card-result');
const ctx           = canvas.getContext('2d');

function updateBalance() {
  balanceEl.textContent = state.balance.toLocaleString();
}

function rollResult(type) {
  const cfg = CARD_TYPES[type];
  const r = Math.random();
  let cumulative = 0;
  let chosen = cfg.weights[cfg.weights.length - 1];
  for (const w of cfg.weights) {
    cumulative += w.prob;
    if (r < cumulative) { chosen = w; break; }
  }
  if (chosen.outcome === 'zero') return 0;
  const [min, max] = chosen.range;
  return Math.round(min + Math.random() * (max - min));
}

function buyCard(type) {
  const cfg = CARD_TYPES[type];
  if (state.balance < cfg.cost) {
    showModal('💸', '籌碼不足', `你需要 ${cfg.cost} 籌碼才能購買「${cfg.label}」！`);
    return;
  }
  state.balance -= cfg.cost;
  updateBalance();

  const reward = rollResult(type);
  state.currentCard = { type, reward };
  state.revealed = false;
  state.scratchedPixels = 0;

  showScratchArea(type, reward);
}

function showScratchArea(type, reward) {
  shopSection.classList.add('hidden');
  scratchSection.classList.remove('hidden');
  cardResult.classList.add('hidden');

  const W = canvas.parentElement.clientWidth;
  const H = Math.round(W * 0.5);
  canvas.width  = W;
  canvas.height = H;
  state.totalPixels = W * H;

  // Draw background (hidden prize layer)
  const resultEl    = document.getElementById('card-result');
  const bg = CARD_BG[type] || '#333';
  resultEl.style.background = bg;
  renderPrizeLayer(reward);
  cardResult.classList.remove('hidden');

  // Draw scratch layer on canvas
  ctx.clearRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#888');
  grad.addColorStop(1, '#aaa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Pattern text
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(W * 0.035)}px sans-serif`;
  for (let y = 20; y < H; y += 30) {
    for (let x = 0; x < W; x += 80) {
      ctx.fillText('刮刮樂 ✨', x + (y % 60 === 20 ? 0 : 40), y);
    }
  }
  ctx.globalAlpha = 1;

  // Instruction text
  ctx.fillStyle = '#555';
  ctx.font = `bold ${Math.round(W * 0.055)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('用手指刮開！', W / 2, H / 2);
  ctx.textAlign = 'left';

  attachScratchEvents();
}

function renderPrizeLayer(reward) {
  const type = state.currentCard.type;
  let outcome;
  if (reward < 0)       outcome = 'lose';
  else if (reward === 0) outcome = 'zero';
  else if (reward <= (type === 'premium' ? 800 : type === 'mid' ? 300 : 100)) outcome = 'small';
  else                  outcome = 'big';

  const d = RESULT_DISPLAY[outcome];
  document.getElementById('result-emoji').textContent = d.emoji;
  document.getElementById('result-text').textContent  = d.text;

  const amtEl = document.getElementById('result-amount');
  if (reward > 0) {
    amtEl.textContent = `+${reward} 籌碼`;
    amtEl.className = 'amount-win';
  } else if (reward < 0) {
    amtEl.textContent = `${reward} 籌碼`;
    amtEl.className = 'amount-lose';
  } else {
    amtEl.textContent = `無獎勵`;
    amtEl.className = 'amount-zero';
  }
}

// --- Scratch drawing ---

function getScratchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const src = e.touches ? e.touches[0] : e;
  return {
    x: (src.clientX - rect.left) * scaleX,
    y: (src.clientY - rect.top)  * scaleY,
  };
}

function scratchAt(x, y) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  checkRevealThreshold();
}

function checkRevealThreshold() {
  if (state.revealed) return;
  // Sample every 4th pixel for performance
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let transparent = 0;
  for (let i = 3; i < imageData.data.length; i += 16) {
    if (imageData.data[i] < 128) transparent++;
  }
  const ratio = transparent / (imageData.data.length / 16);
  if (ratio > 0.55) revealCard();
}

function revealCard() {
  if (state.revealed) return;
  state.revealed = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  applyReward();
}

function attachScratchEvents() {
  canvas.onmousedown = (e) => { state.isDrawing = true; scratchAt(...Object.values(getScratchPos(e))); };
  canvas.onmousemove = (e) => { if (state.isDrawing) scratchAt(...Object.values(getScratchPos(e))); };
  canvas.onmouseup   = () => { state.isDrawing = false; };
  canvas.onmouseleave = () => { state.isDrawing = false; };

  canvas.ontouchstart = (e) => { e.preventDefault(); state.isDrawing = true; scratchAt(...Object.values(getScratchPos(e))); };
  canvas.ontouchmove  = (e) => { e.preventDefault(); if (state.isDrawing) scratchAt(...Object.values(getScratchPos(e))); };
  canvas.ontouchend   = () => { state.isDrawing = false; };
}

function applyReward() {
  const { type, reward } = state.currentCard;
  const cfg = CARD_TYPES[type];
  state.balance += reward;
  if (state.balance < 0) state.balance = 0;
  updateBalance();
  addHistory(type, reward);

  if (state.balance === 0) {
    setTimeout(() => showModal('💔', '破產了！', '你的籌碼全部用完，遊戲結束。\n點擊繼續將重置遊戲。', true), 600);
  }
}

function addHistory(type, reward) {
  const cfg = CARD_TYPES[type];
  const empty = historyList.querySelector('.history-empty');
  if (empty) empty.remove();

  const li = document.createElement('li');
  let outcomeClass = reward > 0 ? 'win' : reward < 0 ? 'lose' : 'zero';
  li.className = `history-item ${outcomeClass}`;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

  const amtStr = reward > 0 ? `+${reward}` : `${reward}`;
  li.innerHTML = `
    <span>${cfg.label}</span>
    <span class="h-amount ${outcomeClass}">${amtStr} 籌碼</span>
    <span class="h-time">${timeStr}</span>
  `;
  historyList.prepend(li);
}

function showModal(emoji, title, msg, isGameOver = false) {
  document.getElementById('modal-emoji').textContent = emoji;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-msg').textContent   = msg;
  overlay.classList.remove('hidden');

  document.getElementById('modal-close').onclick = () => {
    overlay.classList.add('hidden');
    if (isGameOver) resetGame();
  };
}

function resetGame() {
  state.balance = 1000;
  state.currentCard = null;
  state.revealed = false;
  updateBalance();
  historyList.innerHTML = '<li class="history-empty">尚無購買記錄</li>';
  scratchSection.classList.add('hidden');
  shopSection.classList.remove('hidden');
}

// --- Button events ---

document.querySelectorAll('.buy-btn').forEach(btn => {
  btn.addEventListener('click', () => buyCard(btn.dataset.type));
});

document.getElementById('reveal-btn').addEventListener('click', () => {
  if (!state.revealed) revealCard();
});

document.getElementById('back-btn').addEventListener('click', () => {
  scratchSection.classList.add('hidden');
  shopSection.classList.remove('hidden');
  if (!state.revealed && state.currentCard) {
    // Penalize for abandoning unscratched card (reward already lost via cost)
    applyReward();
  }
});

updateBalance();
