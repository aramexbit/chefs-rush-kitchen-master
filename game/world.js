// Chef's Rush: Kitchen Master — state & aturan main.
// Semua logika gameplay: pesanan, memasak, merakit, menyajikan, skor, ekonomi.

import { W, H, INGREDIENTS, BIN_ORDER, CHOP_ITEMS, FRY_ITEMS, GRILL_ITEMS,
  RECIPES, LEVELS, COOK, SCORE, UPGRADES, UPGRADE_MAX, CUSTOMERS, SAVE_KEY } from './config.js';

// ---- Layout (dipakai render.js & input.js juga) ----
export const L = {
  top: { x: 0, y: 0, w: 1280, h: 60 },
  railL: { x: 0, y: 60, w: 196, h: 660 },
  railR: { x: 1016, y: 60, w: 264, h: 660 },
  bins: BIN_ORDER.map((id, i) => ({ id, x: 204 + i * 74, y: 76, w: 70, h: 72 })),
  chop: { x: 204, y: 168, w: 257, h: 162 },
  fry: { x: 477, y: 168, w: 257, h: 162 },
  grill: { x: 750, y: 168, w: 257, h: 162 },
  board: { x: 204, y: 350, w: 416, h: 210 },
  plates: { x: 636, y: 350, w: 264, h: 210 },
  trash: { x: 920, y: 350, w: 87, h: 210 },
  serve: { x: 420, y: 580, w: 440, h: 80 },
  pauseBtn: { x: 1196, y: 10, w: 36, h: 40 },
  muteBtn: { x: 1152, y: 10, w: 36, h: 40 },
};

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* abaikan */ }
  return { unlocked: 1, stars: {}, coins: 0, upgrades: {}, muted: false };
}
export function storeSave(s) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch (e) { /* abaikan */ }
}

export function createGame() {
  const save = loadSave();
  return {
    screen: 'menu',           // menu | select | playing | paused | complete | gameover
    save,
    level: null,              // LEVELS[n-1] saat bermain
    levelN: 1,
    timeLeft: 0,
    score: 0,
    combo: 0,
    coinsEarned: 0,
    held: null,               // { item, process, quality } | { dish, recipeId, burnt, perfect }
    orders: [],               // { id, recipeId, cust, patience, maxPatience, reward }
    nextOrderId: 1,
    spawnT: 2,
    board: [],                // layers yang sudah ditaruh: { item, process, quality }
    targetOrderId: null,      // pesanan yang sedang dirakit
    chop: null,               // { item, clicks }
    fry: [null, null],        // { item, t }
    grill: [null, null],      // { item, t }
    plates: [null, null, null],
    stocks: Object.fromEntries(BIN_ORDER.map(id => [id, INGREDIENTS[id].stock])),
    restockT: COOK.restockEvery,
    toast: null,              // { text, t }
    fx: null,                 // nama sfx yang diminta aksi terakhir (dibaca loop utama)
    particles: [],
    shakeT: 0,
    stars: 0,
    time: 0,
  };
}

export function upgradeLevel(g, id) { return g.save.upgrades[id] || 0; }
export function cookTime(g, kind) {
  const base = kind === 'grill' ? COOK.grillTime : COOK.fryTime;
  return base * (1 - 0.20 * upgradeLevel(g, 'speed'));
}
export function plateCount(g) { return 3 + upgradeLevel(g, 'plates'); }
export function patienceOf(g, level) { return level.patience * (1 + 0.25 * upgradeLevel(g, 'patience')); }

export function startLevel(g, n) {
  const level = LEVELS[n - 1];
  g.level = level; g.levelN = n;
  g.timeLeft = level.shift;
  g.score = 0; g.combo = 0; g.coinsEarned = 0;
  g.held = null; g.orders = []; g.nextOrderId = 1; g.spawnT = 2;
  g.board = []; g.targetOrderId = null;
  g.chop = null; g.fry = [null, null]; g.grill = [null, null];
  g.plates = Array.from({ length: plateCount(g) }, () => null);
  g.stocks = Object.fromEntries(BIN_ORDER.map(id => [id, INGREDIENTS[id].stock]));
  g.restockT = COOK.restockEvery;
  g.toast = null; g.particles = []; g.shakeT = 0; g.stars = 0;
  g.screen = 'playing';
}

function qualityAt(pct) {
  if (pct < 26) return 'raw';
  if (pct <= 70) return 'good';
  if (pct <= 90) return 'perfect';
  if (pct <= 100) return 'good';
  return 'burnt';
}
export function cookPct(g, slot, kind) {
  if (!slot) return 0;
  return (slot.t / cookTime(g, kind)) * 100;
}

function pickCustomer(g) {
  const used = new Set(g.orders.map(o => o.cust));
  const free = CUSTOMERS.map((c, i) => i).filter(i => !used.has(i));
  const pool = free.length ? free : CUSTOMERS.map((c, i) => i);
  return pool[Math.floor(Math.random() * pool.length)];
}
function spawnOrder(g) {
  const dishes = g.level.dishes;
  const recipeId = dishes[Math.floor(Math.random() * dishes.length)];
  const maxP = patienceOf(g, g.level);
  const order = {
    id: g.nextOrderId++, recipeId,
    cust: pickCustomer(g),
    patience: maxP, maxPatience: maxP,
    reward: RECIPES[recipeId].price,
    mood: 'happy', animT: 0,
  };
  g.orders.push(order);
  if (!g.targetOrderId) g.targetOrderId = order.id;
  g.fx = 'pop';
  return order;
}
export function targetOrder(g) {
  return g.orders.find(o => o.id === g.targetOrderId) || g.orders[0] || null;
}

export function setToast(g, text) { g.toast = { text, t: 1.8 }; }

function burst(g, x, y, color, n = 10) {
  for (let i = 0; i < n; i++) {
    g.particles.push({ x, y, vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 70,
      t: 0.6 + Math.random() * 0.4, max: 1, color, r: 2 + Math.random() * 3 });
  }
}

export function update(g, dt) {
  g.time += dt;
  if (g.screen !== 'playing') return;
  g.timeLeft -= dt;
  if (g.timeLeft <= 0) { g.timeLeft = 0; endLevel(g); return; }

  // spawn pesanan
  g.spawnT -= dt;
  if (g.spawnT <= 0) {
    g.spawnT = g.level.spawnEvery;
    if (g.orders.length < 3) spawnOrder(g);
  }
  // kesabaran pelanggan
  for (const o of [...g.orders]) {
    o.patience -= dt;
    o.mood = o.patience / o.maxPatience > 0.5 ? 'happy' : o.patience / o.maxPatience > 0.25 ? 'neutral' : 'angry';
    if (o.animT > 0) o.animT -= dt;
    if (o.patience <= 0) {
      g.orders = g.orders.filter(x => x.id !== o.id);
      g.score = Math.max(0, g.score + SCORE.orderFailed);
      g.combo = 0;
      setToast(g, `${CUSTOMERS[o.cust].name} pergi! Pesanan gagal (-50)`);
      if (g.targetOrderId === o.id) g.targetOrderId = g.orders[0] ? g.orders[0].id : null;
    }
  }
  // masak
  for (const slot of [...g.fry, ...g.grill]) {
    if (slot) slot.t += dt;
  }
  // restock bahan
  g.restockT -= dt;
  if (g.restockT <= 0) {
    g.restockT = COOK.restockEvery;
    for (const id of BIN_ORDER) if (g.stocks[id] < INGREDIENTS[id].maxStock) g.stocks[id]++;
  }
  // partikel & toast & shake
  for (const p of g.particles) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 20 * dt; }
  g.particles = g.particles.filter(p => p.t > 0);
  if (g.toast) { g.toast.t -= dt; if (g.toast.t <= 0) g.toast = null; }
  if (g.shakeT > 0) g.shakeT -= dt;
}

function endLevel(g) {
  const lv = g.level;
  const stars = g.score >= lv.star3 ? 3 : g.score >= lv.star2 ? 2 : g.score >= lv.target ? 1 : 0;
  g.stars = stars;
  if (stars >= 1) {
    g.screen = 'complete';
    g.fx = 'win';
    g.save.stars[g.levelN] = Math.max(g.save.stars[g.levelN] || 0, stars);
    g.save.unlocked = Math.max(g.save.unlocked, Math.min(10, g.levelN + 1));
    g.save.coins += g.coinsEarned;
    storeSave(g.save);
  } else {
    g.screen = 'gameover';
    g.fx = 'lose';
  }
}

// ---- Aksi pemain (dipanggil input.js) ----

export function clickBin(g, id) {
  if (g.screen !== 'playing') return;
  if (!g.held) {
    if (g.stocks[id] <= 0) { setToast(g, `${INGREDIENTS[id].name} habis! Tunggu restock.`); return; }
    g.stocks[id]--;
    g.held = { item: id, process: INGREDIENTS[id].process === 'raw' ? 'raw' : 'raw', quality: 'raw', kind: 'item' };
    g.fx = 'pick';
  } else if (g.held.kind === 'item' && g.held.item === id && g.held.quality === 'raw') {
    // kembalikan bahan mentah ke bin-nya
    g.stocks[id] = Math.min(INGREDIENTS[id].maxStock, g.stocks[id] + 1);
    g.held = null;
  } else {
    setToast(g, 'Tangan penuh — letakkan dulu atau buang ke tempat sampah.');
  }
}

export function clickChop(g) {
  if (g.screen !== 'playing') return;
  if (!g.chop) {
    if (g.held && g.held.kind === 'item' && CHOP_ITEMS.includes(g.held.item) && g.held.quality === 'raw') {
      g.chop = { item: g.held.item, clicks: 0 };
      g.held = null;
    } else if (g.held) {
      setToast(g, 'Yang bisa dipotong: selada, tomat, bawang.');
    }
    return;
  }
  g.chop.clicks++;
  g.fx = 'chop';
  burst(g, L.chop.x + L.chop.w / 2, L.chop.y + 90, '#ffffff', 4);
  if (g.chop.clicks >= COOK.chopClicks) {
    g.held = { item: g.chop.item, process: 'chop', quality: 'good', kind: 'item' };
    g.chop = null;
    g.fx = 'ding';
    setToast(g, 'Selesai dipotong!');
  }
}

function clickCookSlot(g, arr, kind, i) {
  if (g.screen !== 'playing') return;
  const slot = arr[i];
  if (!slot) {
    const items = kind === 'grill' ? GRILL_ITEMS : FRY_ITEMS;
    if (g.held && g.held.kind === 'item' && items.includes(g.held.item) && g.held.quality === 'raw') {
      arr[i] = { item: g.held.item, t: 0 };
      g.held = null;
      g.fx = 'place';
    } else if (g.held) {
      setToast(g, kind === 'grill' ? 'Panggangan untuk patty & ayam.' : 'Wajan untuk ayam, kentang & telur.');
    }
    return;
  }
  const pct = cookPct(g, slot, kind);
  const q = qualityAt(pct);
  g.held = { item: slot.item, process: kind, quality: q, kind: 'item' };
  arr[i] = null;
  g.fx = q === 'burnt' ? 'error' : q === 'perfect' ? 'ding' : 'pick';
  if (q === 'burnt') setToast(g, 'Gosong! Buang ke tempat sampah.');
  else if (q === 'perfect') setToast(g, 'Perfect! Pas waktunya.');
}

export function clickFry(g, i) { clickCookSlot(g, g.fry, 'fry', i); }
export function clickGrill(g, i) { clickCookSlot(g, g.grill, 'grill', i); }

export function clickBoard(g) {
  if (g.screen !== 'playing') return;
  const order = targetOrder(g);
  if (!order) { setToast(g, 'Belum ada pesanan.'); return; }
  const recipe = RECIPES[order.recipeId];
  if (g.held && g.held.kind === 'item') {
    const next = recipe.layers[g.board.length];
    if (!next) return;
    if (g.held.item === next.item && g.held.process === next.process) {
      g.board.push({ item: g.held.item, process: g.held.process, quality: g.held.quality });
      g.held = null;
      g.fx = 'place';
      burst(g, L.board.x + L.board.w / 2, L.board.y + 110, '#ffd76a', 8);
      if (g.board.length === recipe.layers.length) {
        const free = g.plates.findIndex(p => !p);
        if (free >= 0) {
          const burnt = g.board.some(l => l.quality === 'burnt');
          const perfect = g.board.every(l => l.quality === 'perfect' || l.quality === 'good') && g.board.some(l => l.quality === 'perfect');
          g.plates[free] = { recipeId: order.recipeId, burnt, perfect };
          g.board = [];
          g.fx = 'ding';
          setToast(g, `${recipe.name} siap! Tekan SERVE.`);
        } else {
          setToast(g, 'Piring penuh! Sajikan dulu yang sudah jadi.');
        }
      }
    } else {
      g.score = Math.max(0, g.score + SCORE.wrongItem);
      g.shakeT = 0.35;
      g.fx = 'error';
      const need = INGREDIENTS[next.item].name;
      const procName = next.process === 'chop' ? 'dipotong' : next.process === 'grill' ? 'dipanggang' : next.process === 'fry' ? 'digoreng' : 'mentah';
      setToast(g, `Salah! Berikutnya: ${need} (${procName}). -15`);
    }
    return;
  }
  // tangan kosong: ambil kembali layer terakhir
  if (g.board.length > 0 && !g.held) {
    const last = g.board.pop();
    g.held = { item: last.item, process: last.process, quality: last.quality, kind: 'item' };
  }
}

export function clickPlate(g, i) {
  if (g.screen !== 'playing') return;
  const dish = g.plates[i];
  if (!dish) return;
  if (!g.held) {
    g.held = { dish: true, recipeId: dish.recipeId, burnt: dish.burnt, perfect: dish.perfect, kind: 'dish' };
    g.plates[i] = null;
  }
}

export function clickTrash(g) {
  if (g.screen !== 'playing') return;
  if (g.held) { g.held = null; setToast(g, 'Dibuang.'); }
}

export function clickServe(g) {
  if (g.screen !== 'playing') return;
  // cari piring yang cocok dengan pesanan aktif
  let plateIdx = -1, order = null;
  for (let i = 0; i < g.plates.length; i++) {
    const d = g.plates[i];
    if (!d) continue;
    const o = g.orders.find(x => x.recipeId === d.recipeId);
    if (o) { plateIdx = i; order = o; break; }
  }
  if (plateIdx < 0 || !order) {
    setToast(g, 'Tidak ada hidangan yang cocok dengan pesanan.');
    return;
  }
  const dish = g.plates[plateIdx];
  g.plates[plateIdx] = null;
  g.orders = g.orders.filter(x => x.id !== order.id);
  const cust = CUSTOMERS[order.cust];
  const patienceLeft = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(order.reward * 0.5 * patienceLeft);
  let pts = SCORE.base;
  if (dish.perfect) pts += SCORE.allPerfect;
  if (dish.burnt) pts += SCORE.burnt;
  pts += Math.round(SCORE.speedMax * patienceLeft);
  g.combo += 1;
  pts += Math.min(100, SCORE.combo * g.combo);
  g.score += pts;
  g.coinsEarned += order.reward + tip;
  g.fx = 'coin';
  burst(g, L.serve.x + L.serve.w / 2, L.serve.y, '#ffd76a', 16);
  setToast(g, `${cust.name} senang! +${pts} poin, +${order.reward + tip} koin${tip > 0 ? ` (tip ${tip})` : ''}`);
  if (g.targetOrderId === order.id) g.targetOrderId = g.orders[0] ? g.orders[0].id : null;
}

export function selectOrder(g, orderId) {
  if (g.screen !== 'playing') return;
  if (g.orders.some(o => o.id === orderId)) g.targetOrderId = orderId;
}

export function buyUpgrade(g, id) {
  const up = UPGRADES.find(u => u.id === id);
  if (!up) return false;
  const lvl = upgradeLevel(g, id);
  if (lvl >= UPGRADE_MAX) return false;
  const cost = up.base * (lvl + 1);
  if (g.save.coins < cost) return false;
  g.save.coins -= cost;
  g.save.upgrades[id] = lvl + 1;
  storeSave(g.save);
  return true;
}

export function togglePause(g) {
  if (g.screen === 'playing') g.screen = 'paused';
  else if (g.screen === 'paused') g.screen = 'playing';
}
