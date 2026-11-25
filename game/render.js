// Chef's Rush — semua gambar digambar dari kode (canvas 2D, tanpa aset luar).
import { W, H, INGREDIENTS, BIN_ORDER, RECIPES, LEVELS, CUSTOMERS, COOK, UPGRADES, UPGRADE_MAX } from './config.js';
import { L, cookPct, targetOrder } from './world.js';

function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
function text(c, s, x, y, size, color, align = 'center', bold = true) {
  c.fillStyle = color; c.font = (bold ? 'bold ' : '') + size + 'px "Trebuchet MS", Verdana, sans-serif';
  c.textAlign = align; c.textBaseline = 'middle'; c.fillText(s, x, y);
}
function pill(c, x, y, w, h, fill, stroke) {
  rr(c, x, y, w, h, h / 2); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
}

// ---- Gambar makanan (ikon per bahan) ----
export function drawFood(c, item, x, y, s) {
  const u = s / 2;
  c.save(); c.translate(x, y);
  if (item === 'bun') {
    c.fillStyle = '#d98f2e'; rr(c, -u, -u * 0.1, s, u * 0.7, u * 0.3); c.fill();
    c.fillStyle = '#f2b95c'; c.beginPath(); c.arc(0, -u * 0.1, u, Math.PI, 0); c.fill();
    c.fillStyle = '#fff2cf';
    [[-0.4, -0.55], [0.1, -0.75], [0.45, -0.5]].forEach(p => { circle(c, p[0] * u, p[1] * u, u * 0.12); c.fill(); });
  } else if (item === 'patty') {
    c.fillStyle = '#6e3a1e'; circle(c, 0, 0, u * 0.95); c.fill();
    c.fillStyle = '#8a4b2a'; circle(c, 0, -u * 0.1, u * 0.8); c.fill();
    c.strokeStyle = '#5a2e16'; c.lineWidth = 2;
    [-0.4, 0, 0.4].forEach(o => { c.beginPath(); c.moveTo(o * u, -u * 0.6); c.lineTo(o * u, u * 0.55); c.stroke(); });
  } else if (item === 'lettuce') {
    c.fillStyle = '#3f9e4d';
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; circle(c, Math.cos(a) * u * 0.55, Math.sin(a) * u * 0.55, u * 0.45); c.fill(); }
    c.fillStyle = '#7ed491'; circle(c, 0, 0, u * 0.5); c.fill();
  } else if (item === 'tomato') {
    c.fillStyle = '#d8342a'; circle(c, 0, 0, u * 0.9); c.fill();
    c.fillStyle = '#f2604f'; circle(c, -u * 0.2, -u * 0.2, u * 0.55); c.fill();
    c.fillStyle = '#3f9e4d'; c.beginPath(); c.moveTo(0, -u * 0.9); c.lineTo(-u * 0.3, -u * 0.5); c.lineTo(u * 0.3, -u * 0.5); c.closePath(); c.fill();
  } else if (item === 'onion') {
    c.strokeStyle = '#c9a0d8'; c.lineWidth = u * 0.22;
    [0.85, 0.55, 0.28].forEach(r => { circle(c, 0, 0, u * r); c.stroke(); });
    c.fillStyle = '#e8d0f0'; circle(c, 0, 0, u * 0.16); c.fill();
  } else if (item === 'cheese') {
    c.fillStyle = '#f7c948'; c.beginPath(); c.moveTo(-u, u * 0.7); c.lineTo(u, u * 0.7); c.lineTo(0, -u * 0.8); c.closePath(); c.fill();
    c.fillStyle = '#e8a91e'; circle(c, -u * 0.2, u * 0.25, u * 0.14); c.fill(); circle(c, u * 0.25, u * 0.05, u * 0.11); c.fill();
  } else if (item === 'pickle') {
    c.fillStyle = '#6f9e3f'; c.beginPath(); c.ellipse(0, 0, u * 0.95, u * 0.55, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#9ccb6a';
    [[-0.45, -0.1], [0, 0.12], [0.45, -0.08]].forEach(p => { circle(c, p[0] * u, p[1] * u, u * 0.1); c.fill(); });
  } else if (item === 'chicken') {
    c.fillStyle = '#e8b04b'; circle(c, -u * 0.15, -u * 0.1, u * 0.7); c.fill();
    c.fillStyle = '#c98a2e'; circle(c, -u * 0.15, -u * 0.1, u * 0.45); c.fill();
    c.strokeStyle = '#f5e6c8'; c.lineWidth = u * 0.22; c.beginPath(); c.moveTo(u * 0.3, u * 0.3); c.lineTo(u * 0.8, u * 0.8); c.stroke();
    c.fillStyle = '#f5e6c8'; circle(c, u * 0.85, u * 0.85, u * 0.22); c.fill();
  } else if (item === 'fries') {
    c.fillStyle = '#d8342a'; rr(c, -u * 0.7, -u * 0.2, u * 1.4, u * 0.9, u * 0.15); c.fill();
    c.strokeStyle = '#f2c14e'; c.lineWidth = u * 0.28;
    [-0.4, 0, 0.4].forEach(o => { c.beginPath(); c.moveTo(o * u, -u * 0.2); c.lineTo(o * u, -u * 0.95); c.stroke(); });
  } else if (item === 'egg') {
    c.fillStyle = '#ffffff'; circle(c, 0, 0, u * 0.95); c.fill();
    c.fillStyle = '#f7c948'; circle(c, 0, 0, u * 0.5); c.fill();
    c.fillStyle = '#e8a91e'; circle(c, 0, 0, u * 0.3); c.fill();
  } else if (item === 'bread') {
    c.fillStyle = '#e8b96a'; rr(c, -u * 0.85, -u * 0.85, u * 1.7, u * 1.7, u * 0.3); c.fill();
    c.fillStyle = '#f7e3b0'; rr(c, -u * 0.65, -u * 0.65, u * 1.3, u * 1.3, u * 0.2); c.fill();
  }
  c.restore();
}

// ---- Wajah pelanggan ----
export function drawFace(c, custIdx, x, y, r, mood) {
  const cust = CUSTOMERS[custIdx];
  c.save(); c.translate(x, y);
  // baju
  c.fillStyle = cust.shirt; rr(c, -r * 1.05, r * 0.75, r * 2.1, r * 0.85, r * 0.3); c.fill();
  // kepala
  c.fillStyle = cust.skin; circle(c, 0, 0, r); c.fill();
  // rambut / topi
  c.fillStyle = cust.hair;
  if (cust.style === 'long') {
    c.beginPath(); c.arc(0, -r * 0.15, r * 1.05, Math.PI, 0); c.fill();
    rr(c, -r * 1.05, -r * 0.2, r * 0.45, r * 1.5, r * 0.2); c.fill();
    rr(c, r * 0.6, -r * 0.2, r * 0.45, r * 1.5, r * 0.2); c.fill();
  } else if (cust.style === 'cap') {
    c.beginPath(); c.arc(0, -r * 0.2, r * 1.02, Math.PI, 0); c.fill();
    rr(c, -r * 1.05, -r * 0.35, r * 2.1, r * 0.3, r * 0.15); c.fill();
    c.fillStyle = '#f7c948'; circle(c, 0, -r * 0.35, r * 0.18); c.fill();
  } else if (cust.style === 'bun') {
    c.beginPath(); c.arc(0, -r * 0.2, r * 1.0, Math.PI, 0); c.fill();
    circle(c, 0, -r * 1.05, r * 0.42); c.fill();
  } else if (cust.style === 'bob') {
    c.beginPath(); c.arc(0, -r * 0.1, r * 1.05, Math.PI * 0.95, Math.PI * 2.05); c.fill();
    rr(c, -r * 1.05, -r * 0.3, r * 0.4, r * 0.9, r * 0.2); c.fill();
    rr(c, r * 0.65, -r * 0.3, r * 0.4, r * 0.9, r * 0.2); c.fill();
  } else if (cust.style === 'chef') {
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, -r * 0.55, r * 0.55, Math.PI, 0); c.fill();
    circle(c, -r * 0.5, -r * 0.5, r * 0.32); c.fill(); circle(c, r * 0.5, -r * 0.5, r * 0.32); c.fill();
    rr(c, -r * 0.85, -r * 0.55, r * 1.7, r * 0.3, r * 0.12); c.fill();
  } else {
    c.beginPath(); c.arc(0, -r * 0.25, r * 1.0, Math.PI, 0); c.fill();
  }
  // mata
  c.fillStyle = '#221610';
  const ey = -r * 0.05;
  if (mood === 'angry') {
    c.strokeStyle = '#221610'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(-r * 0.55, ey - r * 0.18); c.lineTo(-r * 0.15, ey - r * 0.02); c.stroke();
    c.beginPath(); c.moveTo(r * 0.55, ey - r * 0.18); c.lineTo(r * 0.15, ey - r * 0.02); c.stroke();
  } else {
    circle(c, -r * 0.35, ey, r * 0.11); c.fill(); circle(c, r * 0.35, ey, r * 0.11); c.fill();
  }
  // pipi & mulut
  c.fillStyle = 'rgba(232,120,110,0.45)';
  circle(c, -r * 0.55, r * 0.3, r * 0.14); c.fill(); circle(c, r * 0.55, r * 0.3, r * 0.14); c.fill();
  c.strokeStyle = '#7a3b26'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath();
  if (mood === 'happy') { c.arc(0, r * 0.28, r * 0.42, Math.PI * 0.15, Math.PI * 0.85); }
  else if (mood === 'angry') { c.arc(0, r * 0.75, r * 0.35, Math.PI * 1.2, Math.PI * 1.8); }
  else { c.moveTo(-r * 0.3, r * 0.5); c.lineTo(r * 0.3, r * 0.5); }
  c.stroke();
  c.restore();
}

// ---- Latar dapur ----
function drawBackground(c, g) {
  // dinding
  const wall = c.createLinearGradient(0, 0, 0, 200);
  wall.addColorStop(0, '#f7e8c8'); wall.addColorStop(1, '#e8cfa0');
  c.fillStyle = wall; c.fillRect(0, 0, W, 200);
  // jendela (ruang pelanggan di kejauhan)
  c.fillStyle = '#9ecfee'; rr(c, 560, 18, 160, 90, 8); c.fill();
  c.fillStyle = '#e8f6ff'; circle(c, 600, 42, 14); c.fill(); circle(c, 620, 48, 10); c.fill();
  c.fillStyle = '#7fb069'; c.beginPath(); c.moveTo(560, 108); c.lineTo(720, 108); c.lineTo(700, 84); c.lineTo(580, 84); c.closePath(); c.fill();
  c.strokeStyle = '#8a5a2e'; c.lineWidth = 5; rr(c, 560, 18, 160, 90, 8); c.stroke();
  c.beginPath(); c.moveTo(640, 18); c.lineTo(640, 108); c.moveTo(560, 63); c.lineTo(720, 63); c.stroke();
  // lantai ubin
  c.fillStyle = '#d8c49a'; c.fillRect(0, 200, W, H - 200);
  c.fillStyle = '#cdb586';
  for (let y = 200; y < H; y += 56) for (let x = ((y / 56) % 2 ? 28 : 0); x < W; x += 56) {
    c.beginPath(); c.moveTo(x + 28, y); c.lineTo(x + 56, y + 28); c.lineTo(x + 28, y + 56); c.lineTo(x, y + 28); c.closePath(); c.fill();
  }
  // karpet merah di bawah meja
  c.fillStyle = '#a83232'; rr(c, 196, 690, 820, 22, 6); c.fill();
  c.fillStyle = '#c85050'; rr(c, 206, 694, 800, 14, 4); c.fill();
}

// ---- Bar atas ----
function drawTopBar(c, g) {
  const b = L.top;
  const grad = c.createLinearGradient(0, 0, 0, 60);
  grad.addColorStop(0, '#5a3418'); grad.addColorStop(1, '#3a2110');
  c.fillStyle = grad; c.fillRect(b.x, b.y, b.w, b.h);
  // logo
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(36, 26, 15, Math.PI, 0); c.fill();
  circle(c, 22, 24, 8); c.fill(); circle(c, 50, 24, 8); c.fill();
  c.fillStyle = '#ffffff'; rr(c, 20, 26, 32, 8, 3); c.fill();
  text(c, "CHEF'S RUSH", 62, 24, 22, '#ffd76a', 'left');
  text(c, 'KITCHEN MASTER', 62, 44, 10, '#f7e8c8', 'left');
  if (g.level) {
    pill(c, 268, 14, 92, 32, '#2b1a10', '#ffd76a');
    text(c, 'LEVEL ' + g.levelN, 314, 31, 15, '#ffd76a');
  }
  // timer
  if (g.screen === 'playing' || g.screen === 'paused') {
    const m = Math.floor(g.timeLeft / 60), s = Math.floor(g.timeLeft % 60);
    pill(c, 380, 12, 150, 36, g.timeLeft < 30 ? '#7a1e1e' : '#2b1a10', '#ffffff');
    text(c, (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s, 455, 31, 20, '#ffffff');
    const frac = g.level ? g.timeLeft / g.level.shift : 0;
    c.fillStyle = frac < 0.2 ? '#e2483d' : '#58b368';
    rr(c, 392, 42, 126 * frac, 5, 2); c.fill();
  }
  // koin & skor
  circle(c, 580, 30, 15); c.fillStyle = '#f7c948'; c.fill();
  c.strokeStyle = '#c98a2e'; c.lineWidth = 2; c.stroke();
  text(c, '$', 580, 31, 18, '#8a5a2e');
  text(c, String(g.save.coins + (g.screen === 'playing' ? g.coinsEarned : 0)), 602, 31, 18, '#ffd76a', 'left');
  text(c, 'SKOR ' + g.score, 760, 31, 18, '#ffffff', 'left');
  // bintang progres
  if (g.level) {
    for (let i = 0; i < 3; i++) {
      const th = [g.level.target, g.level.star2, g.level.star3][i];
      const got = g.score >= th;
      drawStar(c, 900 + i * 34, 30, 13, got ? '#ffd76a' : '#5a4a38');
    }
  }
  // tombol mute & pause
  pill(c, L.muteBtn.x, L.muteBtn.y, L.muteBtn.w, L.muteBtn.h, '#2b1a10', '#ffffff');
  text(c, g.save.muted ? '✕' : '♪', L.muteBtn.x + 18, L.muteBtn.y + 21, 18, '#ffffff');
  pill(c, L.pauseBtn.x, L.pauseBtn.y, L.pauseBtn.w, L.pauseBtn.h, '#2b1a10', '#ffffff');
  text(c, g.screen === 'paused' ? '▶' : '❚❚', L.pauseBtn.x + 18, L.pauseBtn.y + 21, 15, '#ffffff');
}
function drawStar(c, x, y, r, color) {
  c.fillStyle = color; c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rad = i % 2 ? r * 0.45 : r;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath(); c.fill();
}


// ---- Rel pelanggan (kiri) ----
function drawLeftRail(c, g) {
  c.fillStyle = '#3a2110'; c.fillRect(L.railL.x, L.railL.y, L.railL.w, L.railL.h);
  c.fillStyle = '#5a3418'; c.fillRect(L.railL.x, L.railL.y, L.railL.w, 34);
  text(c, 'PELANGGAN', 98, L.railL.y + 18, 15, '#ffd76a');
  for (let i = 0; i < 3; i++) {
    const y = L.railL.y + 44 + i * 210;
    rr(c, 10, y, 176, 196, 12); c.fillStyle = i % 2 ? '#4a2c14' : '#54331a'; c.fill();
    c.strokeStyle = '#8a5a2e'; c.lineWidth = 2; c.stroke();
    const o = g.orders[i];
    if (!o) {
      text(c, '— kosong —', 98, y + 98, 14, '#a08060', 'center', false);
      continue;
    }
    const cust = CUSTOMERS[o.cust];
    const frac = Math.max(0, o.patience / o.maxPatience);
    const bob = o.animT > 0 ? Math.sin(o.animT * 14) * 4 : 0;
    drawFace(c, o.cust, 98, y + 62 + bob, 42, o.mood);
    text(c, cust.name, 98, y + 128, 16, '#ffffff');
    // bar kesabaran
    rr(c, 28, y + 146, 140, 12, 6); c.fillStyle = '#221610'; c.fill();
    c.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#f7c948' : '#e2483d';
    rr(c, 28, y + 146, 140 * frac, 12, 6); c.fill();
    text(c, RECIPES[o.recipeId].name, 98, y + 176, 12, '#ffd76a', 'center', false);
  }
}

// ---- Bin bahan ----
function drawBins(c, g) {
  for (const b of L.bins) {
    const ing = INGREDIENTS[b.id];
    const stock = g.stocks[b.id];
    const empty = stock <= 0;
    // nampan baja
    const grad = c.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    grad.addColorStop(0, '#d8dce2'); grad.addColorStop(1, '#9aa0a8');
    rr(c, b.x, b.y, b.w, b.h, 8); c.fillStyle = grad; c.fill();
    c.strokeStyle = '#6a7076'; c.lineWidth = 2; c.stroke();
    if (empty) { c.fillStyle = 'rgba(40,30,20,0.45)'; rr(c, b.x, b.y, b.w, b.h, 8); c.fill(); }
    drawFood(c, b.id, b.x + b.w / 2, b.y + 30, 40);
    // label + stok
    pill(c, b.x + 4, b.y + b.h - 20, b.w - 8, 16, 'rgba(20,12,6,0.85)');
    text(c, ing.name.toUpperCase(), b.x + b.w / 2, b.y + b.h - 11, 9, '#ffffff');
    if (stock < ing.maxStock) {
      pill(c, b.x + b.w - 20, b.y + 2, 18, 16, '#7a1e1e');
      text(c, String(stock), b.x + b.w - 11, b.y + 11, 11, '#ffffff');
    }
    if (g.held && g.held.kind === 'item' && g.held.item === b.id && g.held.quality === 'raw') {
      c.strokeStyle = '#ffd76a'; c.lineWidth = 3; rr(c, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 10); c.stroke();
    }
  }
}

// ---- Stasiun masak ----
function cookBar(c, x, y, w, pct) {
  rr(c, x, y, w, 10, 5); c.fillStyle = '#221610'; c.fill();
  let col = '#58b368';
  if (pct < 26) col = '#9aa0a8'; else if (pct <= 70) col = '#f7c948';
  else if (pct <= 90) col = '#58b368'; else if (pct <= 100) col = '#e8862e'; else col = '#3a3a3a';
  c.fillStyle = col; rr(c, x, y, w * Math.min(1, pct / 100), 10, 5); c.fill();
  if (pct > 90 && pct <= 100) { text(c, 'ANGKAT!', x + w / 2, y - 8, 11, '#e8862e'); }
  if (pct > 100) { text(c, 'GOSONG!', x + w / 2, y - 8, 11, '#e2483d'); }
}
function drawFlame(c, x, y, t, s) {
  const f = 0.7 + 0.3 * Math.sin(t * 9 + x);
  c.fillStyle = 'rgba(232,120,40,0.9)';
  c.beginPath(); c.moveTo(x - 9 * s * f, y); c.quadraticCurveTo(x - 4 * s, y - 22 * s * f, x, y - 30 * s * f);
  c.quadraticCurveTo(x + 4 * s, y - 22 * s * f, x + 9 * s * f, y); c.closePath(); c.fill();
  c.fillStyle = 'rgba(247,201,72,0.95)';
  c.beginPath(); c.moveTo(x - 5 * s * f, y); c.quadraticCurveTo(x - 2 * s, y - 12 * s * f, x, y - 18 * s * f);
  c.quadraticCurveTo(x + 2 * s, y - 12 * s * f, x + 5 * s * f, y); c.closePath(); c.fill();
}
function drawStations(c, g) {
  // --- Talenan ---
  const ch = L.chop;
  rr(c, ch.x, ch.y, ch.w, ch.h, 12); c.fillStyle = '#8a5a2e'; c.fill();
  c.strokeStyle = '#5a3418'; c.lineWidth = 3; c.stroke();
  text(c, 'TALENAN', ch.x + ch.w / 2, ch.y + 18, 14, '#ffd76a');
  // papan kayu
  rr(c, ch.x + 18, ch.y + 36, ch.w - 36, 92, 8); c.fillStyle = '#d8a860'; c.fill();
  c.strokeStyle = '#a87c3e'; c.lineWidth = 2; c.stroke();
  if (g.chop) {
    drawFood(c, g.chop.item, ch.x + ch.w / 2 - 30, ch.y + 82, 52);
    // pisau
    c.save(); c.translate(ch.x + ch.w / 2 + 52, ch.y + 82); c.rotate(-0.5 + Math.sin(g.time * 20) * 0.08);
    c.fillStyle = '#d8dce2'; rr(c, -8, -26, 16, 52, 4); c.fill();
    c.fillStyle = '#3a2110'; rr(c, -6, 26, 12, 22, 4); c.fill(); c.restore();
    const p = (g.chop.clicks / COOK.chopClicks) * 100;
    cookBar(c, ch.x + 40, ch.y + 140, ch.w - 80, p);
    text(c, 'Klik untuk memotong!', ch.x + ch.w / 2, ch.y + 128, 11, '#ffffff', 'center', false);
  } else {
    text(c, 'Taruh selada / tomat / bawang', ch.x + ch.w / 2, ch.y + 82, 12, '#f7e8c8', 'center', false);
  }
  // --- Wajan ---
  const fr = L.fry;
  rr(c, fr.x, fr.y, fr.w, fr.h, 12); c.fillStyle = '#5a5f66'; c.fill();
  c.strokeStyle = '#3a3d42'; c.lineWidth = 3; c.stroke();
  text(c, 'WAJAN', fr.x + fr.w / 2, fr.y + 18, 14, '#ffd76a');
  for (let i = 0; i < 2; i++) {
    const sx = fr.x + 34 + i * 128, sy = fr.y + 52;
    c.fillStyle = '#2e3134'; circle(c, sx + 42, sy + 34, 42); c.fill();
    c.strokeStyle = '#8a8f96'; c.lineWidth = 3; c.stroke();
    const slot = g.fry[i];
    if (slot) {
      drawFood(c, slot.item, sx + 42, sy + 34, 52);
      const pct = cookPct(g, slot, 'fry');
      cookBar(c, sx, sy + 86, 84, pct);
      if (pct > 100) { c.fillStyle = 'rgba(60,60,60,0.5)'; circle(c, sx + 42, sy + 34, 30); c.fill(); }
      if (pct >= 26 && pct <= 100) {
        c.fillStyle = 'rgba(255,255,255,0.7)';
        circle(c, sx + 30 + Math.sin(g.time * 6 + i) * 6, sy + 10, 3); c.fill();
        circle(c, sx + 55 + Math.cos(g.time * 5 + i) * 6, sy + 4, 2.5); c.fill();
      }
    } else {
      text(c, 'kosong', sx + 42, sy + 34, 12, '#9aa0a8', 'center', false);
    }
  }
  text(c, 'Ayam • Kentang • Telur', fr.x + fr.w / 2, fr.y + 150, 11, '#d8dce2', 'center', false);
  // --- Panggangan ---
  const gr = L.grill;
  rr(c, gr.x, gr.y, gr.w, gr.h, 12); c.fillStyle = '#4a2c14'; c.fill();
  c.strokeStyle = '#2e1a08'; c.lineWidth = 3; c.stroke();
  text(c, 'PANGGANGAN', gr.x + gr.w / 2, gr.y + 18, 14, '#ffd76a');
  for (let i = 0; i < 2; i++) {
    const sx = gr.x + 34 + i * 128, sy = gr.y + 52;
    // bara
    c.fillStyle = '#1e1208'; rr(c, sx, sy, 84, 68, 8); c.fill();
    c.fillStyle = '#e2483d';
    for (let k = 0; k < 4; k++) { circle(c, sx + 12 + k * 20, sy + 56, 6); c.fill(); }
    // jeruji
    c.strokeStyle = '#8a8f96'; c.lineWidth = 3;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(sx + 4, sy + 12 + k * 14); c.lineTo(sx + 80, sy + 12 + k * 14); c.stroke(); }
    const slot = g.grill[i];
    if (slot) {
      const pct = cookPct(g, slot, 'grill');
      if (pct >= 26 && pct <= 100) { drawFlame(c, sx + 20, sy + 66, g.time, 0.8); drawFlame(c, sx + 64, sy + 66, g.time + 1, 0.7); }
      drawFood(c, slot.item, sx + 42, sy + 34, 52);
      cookBar(c, sx, sy + 86, 84, pct);
      if (pct > 100) { c.fillStyle = 'rgba(60,60,60,0.5)'; circle(c, sx + 42, sy + 34, 30); c.fill(); }
    } else {
      text(c, 'kosong', sx + 42, sy + 34, 12, '#9aa0a8', 'center', false);
    }
  }
  text(c, 'Patty • Ayam', gr.x + gr.w / 2, gr.y + 150, 11, '#d8dce2', 'center', false);
}

// ---- Papan rakitan ----
function drawBoard(c, g) {
  const b = L.board;
  const shake = g.shakeT > 0 ? Math.sin(g.time * 40) * 4 : 0;
  c.save(); c.translate(shake, 0);
  rr(c, b.x, b.y, b.w, b.h, 12); c.fillStyle = '#8a5a2e'; c.fill();
  c.strokeStyle = '#5a3418'; c.lineWidth = 3; c.stroke();
  text(c, 'PAPAN RAKITAN', b.x + b.w / 2, b.y + 18, 14, '#ffd76a');
  // papan kayu
  rr(c, b.x + 16, b.y + 34, b.w - 32, 108, 8); c.fillStyle = '#d8a860'; c.fill();
  c.strokeStyle = '#a87c3e'; c.lineWidth = 2; c.stroke();
  // tumpukan layer
  if (g.board.length === 0) {
    text(c, 'Klik bahan sesuai resep', b.x + b.w / 2, b.y + 88, 13, '#8a5a2e', 'center', false);
  } else {
    const n = g.board.length;
    g.board.forEach((layer, i) => {
      const ly = b.y + 128 - i * 7;
      const lx = b.x + b.w / 2;
      drawFood(c, layer.item, lx, ly, 44 - Math.min(10, i * 2));
      if (layer.quality === 'burnt') { text(c, '✕ gosong', lx + 60, ly, 11, '#e2483d', 'left'); }
      else if (layer.quality === 'perfect') { text(c, '★', lx + 60, ly, 13, '#ffd76a', 'left'); }
    });
  }
  // strip resep target
  const order = targetOrder(g);
  if (order) {
    const recipe = RECIPES[order.recipeId];
    text(c, 'Resep: ' + recipe.name, b.x + b.w / 2, b.y + 162, 13, '#ffffff');
    const total = recipe.layers.length;
    const startX = b.x + b.w / 2 - (total * 34) / 2;
    recipe.layers.forEach((layer, i) => {
      const x = startX + i * 34 + 17, y = b.y + 188;
      const done = i < g.board.length;
      const next = i === g.board.length;
      if (next) { c.fillStyle = 'rgba(255,215,106,0.35)'; circle(c, x, y, 17); c.fill(); }
      c.globalAlpha = done ? 1 : 0.55;
      drawFood(c, layer.item, x, y, 26);
      c.globalAlpha = 1;
      if (done) { text(c, '✓', x + 10, y - 10, 12, '#58b368'); }
      if (next) { text(c, '▼', x, y - 20, 10, '#ffd76a'); }
    });
  } else {
    text(c, 'Menunggu pesanan…', b.x + b.w / 2, b.y + 180, 13, '#f7e8c8', 'center', false);
  }
  c.restore();
}

// ---- Piring & sampah ----
function drawPlates(c, g) {
  const p = L.plates;
  rr(c, p.x, p.y, p.w, p.h, 12); c.fillStyle = '#5a3418'; c.fill();
  c.strokeStyle = '#3a2110'; c.lineWidth = 3; c.stroke();
  text(c, 'PIRING', p.x + p.w / 2, p.y + 18, 14, '#ffd76a');
  for (let i = 0; i < g.plates.length; i++) {
    const x = p.x + 52 + i * 84, y = p.y + 84;
    c.fillStyle = '#f5f0e6'; circle(c, x, y, 40); c.fill();
    c.strokeStyle = '#c8bfa8'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#e8e0cc'; circle(c, x, y, 26); c.fill();
    const dish = g.plates[i];
    if (dish) {
      const recipe = RECIPES[dish.recipeId];
      // gambar mini hidangan: tumpuk 3 layer teratas
      const layers = recipe.layers.slice(-3);
      layers.forEach((layer, k) => drawFood(c, layer.item, x, y - k * 6, 30));
      if (dish.burnt) text(c, 'gosong', x, y + 52, 11, '#e2483d');
      else if (dish.perfect) text(c, '★ perfect', x, y + 52, 11, '#ffd76a');
      else text(c, recipe.name, x, y + 52, 10, '#ffffff', 'center', false);
    }
  }
  text(c, 'Klik piring untuk mengambil', p.x + p.w / 2, p.y + 188, 11, '#f7e8c8', 'center', false);
  // tempat sampah
  const t = L.trash;
  rr(c, t.x, t.y, t.w, t.h, 12); c.fillStyle = '#3a3d42'; c.fill();
  c.strokeStyle = '#22242a'; c.lineWidth = 3; c.stroke();
  c.fillStyle = '#5a5f66'; rr(c, t.x + 12, t.y + 24, t.w - 24, 120, 8); c.fill();
  text(c, 'SAMPAH', t.x + t.w / 2, t.y + 18, 12, '#ffffff');
  text(c, 'Buang bahan', t.x + t.w / 2, t.y + 160, 11, '#d8dce2', 'center', false);
  text(c, 'gosong di sini', t.x + t.w / 2, t.y + 176, 11, '#d8dce2', 'center', false);
}

// ---- Tombol SERVE ----
function drawServe(c, g) {
  const s = L.serve;
  const ready = g.plates.some(d => d && g.orders.some(o => o.recipeId === d.recipeId));
  const pulse = ready ? 1 + 0.03 * Math.sin(g.time * 6) : 1;
  c.save(); c.translate(s.x + s.w / 2, s.y + s.h / 2); c.scale(pulse, pulse); c.translate(-(s.x + s.w / 2), -(s.y + s.h / 2));
  const grad = c.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
  if (ready) { grad.addColorStop(0, '#58b368'); grad.addColorStop(1, '#2e7d32'); }
  else { grad.addColorStop(0, '#6a7076'); grad.addColorStop(1, '#4a4f55'); }
  rr(c, s.x, s.y, s.w, s.h, 16); c.fillStyle = grad; c.fill();
  c.strokeStyle = ready ? '#ffd76a' : '#8a8f96'; c.lineWidth = 3; c.stroke();
  // lonceng
  c.fillStyle = '#ffd76a'; c.beginPath(); c.arc(s.x + 52, s.y + 40, 16, Math.PI, 0); c.fill();
  rr(c, s.x + 34, s.y + 40, 36, 6, 3); c.fill();
  circle(c, s.x + 52, s.y + 52, 4); c.fill();
  text(c, 'SERVE', s.x + s.w / 2 + 20, s.y + 42, 34, '#ffffff');
  c.restore();
  text(c, 'Sajikan hidangan yang cocok dengan pesanan', s.x + s.w / 2, s.y + s.h + 16, 12, '#c9a06a', 'center', false);
}

// ---- Order board (kanan) ----
function drawOrderBoard(c, g) {
  c.fillStyle = '#3a2110'; c.fillRect(L.railR.x, L.railR.y, L.railR.w, L.railR.h);
  c.fillStyle = '#5a3418'; c.fillRect(L.railR.x, L.railR.y, L.railR.w, 34);
  text(c, 'ORDER BOARD', L.railR.x + 132, L.railR.y + 18, 15, '#ffd76a');
  for (let i = 0; i < 3; i++) {
    const y = L.railR.y + 44 + i * 210;
    const o = g.orders[i];
    rr(c, L.railR.x + 10, y, 244, 196, 12);
    c.fillStyle = o ? '#f7e8c8' : '#4a2c14'; c.fill();
    if (o) {
      const selected = g.targetOrderId === o.id;
      c.strokeStyle = selected ? '#ffd76a' : '#8a5a2e'; c.lineWidth = selected ? 4 : 2; c.stroke();
      const recipe = RECIPES[o.recipeId];
      const frac = Math.max(0, o.patience / o.maxPatience);
      text(c, 'PESANAN #' + String(o.id).padStart(2, '0'), L.railR.x + 132, y + 18, 13, '#8a5a2e');
      drawFood(c, recipe.layers[3] ? recipe.layers[3].item : recipe.layers[0].item, L.railR.x + 40, y + 52, 44);
      text(c, recipe.name, L.railR.x + 132, y + 52, 15, '#3a2110', 'left');
      text(c, 'Hadiah: ' + o.reward + ' koin', L.railR.x + 132, y + 74, 12, '#8a5a2e', 'left', false);
      // daftar bahan
      recipe.layers.forEach((layer, k) => {
        const x = L.railR.x + 30 + k * 34, yy = y + 106;
        drawFood(c, layer.item, x, yy, 26);
      });
      text(c, 'Urutan: ' + recipe.layers.map(l => INGREDIENTS[l.item].name).join(' → '), L.railR.x + 132, y + 132, 10, '#5a3418', 'center', false);
      // bar kesabaran
      rr(c, L.railR.x + 26, y + 150, 212, 12, 6); c.fillStyle = '#221610'; c.fill();
      c.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#f7c948' : '#e2483d';
      rr(c, L.railR.x + 26, y + 150, 212 * frac, 12, 6); c.fill();
      text(c, 'Kesabaran ' + Math.ceil(frac * 100) + '%', L.railR.x + 132, y + 172, 11, '#5a3418', 'center', false);
      if (selected) { pill(c, L.railR.x + 92, y + 184, 80, 0, 'transparent'); text(c, '● DIRAKIT', L.railR.x + 132, y + 186, 11, '#2e7d32'); }
    } else {
      c.strokeStyle = '#8a5a2e'; c.lineWidth = 2; c.stroke();
      text(c, '— menunggu —', L.railR.x + 132, y + 98, 14, '#a08060', 'center', false);
    }
  }
}

// ---- Layar-layar ----
function overlay(c, alpha) { c.fillStyle = 'rgba(20,12,6,' + alpha + ')'; c.fillRect(0, 0, W, H); }
function drawMenu(c, g) {
  overlay(c, 0.55);
  // papan judul kayu
  rr(c, 340, 130, 600, 150, 18); c.fillStyle = '#5a3418'; c.fill();
  c.strokeStyle = '#ffd76a'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(400, 168, 26, Math.PI, 0); c.fill();
  circle(c, 376, 164, 13); c.fill(); circle(c, 424, 164, 13); c.fill();
  rr(c, 372, 168, 56, 12, 5); c.fill();
  text(c, "CHEF'S RUSH", 640, 190, 52, '#ffd76a');
  text(c, 'KITCHEN MASTER', 640, 240, 24, '#f7e8c8');
  text(c, 'Terima pesanan • Potong • Goreng • Panggang • Rakit • Sajikan!', 640, 320, 18, '#ffffff', 'center', false);
  text(c, 'Klik MAIN untuk mulai. P = jeda, M = suara.', 640, 348, 15, '#c9a06a', 'center', false);
  // tombol main
  pill(c, 490, 400, 300, 70, '#58b368', '#ffd76a');
  text(c, '▶  MAIN', 640, 436, 30, '#ffffff');
  pill(c, 490, 490, 300, 56, '#3a2110', '#ffffff');
  text(c, 'PILIH LEVEL', 640, 519, 20, '#ffffff');
  text(c, 'Koin: ' + g.save.coins + '   •   Level terbuka: ' + g.save.unlocked + '/10', 640, 590, 15, '#ffd76a', 'center', false);
}
function drawSelect(c, g) {
  overlay(c, 0.55);
  text(c, 'PILIH LEVEL', 640, 90, 34, '#ffd76a');
  LEVELS.forEach((lv, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 190 + col * 190, y = 140 + row * 200;
    const locked = lv.n > g.save.unlocked;
    rr(c, x, y, 170, 180, 14); c.fillStyle = locked ? '#3a3d42' : '#5a3418'; c.fill();
    c.strokeStyle = locked ? '#6a7076' : '#ffd76a'; c.lineWidth = 3; c.stroke();
    if (locked) {
      text(c, '🔒', x + 85, y + 70, 40, '#9aa0a8');
      text(c, 'LEVEL ' + lv.n, x + 85, y + 120, 16, '#9aa0a8');
    } else {
      text(c, 'LEVEL ' + lv.n, x + 85, y + 34, 17, '#ffd76a');
      text(c, lv.name, x + 85, y + 62, 13, '#ffffff', 'center', false);
      text(c, 'Target: ' + lv.target, x + 85, y + 92, 12, '#f7e8c8', 'center', false);
      text(c, 'Waktu: ' + Math.floor(lv.shift / 60) + ':' + String(lv.shift % 60).padStart(2, '0'), x + 85, y + 114, 12, '#f7e8c8', 'center', false);
      const st = g.save.stars[lv.n] || 0;
      for (let k = 0; k < 3; k++) drawStar(c, x + 55 + k * 30, y + 148, 11, k < st ? '#ffd76a' : '#5a4a38');
    }
  });
  pill(c, 490, 600, 300, 56, '#3a2110', '#ffffff');
  text(c, '← KEMBALI', 640, 629, 18, '#ffffff');
}
function drawPaused(c, g) {
  overlay(c, 0.6);
  text(c, 'JEDA', 640, 300, 48, '#ffd76a');
  text(c, 'Tekan P atau klik untuk lanjut', 640, 360, 18, '#ffffff', 'center', false);
  pill(c, 490, 400, 300, 60, '#58b368', '#ffd76a');
  text(c, '▶  LANJUT', 640, 431, 24, '#ffffff');
}
function drawEnd(c, g, win) {
  overlay(c, 0.62);
  text(c, win ? 'LEVEL SELESAI!' : 'WAKTU HABIS', 640, 130, 44, win ? '#ffd76a' : '#e2483d');
  for (let i = 0; i < 3; i++) {
    drawStar(c, 550 + i * 90, 210, 34, i < g.stars ? '#ffd76a' : '#5a4a38');
  }
  text(c, 'Skor: ' + g.score + '  (target ' + g.level.target + ')', 640, 280, 20, '#ffffff');
  text(c, 'Koin didapat: +' + g.coinsEarned + '   •   Total koin: ' + g.save.coins, 640, 312, 16, '#ffd76a', 'center', false);
  if (win) {
    text(c, 'TOKO UPGRADE — klik untuk membeli', 640, 360, 16, '#ffffff');
  }
  pill(c, 340, 600, 220, 56, '#58b368', '#ffd76a');
  text(c, win ? 'LEVEL BERIKUTNYA ▶' : 'COBA LAGI', 450, 629, 18, '#ffffff');
  pill(c, 720, 600, 220, 56, '#3a2110', '#ffffff');
  text(c, 'MENU', 830, 629, 18, '#ffffff');
}
function drawShop(c, g) {
  // dipanggil di layar complete, di bawah skor
  UPGRADES.forEach((up, i) => {
    const x = 340 + i * 220, y = 400;
    const lvl = g.save.upgrades[up.id] || 0;
    const cost = up.base * (lvl + 1);
    const maxed = lvl >= UPGRADE_MAX;
    const afford = !maxed && g.save.coins >= cost;
    rr(c, x, y, 200, 130, 12); c.fillStyle = '#5a3418'; c.fill();
    c.strokeStyle = afford ? '#ffd76a' : '#8a5a2e'; c.lineWidth = 2; c.stroke();
    text(c, up.name, x + 100, y + 26, 15, '#ffffff');
    text(c, up.desc, x + 100, y + 52, 11, '#f7e8c8', 'center', false);
    text(c, 'Lv ' + lvl + '/' + UPGRADE_MAX, x + 100, y + 76, 12, '#ffd76a');
    text(c, maxed ? 'MAKS' : 'Beli: ' + cost + ' koin', x + 100, y + 104, 13, afford ? '#58b368' : '#e2483d');
  });
}

// ---- Barang di tangan (ikut kursor) ----
function drawHeld(c, g, mx, my) {
  if (!g.held || mx == null) return;
  c.save(); c.globalAlpha = 0.95;
  if (g.held.kind === 'dish') {
    const recipe = RECIPES[g.held.recipeId];
    c.fillStyle = '#f5f0e6'; circle(c, mx, my, 26); c.fill();
    c.strokeStyle = '#c8bfa8'; c.lineWidth = 2; c.stroke();
    recipe.layers.slice(-2).forEach((layer, k) => drawFood(c, layer.item, mx, my - k * 5, 26));
    text(c, recipe.name, mx, my + 40, 11, '#ffffff');
  } else {
    drawFood(c, g.held.item, mx, my, 44);
    const label = INGREDIENTS[g.held.item].name + (g.held.process !== 'raw' ? ' (' + g.held.process + ')' : '');
    pill(c, mx - 52, my + 26, 104, 20, 'rgba(20,12,6,0.85)');
    text(c, label, mx, my + 37, 10, '#ffffff');
    if (g.held.quality === 'burnt') text(c, 'GOSONG', mx, my - 30, 11, '#e2483d');
    else if (g.held.quality === 'perfect') text(c, '★ PERFECT', mx, my - 30, 11, '#ffd76a');
  }
  c.restore();
}

// ---- Entry utama ----
export function render(c, g, mx, my) {
  c.clearRect(0, 0, W, H);
  drawBackground(c, g);
  drawTopBar(c, g);
  if (g.screen === 'menu') { drawMenu(c, g); return; }
  if (g.screen === 'select') { drawSelect(c, g); return; }
  drawLeftRail(c, g);
  drawBins(c, g);
  drawStations(c, g);
  drawBoard(c, g);
  drawPlates(c, g);
  drawServe(c, g);
  drawOrderBoard(c, g);
  // partikel
  for (const p of g.particles) {
    c.globalAlpha = Math.max(0, p.t / p.max);
    c.fillStyle = p.color; circle(c, p.x, p.y, p.r); c.fill();
  }
  c.globalAlpha = 1;
  drawHeld(c, g, mx, my);
  if (g.toast) {
    pill(c, W / 2 - 260, 668, 520, 34, 'rgba(20,12,6,0.88)', '#ffd76a');
    text(c, g.toast.text, W / 2, 686, 14, '#ffffff');
  }
  if (g.screen === 'paused') drawPaused(c, g);
  if (g.screen === 'complete') { drawEnd(c, g, true); drawShop(c, g); }
  if (g.screen === 'gameover') drawEnd(c, g, false);
}
