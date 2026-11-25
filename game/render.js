// Chef's Rush — semua gambar digambar dari kode (canvas 2D, tanpa aset luar).
import { W, H, INGREDIENTS, BIN_ORDER, RECIPES, LEVELS, CUSTOMERS, COOK, UPGRADES, UPGRADE_MAX } from './config.js?v=13';
import { L, cookPct, targetOrder } from './world.js?v=13';

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
// campur dua warna hex (t 0..1) — untuk perubahan warna saat dimasak
function mix(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  const pa = [1, 3, 5].map(i => parseInt(a.substr(i, 2), 16));
  const pb = [1, 3, 5].map(i => parseInt(b.substr(i, 2), 16));
  const m = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return 'rgb(' + m[0] + ',' + m[1] + ',' + m[2] + ')';
}
// petakan quality ('raw'|'good'|'perfect'|'burnt') ke persen masak
function qPct(q) { return q === 'raw' ? 8 : q === 'perfect' ? 85 : q === 'burnt' ? 115 : 60; }
// uap/asap naik dari makanan panas
function drawSteam(c, x, y, t, n, color) {
  c.save();
  for (let i = 0; i < n; i++) {
    const ph = (t * 0.6 + i / n) % 1;
    const sy = y - ph * 26;
    const sx = x + Math.sin(ph * 6 + i * 2.2) * 6;
    c.globalAlpha = (1 - ph) * 0.45;
    c.fillStyle = color || '#ffffff';
    circle(c, sx, sy, 3 + ph * 5); c.fill();
  }
  c.restore();
}
// garis panggangan (grill mark) di atas patty/ayam
function grillMarks(c, x, y, r) {
  c.save();
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
  c.strokeStyle = 'rgba(40,18,8,0.5)'; c.lineWidth = 4;
  [-0.5, 0, 0.5].forEach(o => {
    c.beginPath(); c.moveTo(x + o * r - r * 0.4, y - r); c.lineTo(x + o * r + r * 0.4, y + r); c.stroke();
  });
  c.restore();
}

// ---- Gaya glossy ala referensi (panel mengilap, bayangan, kilau) ----
// panel mengilap: bayangan jatuh + gradien + kilau atas
function glossPanel(c, x, y, w, h, r, c1, c2, border) {
  c.save();
  c.fillStyle = 'rgba(20,10,4,0.35)';
  rr(c, x + 2, y + 4, w, h, r); c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  rr(c, x, y, w, h, r); c.fillStyle = g; c.fill();
  if (border) { c.strokeStyle = border; c.lineWidth = 2.5; c.stroke(); }
  // kilau atas (lebih kuat — lebih mengkilat)
  c.fillStyle = 'rgba(255,255,255,0.32)';
  rr(c, x + 6, y + 3, w - 12, h * 0.28, r * 0.7); c.fill();
  // garis terang di tepi atas panel
  c.fillStyle = 'rgba(255,255,255,0.5)';
  rr(c, x + 8, y + 2, w - 16, 2, 1); c.fill();
  c.restore();
}
// plang kayu kecil untuk judul stasiun (menumpang di tepi atas panel)
function plaque(c, x, y, w, label) {
  const h = 30;
  c.save();
  c.fillStyle = 'rgba(20,10,4,0.35)';
  rr(c, x + 2, y + 3, w, h, 12); c.fill();
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#FFB43B'); g.addColorStop(1, '#e8912a');
  rr(c, x, y, w, h, 12); c.fillStyle = g; c.fill();
  c.strokeStyle = '#b96f1e'; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.25)';
  rr(c, x + 6, y + 3, w - 12, 7, 4); c.fill();
  text(c, label, x + w / 2, y + h / 2 + 1, 14, '#653719');
  c.restore();
}
// ledakan bintang (sunburst) untuk sudut tiket — lebih besar dari sparkle
function starburst(c, x, y, r, t) {
  const rot = Math.sin(t * 1.5 + x) * 0.15;
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#FFD84A';
  for (let k = 0; k < 8; k++) {
    const a = k * Math.PI / 4;
    c.beginPath();
    c.moveTo(Math.cos(a - 0.18) * r * 0.4, Math.sin(a - 0.18) * r * 0.4);
    c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    c.lineTo(Math.cos(a + 0.18) * r * 0.4, Math.sin(a + 0.18) * r * 0.4);
    c.closePath(); c.fill();
  }
  c.fillStyle = '#fff3a0'; circle(c, 0, 0, r * 0.45); c.fill();
  c.restore();
}
// topi koki kecil (untuk kartu kosong)
function drawChefHat(c, x, y, s) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#ffffff';
  c.beginPath(); c.arc(0, -s * 0.15, s * 0.55, Math.PI, 0); c.fill();
  circle(c, -s * 0.45, -s * 0.1, s * 0.3); c.fill();
  circle(c, s * 0.45, -s * 0.1, s * 0.3); c.fill();
  rr(c, -s * 0.8, s * 0.05, s * 1.6, s * 0.35, s * 0.1); c.fill();
  c.restore();
}
// kilau bintang 4 sisi (sparkle) — berdenyut dengan waktu
function sparkle(c, x, y, s, t) {
  const p = 0.7 + 0.3 * Math.sin(t * 5 + x);
  c.save(); c.translate(x, y); c.scale(p, p);
  c.fillStyle = '#ffe98a';
  c.beginPath();
  c.moveTo(0, -s); c.quadraticCurveTo(s * 0.25, -s * 0.25, s, 0);
  c.quadraticCurveTo(s * 0.25, s * 0.25, 0, s);
  c.quadraticCurveTo(-s * 0.25, s * 0.25, -s, 0);
  c.quadraticCurveTo(-s * 0.25, -s * 0.25, 0, -s);
  c.fill();
  c.restore();
}
// daun hijau untuk dekorasi
function drawLeaf(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = '#36C957';
  c.beginPath(); c.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#1f9e3a';
  c.beginPath(); c.ellipse(-s * 0.2, s * 0.1, s * 0.7, s * 0.25, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}
// botol saus kecil
function drawSauceBottle(c, x, y, s, body, cap) {
  c.save(); c.translate(x, y);
  c.fillStyle = cap; rr(c, -s * 0.22, -s, s * 0.44, s * 0.35, s * 0.08); c.fill();
  c.fillStyle = body; rr(c, -s * 0.38, -s * 0.65, s * 0.76, s * 0.65, s * 0.14); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)'; rr(c, -s * 0.28, -s * 0.55, s * 0.14, s * 0.5, s * 0.06); c.fill();
  c.restore();
}
// tanaman kecil dalam pot
function drawPlant(c, x, y, s) {
  c.save(); c.translate(x, y);
  c.fillStyle = '#c96a5a'; rr(c, -s * 0.4, -s * 0.1, s * 0.8, s * 0.5, s * 0.08); c.fill();
  c.fillStyle = '#b05548'; rr(c, -s * 0.45, -s * 0.22, s * 0.9, s * 0.18, s * 0.06); c.fill();
  drawLeaf(c, 0, -s * 0.45, s * 0.4, -0.5);
  drawLeaf(c, -s * 0.25, -s * 0.35, s * 0.35, -1.1);
  drawLeaf(c, s * 0.25, -s * 0.35, s * 0.35, 0.6);
  c.restore();
}
// burger besar di atas piring (dekorasi meja)
function drawBurgerDeco(c, x, y, s) {
  c.save(); c.translate(x, y);
  // bayangan + piring
  c.fillStyle = 'rgba(20,10,4,0.25)';
  c.beginPath(); c.ellipse(0, s * 0.3, s * 0.85, s * 0.16, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#ffffff';
  c.beginPath(); c.ellipse(0, s * 0.24, s * 0.8, s * 0.18, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e8e0cc';
  c.beginPath(); c.ellipse(0, s * 0.22, s * 0.6, s * 0.13, 0, 0, Math.PI * 2); c.fill();
  // tumpukan burger (bawah ke atas, tiap lapis mengintip)
  c.fillStyle = '#e8a33c'; rr(c, -s * 0.5, s * 0.1, s, s * 0.16, s * 0.06); c.fill();
  drawFood(c, 'patty', 0, s * 0.06, s * 1.05, 85);
  drawFood(c, 'cheese', 0, -s * 0.02, s * 1.0, 85);
  drawFood(c, 'lettuce', 0, -s * 0.08, s * 1.0);
  drawFood(c, 'tomato', 0, -s * 0.14, s * 0.85);
  // roti atas (kubah + wijen)
  c.fillStyle = '#e8a33c'; c.beginPath(); c.arc(0, -s * 0.1, s * 0.52, Math.PI, 0); c.fill();
  c.fillStyle = '#ffc95e'; c.beginPath(); c.arc(-s * 0.1, -s * 0.22, s * 0.3, Math.PI, 0); c.fill();
  c.fillStyle = '#fff2cf';
  [[-0.25, -0.42], [0.05, -0.55], [0.3, -0.4]].forEach(pt => { circle(c, pt[0] * s, pt[1] * s, s * 0.05); c.fill(); });
  c.restore();
}

// ---- Gambar makanan (ikon per bahan) ----
// pct = persen masak (0 mentah, 71-90 perfect, >100 gosong). Tanpa pct = mentah.
export function drawFood(c, item, x, y, s, pct) {
  const u = s / 2;
  const p = pct == null ? 0 : pct;
  c.save(); c.translate(x, y);
  if (item === 'bun') {
    const toasted = p >= 60;
    c.fillStyle = toasted ? '#b96f1e' : '#e8a33c'; rr(c, -u, -u * 0.1, s, u * 0.7, u * 0.3); c.fill();
    c.fillStyle = toasted ? '#e8a33c' : '#ffc95e'; c.beginPath(); c.arc(0, -u * 0.1, u, Math.PI, 0); c.fill();
    if (toasted) {
      c.fillStyle = 'rgba(255,240,200,0.55)';
      c.beginPath(); c.arc(-u * 0.3, -u * 0.45, u * 0.35, Math.PI, 0); c.fill();
    }
    c.fillStyle = '#fff2cf';
    [[-0.4, -0.55], [0.1, -0.75], [0.45, -0.5]].forEach(pt => { circle(c, pt[0] * u, pt[1] * u, u * 0.12); c.fill(); });
  } else if (item === 'patty') {
    // mentah merah muda -> cokelat keemasan -> gosong hampir hitam
    let col;
    if (p < 26) col = mix('#c96a5a', '#8a4b2a', p / 26);
    else if (p <= 70) col = mix('#8a4b2a', '#6e3a1e', (p - 26) / 44);
    else if (p <= 90) col = '#6e3a1e';
    else if (p <= 100) col = mix('#6e3a1e', '#3a1c0c', (p - 90) / 10);
    else col = '#241209';
    c.fillStyle = col; circle(c, 0, 0, u * 0.95); c.fill();
    c.fillStyle = mix(col, '#ffffff', 0.14); circle(c, 0, -u * 0.1, u * 0.8); c.fill();
    if (p >= 26 && p <= 100) {
      // kilau sear + serat daging
      c.fillStyle = 'rgba(255,220,170,0.35)';
      c.beginPath(); c.arc(-u * 0.25, -u * 0.35, u * 0.4, Math.PI, 0); c.fill();
      c.strokeStyle = 'rgba(60,30,12,0.4)'; c.lineWidth = 2;
      [-0.4, 0, 0.4].forEach(o => { c.beginPath(); c.moveTo(o * u, -u * 0.6); c.lineTo(o * u, u * 0.55); c.stroke(); });
    }
    if (p > 100) {
      c.fillStyle = 'rgba(0,0,0,0.35)'; circle(c, 0, 0, u * 0.7); c.fill();
    }
  } else if (item === 'lettuce') {
    c.fillStyle = '#2fbf4a';
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; circle(c, Math.cos(a) * u * 0.55, Math.sin(a) * u * 0.55, u * 0.45); c.fill(); }
    c.fillStyle = '#8ee6a0'; circle(c, 0, 0, u * 0.5); c.fill();
  } else if (item === 'tomato') {
    c.fillStyle = '#ff3b2e'; circle(c, 0, 0, u * 0.9); c.fill();
    c.fillStyle = '#ff7a6a'; circle(c, -u * 0.2, -u * 0.2, u * 0.55); c.fill();
    c.fillStyle = '#2fbf4a'; c.beginPath(); c.moveTo(0, -u * 0.9); c.lineTo(-u * 0.3, -u * 0.5); c.lineTo(u * 0.3, -u * 0.5); c.closePath(); c.fill();
  } else if (item === 'onion') {
    c.strokeStyle = '#d8a0e8'; c.lineWidth = u * 0.22;
    [0.85, 0.55, 0.28].forEach(r => { circle(c, 0, 0, u * r); c.stroke(); });
    c.fillStyle = '#f2dcf8'; circle(c, 0, 0, u * 0.16); c.fill();
  } else if (item === 'cheese') {
    const melted = p >= 60;
    c.fillStyle = melted ? '#ffae00' : '#FFB43B';
    c.beginPath(); c.moveTo(-u, u * 0.7); c.lineTo(u, u * 0.7); c.lineTo(0, -u * 0.8); c.closePath(); c.fill();
    if (melted) {
      // lelehan keju menetes di bawah
      c.fillStyle = '#ffae00';
      [-0.5, 0.1, 0.55].forEach(o => { circle(c, o * u, u * 0.85, u * 0.16); c.fill(); });
      c.fillStyle = 'rgba(255,235,160,0.6)';
      c.beginPath(); c.moveTo(-u * 0.5, u * 0.2); c.lineTo(u * 0.3, u * 0.2); c.lineTo(0, -u * 0.5); c.closePath(); c.fill();
    }
    c.fillStyle = '#f7a91e'; circle(c, -u * 0.2, u * 0.25, u * 0.14); c.fill(); circle(c, u * 0.25, u * 0.05, u * 0.11); c.fill();
  } else if (item === 'pickle') {
    c.fillStyle = '#7ec24a'; c.beginPath(); c.ellipse(0, 0, u * 0.95, u * 0.55, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#b0dc7a';
    [[-0.45, -0.1], [0, 0.12], [0.45, -0.08]].forEach(p => { circle(c, p[0] * u, p[1] * u, u * 0.1); c.fill(); });
  } else if (item === 'chicken') {
    // mentah pucat kemerahan -> keemasan -> gosong
    let col, dark;
    if (p < 26) { col = '#e8b4a0'; dark = '#d89a86'; }
    else if (p <= 70) { col = mix('#e8b4a0', '#e8b04b', (p - 26) / 44); dark = mix('#d89a86', '#d18a2e', (p - 26) / 44); }
    else if (p <= 90) { col = '#e8b04b'; dark = '#d18a2e'; }
    else if (p <= 100) { col = mix('#e8b04b', '#7a4a1e', (p - 90) / 10); dark = mix('#d18a2e', '#5a3410', (p - 90) / 10); }
    else { col = '#2e1a10'; dark = '#1e1008'; }
    c.fillStyle = col; circle(c, -u * 0.15, -u * 0.1, u * 0.7); c.fill();
    c.fillStyle = dark; circle(c, -u * 0.15, -u * 0.1, u * 0.45); c.fill();
    if (p >= 26 && p <= 100) {
      c.fillStyle = 'rgba(255,230,180,0.4)';
      c.beginPath(); c.arc(-u * 0.35, -u * 0.35, u * 0.3, Math.PI, 0); c.fill();
    }
    c.strokeStyle = '#f5e6c8'; c.lineWidth = u * 0.22; c.beginPath(); c.moveTo(u * 0.3, u * 0.3); c.lineTo(u * 0.8, u * 0.8); c.stroke();
    c.fillStyle = '#f5e6c8'; circle(c, u * 0.85, u * 0.85, u * 0.22); c.fill();
  } else if (item === 'fries') {
    // mentah pucat -> kuning keemasan -> cokelat gosong
    let stick;
    if (p < 26) stick = '#f2e3b0';
    else if (p <= 70) stick = mix('#f2e3b0', '#f2c14e', (p - 26) / 44);
    else if (p <= 90) stick = '#f2c14e';
    else if (p <= 100) stick = mix('#f2c14e', '#8a5a2e', (p - 90) / 10);
    else stick = '#3a2410';
    c.fillStyle = '#ff3b2e'; rr(c, -u * 0.7, -u * 0.2, u * 1.4, u * 0.9, u * 0.15); c.fill();
    c.strokeStyle = stick; c.lineWidth = u * 0.28;
    [-0.4, 0, 0.4].forEach(o => { c.beginPath(); c.moveTo(o * u, -u * 0.2); c.lineTo(o * u, -u * 0.95); c.stroke(); });
    if (p >= 26 && p <= 100) {
      c.fillStyle = 'rgba(255,255,255,0.5)';
      circle(c, -u * 0.4, -u * 0.8, u * 0.08); c.fill(); circle(c, u * 0.1, -u * 0.9, u * 0.06); c.fill();
    }
  } else if (item === 'egg') {
    // mentah: putih bening + kuning encer -> matang: putih padat + kuning kokoh -> gosong: tepi cokelat
    const cooked = Math.min(1, Math.max(0, (p - 10) / 60));
    c.save(); c.globalAlpha = 0.55 + 0.45 * cooked;
    c.fillStyle = '#ffffff'; circle(c, 0, 0, u * 0.95); c.fill();
    c.restore();
    const yolkR = u * (0.62 - 0.12 * cooked);
    c.fillStyle = p > 100 ? '#8a5a1e' : '#FFB43B'; circle(c, 0, 0, yolkR); c.fill();
    c.fillStyle = p > 100 ? '#5a3410' : '#f7a91e'; circle(c, 0, 0, yolkR * 0.6); c.fill();
    if (p > 100) {
      c.strokeStyle = '#5a3410'; c.lineWidth = 3;
      c.beginPath(); c.arc(0, 0, u * 0.9, 0, Math.PI * 2); c.stroke();
    } else if (p >= 26) {
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath(); c.arc(-u * 0.3, -u * 0.35, u * 0.22, Math.PI, 0); c.fill();
    }
  } else if (item === 'bread') {
    c.fillStyle = '#f2c478'; rr(c, -u * 0.85, -u * 0.85, u * 1.7, u * 1.7, u * 0.3); c.fill();
    c.fillStyle = '#ffedb8'; rr(c, -u * 0.65, -u * 0.65, u * 1.3, u * 1.3, u * 0.2); c.fill();
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
    c.fillStyle = '#FFB43B'; circle(c, 0, -r * 0.35, r * 0.18); c.fill();
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
  // dinding krem hangat (#FFF0CC) — tenang dan cerah
  const wall = c.createLinearGradient(0, 0, 0, 200);
  wall.addColorStop(0, '#FFF0CC'); wall.addColorStop(1, '#FFE9B0');
  c.fillStyle = wall; c.fillRect(0, 0, W, 200);
  // lantai kayu terang: papan horizontal dengan garis sambungan yang halus
  c.fillStyle = '#F2CE8A'; c.fillRect(0, 200, W, H - 200);
  c.fillStyle = 'rgba(255,255,255,0.22)';
  for (let y = 200; y < H; y += 128) c.fillRect(0, y, W, 64);
  c.strokeStyle = '#e8c078'; c.lineWidth = 2;
  for (let y = 200; y < H; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  // garis dasar dinding (baseboard) — rapi, bukan karpet
  c.fillStyle = '#d18a2e'; c.fillRect(0, 196, W, 6);
  // meja kasir kayu di bawah (area kosong y 656-720)
  const counter = c.createLinearGradient(0, 656, 0, 720);
  counter.addColorStop(0, '#f0c078'); counter.addColorStop(1, '#d18a2e');
  c.fillStyle = counter; c.fillRect(196, 656, 820, 64);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(196, 656, 820, 4);
  c.fillStyle = '#b96f1e'; c.fillRect(196, 656, 820, 2);
  // dekorasi meja: burger di kiri, botol saus + tanaman di kanan
  drawBurgerDeco(c, 268, 690, 52);
  // tomat + selada di celah meja (seperti referensi)
  drawFood(c, 'tomato', 336, 700, 28);
  drawFood(c, 'lettuce', 362, 706, 24);
  drawPlant(c, 922, 700, 26);
  drawSauceBottle(c, 956, 694, 30, '#e2483d', '#c92a20');
  drawSauceBottle(c, 988, 696, 26, '#FFB43B', '#e8912a');
}

// ---- Bar atas ----
function drawTopBar(c, g) {
  const b = L.top;
  const grad = c.createLinearGradient(0, 0, 0, 60);
  grad.addColorStop(0, '#A85F2B'); grad.addColorStop(1, '#653719');
  c.fillStyle = grad; c.fillRect(b.x, b.y, b.w, b.h);
  // garis emas di bawah bar atas
  c.fillStyle = '#FFD84A'; c.fillRect(0, 57, W, 3);
  // daun besar di pojok bar atas (di bawah logo/tombol, seperti referensi)
  drawLeaf(c, 14, 10, 16, -0.7); drawLeaf(c, 30, 4, 11, -0.2); drawLeaf(c, 4, 26, 11, -1.2);
  drawLeaf(c, 1266, 10, 16, 0.7); drawLeaf(c, 1250, 4, 11, 0.2); drawLeaf(c, 1276, 26, 11, 1.2);
  // logo
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(36, 24, 12, Math.PI, 0); c.fill();
  circle(c, 26, 22, 6); c.fill(); circle(c, 46, 22, 6); c.fill();
  c.fillStyle = '#ffffff'; rr(c, 19, 26, 34, 9, 3); c.fill();
  text(c, "CHEF'S RUSH", 62, 24, 22, '#FFD84A', 'left');
  text(c, 'KITCHEN MASTER', 62, 44, 10, '#f7e8c8', 'left');
  if (g.level) {
    pill(c, 268, 14, 92, 32, '#653719', '#FFD84A');
    text(c, 'LEVEL ' + g.levelN, 314, 31, 15, '#FFD84A');
  }
  // timer
  if (g.screen === 'playing' || g.screen === 'paused') {
    const m = Math.floor(g.timeLeft / 60), s = Math.floor(g.timeLeft % 60);
    pill(c, 380, 12, 150, 36, g.timeLeft < 30 ? '#7a1e1e' : '#653719', '#ffffff');
    text(c, (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s, 455, 31, 20, '#ffffff');
    const frac = g.level ? g.timeLeft / g.level.shift : 0;
    c.fillStyle = frac < 0.2 ? '#ff5a4d' : '#36C957';
    rr(c, 392, 42, 126 * frac, 5, 2); c.fill();
  }
  // koin & skor
  circle(c, 580, 30, 15); c.fillStyle = '#FFB43B'; c.fill();
  c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
  text(c, '$', 580, 31, 18, '#653719');
  text(c, String(g.save.coins + (g.screen === 'playing' ? g.coinsEarned : 0)), 602, 31, 18, '#FFD84A', 'left');
  text(c, 'SKOR ' + g.score, 760, 31, 18, '#ffffff', 'left');
  // bintang progres
  if (g.level) {
    for (let i = 0; i < 3; i++) {
      const th = [g.level.target, g.level.star2, g.level.star3][i];
      const got = g.score >= th;
      drawStar(c, 900 + i * 34, 30, 13, got ? '#FFD84A' : '#7a6a50');
    }
  }
  // tombol mute & pause (mengilap, ikon not musik)
  pill(c, L.muteBtn.x, L.muteBtn.y, L.muteBtn.w, L.muteBtn.h, '#653719', '#FFD84A');
  c.fillStyle = 'rgba(255,255,255,0.25)'; rr(c, L.muteBtn.x + 4, L.muteBtn.y + 3, L.muteBtn.w - 8, 8, 4); c.fill();
  if (g.save.muted) {
    text(c, '✕', L.muteBtn.x + 18, L.muteBtn.y + 21, 16, '#ff5a4d');
  } else {
    // not musik kecil
    c.fillStyle = '#ffffff';
    circle(c, L.muteBtn.x + 14, L.muteBtn.y + 28, 4); c.fill();
    c.fillRect(L.muteBtn.x + 17, L.muteBtn.y + 12, 2.5, 17);
    c.beginPath(); c.moveTo(L.muteBtn.x + 19, L.muteBtn.y + 12); c.lineTo(L.muteBtn.x + 26, L.muteBtn.y + 17); c.lineTo(L.muteBtn.x + 19, L.muteBtn.y + 21); c.closePath(); c.fill();
  }
  pill(c, L.pauseBtn.x, L.pauseBtn.y, L.pauseBtn.w, L.pauseBtn.h, '#653719', '#FFD84A');
  c.fillStyle = 'rgba(255,255,255,0.25)'; rr(c, L.pauseBtn.x + 4, L.pauseBtn.y + 3, L.pauseBtn.w - 8, 8, 4); c.fill();
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
  c.fillStyle = '#653719'; c.fillRect(L.railL.x, L.railL.y, L.railL.w, L.railL.h);
  c.fillStyle = '#A85F2B'; c.fillRect(L.railL.x, L.railL.y, L.railL.w, 34);
  text(c, 'PELANGGAN', 98, L.railL.y + 18, 15, '#FFD84A');
  for (let i = 0; i < 3; i++) {
    const y = L.railL.y + 44 + i * 210;
    rr(c, 10, y, 176, 196, 12); c.fillStyle = i % 2 ? '#653719' : '#8A5426'; c.fill();
    c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
    // kilau atas kartu
    c.fillStyle = 'rgba(255,255,255,0.18)'; rr(c, 14, y + 4, 168, 10, 5); c.fill();
    const o = g.orders[i];
    if (!o) {
      drawChefHat(c, 98, y + 72, 30);
      text(c, '— kosong —', 98, y + 98, 14, '#d18a2e', 'center', false);
      continue;
    }
    const cust = CUSTOMERS[o.cust];
    const frac = Math.max(0, o.patience / o.maxPatience);
    const bob = o.animT > 0 ? Math.sin(o.animT * 14) * 4 : 0;
    // wajah lebih besar (seperti referensi) — dipotong di tepi kartu
    c.save();
    rr(c, 10, y, 176, 196, 12); c.clip();
    drawFace(c, o.cust, 98, y + 56 + bob, 50, o.mood);
    c.restore();
    if (frac < 0.85) {
      // tanda seru merah muda saat pelanggan menunggu (kesabaran < 85%)
      text(c, '!!', 156, y + 24, 20, '#ff7a9e');
    }
    // pil nama hijau (seperti referensi)
    pill(c, 48, y + 112, 100, 28, '#36C957', '#1f9e3a');
    text(c, cust.name, 98, y + 127, 15, '#ffffff');
    // bar kesabaran
    rr(c, 28, y + 146, 140, 12, 6); c.fillStyle = '#2e1a10'; c.fill();
    c.fillStyle = frac > 0.5 ? '#36C957' : frac > 0.25 ? '#FFB43B' : '#ff5a4d';
    rr(c, 28, y + 146, 140 * frac, 12, 6); c.fill();
    text(c, RECIPES[o.recipeId].name, 98, y + 176, 12, '#FFD84A', 'center', false);
  }
}

// ---- Bin bahan ----
function drawBins(c, g) {
  for (const b of L.bins) {
    const ing = INGREDIENTS[b.id];
    const stock = g.stocks[b.id];
    const empty = stock <= 0;
    // nampan baja mengilap + bayangan jatuh
    c.fillStyle = 'rgba(20,10,4,0.3)';
    rr(c, b.x + 2, b.y + 3, b.w, b.h, 8); c.fill();
    const grad = c.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
    grad.addColorStop(0, '#FFF0CC'); grad.addColorStop(1, '#F2DCA8');
    rr(c, b.x, b.y, b.w, b.h, 8); c.fillStyle = grad; c.fill();
    c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
    // kilau atas nampan
    c.fillStyle = 'rgba(255,255,255,0.6)'; rr(c, b.x + 4, b.y + 3, b.w - 8, 7, 3); c.fill();
    if (empty) { c.fillStyle = 'rgba(40,30,20,0.3)'; rr(c, b.x, b.y, b.w, b.h, 8); c.fill(); }
    drawFood(c, b.id, b.x + b.w / 2, b.y + 30, 46);
    // label gelap selebar nampan (seperti referensi)
    pill(c, b.x, b.y + b.h - 18, b.w, 18, 'rgba(101,55,25,0.92)');
    text(c, ing.name.toUpperCase(), b.x + b.w / 2, b.y + b.h - 9, 10, '#ffffff');
    if (stock < ing.maxStock) {
      pill(c, b.x + b.w - 20, b.y + 2, 18, 16, '#a02828');
      text(c, String(stock), b.x + b.w - 11, b.y + 11, 11, '#ffffff');
    }
    if (g.held && g.held.kind === 'item' && g.held.item === b.id && g.held.quality === 'raw') {
      c.strokeStyle = '#FFD84A'; c.lineWidth = 3; rr(c, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 10); c.stroke();
    }
  }
}

// ---- Stasiun masak ----
// slot kosong: lingkaran garis putus-putus (jelas sebagai "belum terisi")
function emptySlot(c, x, y, textDy) {
  c.save();
  c.strokeStyle = 'rgba(230,230,230,0.55)'; c.lineWidth = 2; c.setLineDash([6, 6]);
  circle(c, x, y, 30); c.stroke();
  c.setLineDash([]);
  text(c, 'kosong', x, y + (textDy === undefined ? 44 : textDy), 11, 'rgba(230,230,230,0.75)', 'center', false);
  c.restore();
}
function cookBar(c, x, y, w, pct) {
  rr(c, x, y, w, 10, 5); c.fillStyle = '#2e1a10'; c.fill();
  let col = '#36C957';
  if (pct < 26) col = '#b8bec4'; else if (pct <= 70) col = '#FFB43B';
  else if (pct <= 90) col = '#36C957'; else if (pct <= 100) col = '#ff8a2e'; else col = '#3a3a3a';
  c.fillStyle = col; rr(c, x, y, w * Math.min(1, pct / 100), 10, 5); c.fill();
  if (pct > 90 && pct <= 100) { text(c, 'ANGKAT!', x + w / 2, y - 8, 11, '#ff8a2e'); }
  if (pct > 100) { text(c, 'GOSONG!', x + w / 2, y - 8, 11, '#ff5a4d'); }
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
  glossPanel(c, ch.x, ch.y, ch.w, ch.h, 12, '#d18a2e', '#A85F2B', '#8A4A1F');
  plaque(c, ch.x + ch.w / 2 - 70, ch.y - 12, 140, 'TALENAN');
  // papan kayu
  rr(c, ch.x + 18, ch.y + 36, ch.w - 36, 92, 8); c.fillStyle = '#f0c078'; c.fill();
  c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.3)'; rr(c, ch.x + 24, ch.y + 40, ch.w - 48, 8, 4); c.fill();
  if (g.chop) {
    drawFood(c, g.chop.item, ch.x + ch.w / 2 - 30, ch.y + 82, 52);
    // pisau
    c.save(); c.translate(ch.x + ch.w / 2 + 52, ch.y + 82); c.rotate(-0.5 + Math.sin(g.time * 20) * 0.08);
    c.fillStyle = '#d8dce2'; rr(c, -8, -26, 16, 52, 4); c.fill();
    c.fillStyle = '#3a2110'; rr(c, -6, 26, 12, 22, 4); c.fill(); c.restore();
    // garis potong muncul bertahap mengikuti progres
    const prog = g.chop.clicks / COOK.chopClicks;
    c.strokeStyle = 'rgba(60,30,12,0.55)'; c.lineWidth = 2;
    [[-12, 0.25], [0, 0.5], [12, 0.75]].forEach(([o, th]) => {
      if (prog >= th) {
        c.beginPath(); c.moveTo(ch.x + ch.w / 2 - 30 + o, ch.y + 64); c.lineTo(ch.x + ch.w / 2 - 30 + o, ch.y + 100); c.stroke();
      }
    });
    const p = (g.chop.clicks / COOK.chopClicks) * 100;
    text(c, 'Klik untuk memotong!', ch.x + ch.w / 2, ch.y + 136, 11, '#ffffff', 'center', false);
    cookBar(c, ch.x + 40, ch.y + 150, ch.w - 80, p);
  } else {
    text(c, 'Taruh selada / tomat / bawang', ch.x + ch.w / 2, ch.y + 82, 12, '#f7e8c8', 'center', false);
  }
  // --- Wajan ---
  const fr = L.fry;
  glossPanel(c, fr.x, fr.y, fr.w, fr.h, 12, '#8a9ab0', '#7189A8', '#5A6E86');
  plaque(c, fr.x + fr.w / 2 - 70, fr.y - 12, 140, 'WAJAN');
  text(c, 'Ayam • Kentang • Telur', fr.x + fr.w / 2, fr.y + 36, 11, '#eef1f4', 'center', false);
  for (let i = 0; i < 2; i++) {
    const sx = fr.x + 34 + i * 128, sy = fr.y + 52;
    // panci bergagang (seperti referensi): lingkar logam + cincin glow biru
    const pcx = sx + 42, pcy = sy + 28;
    c.fillStyle = '#2e3238'; circle(c, pcx, pcy, 38); c.fill();
    c.strokeStyle = '#c8ccd2'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(90,200,255,0.95)'; c.lineWidth = 2;
    circle(c, pcx, pcy, 34); c.stroke();
    // gagang hitam ke bawah + lubang
    c.fillStyle = '#1a1a1a'; rr(c, pcx - 5, pcy + 38, 10, 26, 4); c.fill();
    c.fillStyle = '#3a3a3a'; rr(c, pcx - 5, pcy + 38, 10, 6, 3); c.fill();
    c.fillStyle = '#2e3238'; circle(c, pcx, pcy + 58, 3); c.fill();
    const slot = g.fry[i];
    if (slot) {
      const pct = cookPct(g, slot, 'fry');
      // minyak panas berkilau di wajan
      c.fillStyle = 'rgba(232,180,60,0.35)'; circle(c, pcx, pcy, 30); c.fill();
      drawFood(c, slot.item, pcx, pcy, 52, pct);
      cookBar(c, sx, sy + 96, 84, pct);
      if (pct > 100) {
        c.fillStyle = 'rgba(60,60,60,0.5)'; circle(c, pcx, pcy, 30); c.fill();
        drawSteam(c, pcx, sy + 6, g.time + i, 2, '#7a7a7a');
      } else if (pct >= 26) {
        drawSteam(c, pcx, sy + 6, g.time + i, pct >= 71 ? 3 : 2);
        // gelembung minyak berdesis
        c.fillStyle = 'rgba(255,235,160,0.85)';
        [[20, 52], [42, 60], [64, 50]].forEach((b, k) => {
          circle(c, sx + b[0] + Math.sin(g.time * 7 + k * 2 + i) * 4, sy + b[1] + Math.cos(g.time * 5 + k) * 3, 2.5); c.fill();
        });
      }
    } else {
      emptySlot(c, pcx, pcy, 6);
    }
  }
  // --- Panggangan ---
  const gr = L.grill;
  glossPanel(c, gr.x, gr.y, gr.w, gr.h, 12, '#8a5a2e', '#653719', '#4a2c14');
  plaque(c, gr.x + gr.w / 2 - 80, gr.y - 12, 160, 'PANGGANGAN');
  text(c, 'Patty • Ayam', gr.x + gr.w / 2, gr.y + 36, 11, '#eef1f4', 'center', false);
  for (let i = 0; i < 2; i++) {
    const sx = gr.x + 34 + i * 128, sy = gr.y + 52;
    // bara menyala (lebih terang — bara panas)
    c.fillStyle = '#2e1c0c'; rr(c, sx, sy, 84, 68, 8); c.fill();
    c.fillStyle = 'rgba(255,120,40,0.5)'; rr(c, sx, sy + 38, 84, 30, 8); c.fill();
    c.fillStyle = '#ff5a4d';
    for (let k = 0; k < 4; k++) { circle(c, sx + 12 + k * 20, sy + 56, 7); c.fill(); }
    c.fillStyle = '#FFD84A';
    for (let k = 0; k < 4; k++) { circle(c, sx + 12 + k * 20, sy + 56, 3); c.fill(); }
    // jeruji logam mengilap
    c.strokeStyle = '#d8dce2'; c.lineWidth = 3;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(sx + 4, sy + 12 + k * 14); c.lineTo(sx + 80, sy + 12 + k * 14); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(sx + 4, sy + 10 + k * 14); c.lineTo(sx + 80, sy + 10 + k * 14); c.stroke(); }
    const slot = g.grill[i];
    if (slot) {
      const pct = cookPct(g, slot, 'grill');
      if (pct >= 26 && pct <= 100) { drawFlame(c, sx + 20, sy + 66, g.time, 0.8); drawFlame(c, sx + 64, sy + 66, g.time + 1, 0.7); }
      drawFood(c, slot.item, sx + 42, sy + 34, 52, pct);
      if (pct > 40 && pct <= 100 && (slot.item === 'patty' || slot.item === 'chicken')) {
        grillMarks(c, sx + 42, sy + 34, 26);
      }
      cookBar(c, sx, sy + 86, 84, pct);
      if (pct > 100) {
        c.fillStyle = 'rgba(60,60,60,0.5)'; circle(c, sx + 42, sy + 34, 30); c.fill();
        drawSteam(c, sx + 42, sy + 6, g.time + i, 2, '#7a7a7a');
      } else if (pct >= 26) {
        drawSteam(c, sx + 42, sy + 6, g.time + i, pct >= 71 ? 3 : 2);
      }
    } else {
      emptySlot(c, sx + 42, sy + 34);
    }
  }
}

// ---- Papan rakitan ----
function drawBoard(c, g) {
  const b = L.board;
  const shake = g.shakeT > 0 ? Math.sin(g.time * 40) * 4 : 0;
  c.save(); c.translate(shake, 0);
  glossPanel(c, b.x, b.y, b.w, b.h, 12, '#d18a2e', '#A85F2B', '#8A4A1F');
  plaque(c, b.x + b.w / 2 - 80, b.y - 12, 160, 'PAPAN RAKITAN');
  // papan kayu
  rr(c, b.x + 16, b.y + 34, b.w - 32, 108, 8); c.fillStyle = '#f0c078'; c.fill();
  c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.3)'; rr(c, b.x + 22, b.y + 38, b.w - 44, 8, 4); c.fill();
  // kilau di sudut bawah papan (seperti referensi)
  sparkle(c, b.x + 26, b.y + 134, 8, g.time);
  sparkle(c, b.x + b.w - 26, b.y + 134, 8, g.time + 1);
  // tumpukan layer
  if (g.board.length === 0) {
    text(c, 'Klik bahan sesuai resep', b.x + b.w / 2, b.y + 88, 13, '#653719');
  } else {
    const n = g.board.length;
    g.board.forEach((layer, i) => {
      const ly = b.y + 128 - i * 12;
      const lx = b.x + b.w / 2;
      drawFood(c, layer.item, lx, ly, 40, qPct(layer.quality));
      if (layer.quality === 'burnt') { text(c, '✕ gosong', lx + 60, ly, 11, '#ff5a4d', 'left'); }
      else if (layer.quality === 'perfect') { text(c, '★', lx + 60, ly, 13, '#FFD84A', 'left'); }
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
      if (next) { c.fillStyle = 'rgba(255,216,74,0.4)'; circle(c, x, y, 17); c.fill(); }
      c.globalAlpha = done ? 1 : 0.55;
      drawFood(c, layer.item, x, y, 26);
      c.globalAlpha = 1;
      if (done) { text(c, '✓', x + 10, y - 10, 12, '#36C957'); }
      if (next) { text(c, '▼', x, y - 20, 10, '#FFD84A'); }
    });
  } else {
    text(c, 'Menunggu pesanan…', b.x + b.w / 2, b.y + 180, 13, '#f7e8c8', 'center', false);
  }
  c.restore();
}

// ---- Piring & sampah ----
function drawPlates(c, g) {
  const p = L.plates;
  glossPanel(c, p.x, p.y, p.w, p.h, 12, '#A85F2B', '#653719', '#d18a2e');
  plaque(c, p.x + p.w / 2 - 60, p.y - 12, 120, 'PIRING');
  for (let i = 0; i < g.plates.length; i++) {
    const x = p.x + 52 + i * 84, y = p.y + 84;
    // bayangan + piring mengilap
    c.fillStyle = 'rgba(20,10,4,0.35)'; circle(c, x + 2, y + 4, 40); c.fill();
    c.fillStyle = '#fffaf0'; circle(c, x, y, 40); c.fill();
    c.strokeStyle = '#c8bfa8'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#f2e8d0'; circle(c, x, y, 26); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath(); c.arc(x - 8, y - 12, 14, Math.PI, 0); c.fill();
    const dish = g.plates[i];
    if (dish) {
      const recipe = RECIPES[dish.recipeId];
      // burger utuh: semua layer ditumpuk, roti bawah datar
      const dp = dish.burnt ? 115 : dish.perfect ? 85 : 60;
      const layers = recipe.layers, n = layers.length;
      layers.forEach((layer, k) => {
        const ly = y - k * 5 + (n - 1) * 2.5;
        if (k === 0 && layer.item === 'bun') {
          c.fillStyle = '#e8a33c'; rr(c, x - 16, ly - 4, 32, 9, 4); c.fill();
        } else {
          drawFood(c, layer.item, x, ly, 30, dp);
        }
      });
      if (dish.burnt) text(c, 'gosong', x, y + 52, 11, '#ff5a4d');
      else if (dish.perfect) text(c, '★ perfect', x, y + 52, 11, '#FFD84A');
      else text(c, recipe.name, x, y + 52, 10, '#ffffff', 'center', false);
    }
  }
  text(c, 'Klik piring untuk mengambil', p.x + p.w / 2, p.y + 188, 11, '#f7e8c8', 'center', false);
  // tempat sampah (panel biru seperti referensi)
  const t = L.trash;
  glossPanel(c, t.x, t.y, t.w, t.h, 12, '#6b8fb8', '#527DAA', '#3F6488');
  plaque(c, t.x + t.w / 2 - 40, t.y - 12, 80, 'SAMPAH');
  c.fillStyle = '#6b8fb8'; rr(c, t.x + 12, t.y + 24, t.w - 24, 120, 8); c.fill();
  // ikon tempat sampah putih
  c.fillStyle = '#f2f4f6'; rr(c, t.x + t.w / 2 - 22, t.y + 62, 44, 52, 6); c.fill();
  c.fillStyle = '#d8dce2'; rr(c, t.x + t.w / 2 - 26, t.y + 52, 52, 10, 4); c.fill();
  c.fillStyle = '#8a9096';
  [-12, 0, 12].forEach(o => { rr(c, t.x + t.w / 2 + o - 2, t.y + 76, 4, 26, 2); c.fill(); });
  text(c, 'Buang bahan', t.x + t.w / 2, t.y + 160, 11, '#eef1f4', 'center', false);
  text(c, 'gosong di sini', t.x + t.w / 2, t.y + 176, 11, '#eef1f4', 'center', false);
}

// ---- Tombol SERVE ----
function drawServe(c, g) {
  const s = L.serve;
  const ready = g.plates.some(d => d && g.orders.some(o => o.recipeId === d.recipeId));
  const pulse = ready ? 1 + 0.03 * Math.sin(g.time * 6) : 1;
  c.save(); c.translate(s.x + s.w / 2, s.y + s.h / 2); c.scale(pulse, pulse); c.translate(-(s.x + s.w / 2), -(s.y + s.h / 2));
  const grad = c.createLinearGradient(s.x, s.y, s.x, s.y + s.h);
  if (ready) { grad.addColorStop(0, '#5EE87A'); grad.addColorStop(0.5, '#36C957'); grad.addColorStop(1, '#1f9e3a'); }
  else { grad.addColorStop(0, '#8a929c'); grad.addColorStop(1, '#5a6068'); }
  // bayangan jatuh
  c.fillStyle = 'rgba(20,10,4,0.4)';
  rr(c, s.x + 3, s.y + 5, s.w, s.h, 16); c.fill();
  rr(c, s.x, s.y, s.w, s.h, 16); c.fillStyle = grad; c.fill();
  c.strokeStyle = ready ? '#FFD84A' : '#a8adb4'; c.lineWidth = 5; c.stroke();
  // kilau atas tombol (lebih kuat)
  c.fillStyle = 'rgba(255,255,255,0.45)';
  rr(c, s.x + 10, s.y + 5, s.w - 20, s.h * 0.38, 12); c.fill();
  // lonceng
  c.fillStyle = '#FFD84A'; c.beginPath(); c.arc(s.x + 52, s.y + 40, 16, Math.PI, 0); c.fill();
  rr(c, s.x + 34, s.y + 40, 36, 6, 3); c.fill();
  circle(c, s.x + 52, s.y + 52, 4); c.fill();
  text(c, 'SERVE', s.x + s.w / 2 + 20, s.y + 42, 34, '#ffffff');
  c.restore();
  if (ready) {
    // kilau bintang di sekeliling tombol saat siap (lebih besar)
    sparkle(c, s.x + 16, s.y - 8, 13, g.time);
    sparkle(c, s.x + s.w - 16, s.y - 8, 13, g.time + 1);
    sparkle(c, s.x + 8, s.y + s.h + 2, 10, g.time + 2);
    sparkle(c, s.x + s.w - 8, s.y + s.h + 2, 10, g.time + 3);
  }
  // bilah petunjuk krem di atas meja (seperti referensi)
  pill(c, s.x + 40, s.y + s.h + 8, s.w - 80, 28, '#fff3d0', '#d18a2e');
  text(c, 'Sajikan hidangan yang cocok dengan pesanan', s.x + s.w / 2, s.y + s.h + 23, 12, '#653719', 'center', false);
}

// ---- Order board (kanan) ----
function drawOrderBoard(c, g) {
  c.fillStyle = '#653719'; c.fillRect(L.railR.x, L.railR.y, L.railR.w, L.railR.h);
  c.fillStyle = '#A85F2B'; c.fillRect(L.railR.x, L.railR.y, L.railR.w, 34);
  text(c, 'ORDER BOARD', L.railR.x + 132, L.railR.y + 18, 15, '#FFD84A');
  for (let i = 0; i < 3; i++) {
    const y = L.railR.y + 44 + i * 210;
    const o = g.orders[i];
    rr(c, L.railR.x + 10, y, 244, 196, 12);
    c.fillStyle = o ? '#fff3d0' : '#653719'; c.fill();
    if (o) {
      const selected = g.targetOrderId === o.id;
      c.strokeStyle = selected ? '#FFD84A' : '#d18a2e'; c.lineWidth = selected ? 4 : 2; c.stroke();
      // ledakan bintang di sudut atas tiket (seperti referensi)
      starburst(c, L.railR.x + 12, y + 6, 13, g.time);
      starburst(c, L.railR.x + 252, y + 6, 13, g.time + 1);
      const recipe = RECIPES[o.recipeId];
      const frac = Math.max(0, o.patience / o.maxPatience);
      text(c, 'PESANAN #' + String(o.id).padStart(2, '0'), L.railR.x + 132, y + 18, 13, '#653719');
      // ikon hidangan: burger mini mengilap (lebih besar, seperti referensi)
      const iconLayers = [recipe.layers[0], recipe.layers[Math.floor(recipe.layers.length / 2)], recipe.layers[recipe.layers.length - 1]];
      iconLayers.forEach((layer, k) => drawFood(c, layer.item, L.railR.x + 42, y + 64 - k * 9, 40, 85));
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(L.railR.x + 30, y + 34, 9, Math.PI, 0); c.fill();
      text(c, recipe.name, L.railR.x + 132, y + 52, 13, '#2e1a10', 'left');
      text(c, 'Hadiah: ' + o.reward + ' koin', L.railR.x + 132, y + 74, 12, '#653719', 'left', false);
      // daftar bahan
      recipe.layers.forEach((layer, k) => {
        const x = L.railR.x + 22 + k * 30 + 15, yy = y + 106;
        drawFood(c, layer.item, x, yy, 26);
      });
      // bar kesabaran
      rr(c, L.railR.x + 26, y + 140, 212, 12, 6); c.fillStyle = '#2e1a10'; c.fill();
      c.fillStyle = frac > 0.5 ? '#36C957' : frac > 0.25 ? '#FFB43B' : '#ff5a4d';
      rr(c, L.railR.x + 26, y + 140, 212 * frac, 12, 6); c.fill();
      text(c, 'Kesabaran ' + Math.ceil(frac * 100) + '%', L.railR.x + 132, y + 162, 11, '#653719', 'center', false);
      if (selected) { text(c, '✓ DILAYANI', L.railR.x + 132, y + 180, 11, '#1f9e3a'); }
    } else {
      c.strokeStyle = '#d18a2e'; c.lineWidth = 2; c.stroke();
      drawChefHat(c, L.railR.x + 132, y + 72, 30);
      text(c, '— menunggu —', L.railR.x + 132, y + 98, 14, '#d18a2e', 'center', false);
    }
  }
}

// ---- Layar-layar ----
function overlay(c, alpha) { c.fillStyle = 'rgba(20,12,6,' + alpha + ')'; c.fillRect(0, 0, W, H); }
// tenda awning garis-garis di atas papan judul (khas warung burger)
function drawSignAwning(c, x, y, w) {
  const sw = 60, h = 24;
  for (let i = 0; i < Math.floor(w / sw); i++) {
    c.fillStyle = i % 2 ? '#FFF8E0' : '#FFB43B';
    c.fillRect(x + i * sw, y, sw, h);
    // ujung membulat (scallop) di bawah tiap garis
    c.beginPath(); c.ellipse(x + i * sw + sw / 2, y + h, sw / 2, 12, 0, 0, Math.PI); c.fill();
  }
  // bayangan tipis di bawah awning
  c.fillStyle = 'rgba(20,10,4,0.3)';
  c.fillRect(x, y + h + 12, w, 3);
}
// burger pahlawan besar (menu utama) — burger + uap + bendera
function drawHeroBurger(c, x, y, s, t) {
  drawBurgerDeco(c, x, y, s);
  // uap hangat di atas burger
  drawSteam(c, x, y - s * 0.55, t, 3, 'rgba(255,255,255,0.8)');
  // tusuk bendera merah di puncak burger
  c.strokeStyle = '#8a5a2e'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(x, y - s * 0.55); c.lineTo(x, y - s * 0.95); c.stroke();
  c.fillStyle = '#e2483d';
  c.beginPath(); c.moveTo(x, y - s * 0.95); c.lineTo(x + s * 0.28, y - s * 0.86); c.lineTo(x, y - s * 0.77); c.closePath(); c.fill();
}
// kentang goreng dalam kemasan merah
function drawFries(c, x, y, s) {
  // kentang kuning menjulang
  c.fillStyle = '#f2c14e';
  [-0.3, -0.1, 0.1, 0.3].forEach((o, i) => {
    rr(c, x + o * s - s * 0.07, y - s * (0.75 + (i % 2) * 0.12), s * 0.14, s * 0.6, s * 0.05); c.fill();
  });
  // kemasan merah
  c.fillStyle = '#e2483d';
  c.beginPath(); c.moveTo(x - s * 0.45, y - s * 0.35); c.lineTo(x + s * 0.45, y - s * 0.35);
  c.lineTo(x + s * 0.32, y + s * 0.4); c.lineTo(x - s * 0.32, y + s * 0.4); c.closePath(); c.fill();
  // logo lingkaran putih di kemasan
  c.fillStyle = '#fff3d0'; circle(c, x, y + s * 0.05, s * 0.16); c.fill();
  c.fillStyle = '#e2483d'; circle(c, x, y + s * 0.05, s * 0.1); c.fill();
}
// gelas minuman dingin + sedotan
function drawDrink(c, x, y, s) {
  // sedotan
  c.strokeStyle = '#FFB43B'; c.lineWidth = s * 0.09; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x + s * 0.08, y - s * 0.55); c.lineTo(x + s * 0.28, y - s * 1.0); c.stroke();
  // gelas
  c.fillStyle = '#e2483d';
  c.beginPath(); c.moveTo(x - s * 0.4, y - s * 0.5); c.lineTo(x + s * 0.4, y - s * 0.5);
  c.lineTo(x + s * 0.3, y + s * 0.5); c.lineTo(x - s * 0.3, y + s * 0.5); c.closePath(); c.fill();
  // tutup gelas
  c.fillStyle = '#fff3d0'; rr(c, x - s * 0.46, y - s * 0.58, s * 0.92, s * 0.14, s * 0.05); c.fill();
  // gelembung es
  c.fillStyle = 'rgba(255,255,255,0.5)';
  circle(c, x - s * 0.12, y + s * 0.1, s * 0.07); c.fill();
  circle(c, x + s * 0.14, y + s * 0.25, s * 0.06); c.fill();
}
// papan menu harga ala warung burger (kanan layar menu)
function drawMenuBoard(c, x, y, w, h) {
  // bingkai kayu + papan tulis gelap
  rr(c, x, y, w, h, 12); c.fillStyle = '#A85F2B'; c.fill();
  rr(c, x + 6, y + 6, w - 12, h - 12, 8); c.fillStyle = '#2e1a10'; c.fill();
  text(c, '★ MENU HARI INI ★', x + w / 2, y + 26, 15, '#FFD84A');
  c.strokeStyle = 'rgba(255,216,74,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 16, y + 44); c.lineTo(x + w - 16, y + 44); c.stroke();
  const items = [
    ['bun', 'Classic Burger', '35'],
    ['chicken', 'Chicken Burger', '45'],
    ['patty', 'Double Beef', '60'],
  ];
  items.forEach((it, i) => {
    const iy = y + 76 + i * 52;
    drawFood(c, it[0], x + 34, iy, 34, 85);
    text(c, it[1], x + 58, iy - 2, 14, '#fff3d0', 'left', false);
    text(c, it[2] + ' koin', x + w - 18, iy - 2, 14, '#FFD84A', 'right');
  });
  c.strokeStyle = 'rgba(255,216,74,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 16, y + h - 36); c.lineTo(x + w - 16, y + h - 36); c.stroke();
  text(c, 'Dibuat segar • Disajikan panas!', x + w / 2, y + h - 18, 12, '#f7e8c8', 'center', false);
}
// latar depan toko: langit, dinding warung, trotoar + jendela etalase
function drawMenuBackdrop(c) {
  // langit hangat (terlihat di bawah bar atas)
  const sky = c.createLinearGradient(0, 0, 0, 140);
  sky.addColorStop(0, '#bfe3f0'); sky.addColorStop(1, '#ffeec2');
  c.fillStyle = sky; c.fillRect(0, 0, W, 140);
  // matahari + awan
  c.fillStyle = '#FFD84A'; circle(c, 1180, 82, 20); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath(); c.ellipse(150, 82, 45, 14, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(190, 74, 32, 12, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(1080, 88, 40, 12, 0, 0, Math.PI * 2); c.fill();
  // dinding warung (kayu krem)
  c.fillStyle = '#e8c88f'; c.fillRect(0, 140, W, 470);
  // garis papan kayu horizontal
  c.fillStyle = 'rgba(120,70,20,0.18)';
  for (let y = 200; y < 610; y += 60) c.fillRect(0, y, W, 3);
  // trotoar
  c.fillStyle = '#d9b98a'; c.fillRect(0, 610, W, 110);
  c.fillStyle = 'rgba(120,70,20,0.25)';
  for (let x = 0; x < W; x += 90) c.fillRect(x, 610, 3, 110);
  c.fillRect(0, 610, W, 4);
  // jendela etalase kiri + kanan (bingkai kayu + kaca)
  [40, 960].forEach((wx) => {
    rr(c, wx, 300, 280, 180, 10); c.fillStyle = '#653719'; c.fill();
    rr(c, wx + 8, 308, 264, 164, 6); c.fillStyle = '#bfe3f0'; c.fill();
    // kilau kaca
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.beginPath(); c.moveTo(wx + 30, 308); c.lineTo(wx + 90, 308); c.lineTo(wx + 40, 472); c.lineTo(wx + 14, 472); c.closePath(); c.fill();
  });
}
// poster makanan di etalase (ikon + 2 baris label)
function drawFoodPoster(c, x, y, w, h, kind, line1, line2, bg) {
  rr(c, x, y, w, h, 8); c.fillStyle = bg; c.fill();
  c.strokeStyle = '#653719'; c.lineWidth = 3; c.stroke();
  if (kind === 'burger') drawBurgerDeco(c, x + w / 2, y + h * 0.38, w * 0.6);
  else if (kind === 'fries') drawFries(c, x + w / 2, y + h * 0.38, w * 0.48);
  else if (kind === 'drink') drawDrink(c, x + w / 2, y + h * 0.38, w * 0.48);
  text(c, line1, x + w / 2, y + h - 30, 13, '#653719');
  text(c, line2, x + w / 2, y + h - 12, 13, '#653719');
}
// pengunjung kecil yang mengantri (badan utuh, goyang pelan)
function drawQueuePerson(c, x, y, s, o, t) {
  const bob = Math.sin(t * 1.6 + x * 0.05) * 2;
  c.save(); c.translate(x, y + bob);
  // kaki
  c.fillStyle = '#3a2a1a';
  rr(c, -s * 0.15, -s * 0.3, s * 0.12, s * 0.3, s * 0.04); c.fill();
  rr(c, s * 0.03, -s * 0.3, s * 0.12, s * 0.3, s * 0.04); c.fill();
  // badan (baju)
  c.fillStyle = o.shirt;
  rr(c, -s * 0.24, -s * 0.66, s * 0.48, s * 0.4, s * 0.09); c.fill();
  // kerah baju
  c.fillStyle = 'rgba(255,255,255,0.35)';
  rr(c, -s * 0.1, -s * 0.66, s * 0.2, s * 0.06, s * 0.03); c.fill();
  // lengan
  c.fillStyle = o.shirt;
  rr(c, -s * 0.32, -s * 0.62, s * 0.1, s * 0.32, s * 0.05); c.fill();
  rr(c, s * 0.22, -s * 0.62, s * 0.1, s * 0.32, s * 0.05); c.fill();
  // kepala (lebih besar)
  c.fillStyle = o.skin || '#f2c89b';
  circle(c, 0, -s * 0.82, s * 0.2); c.fill();
  // rambut
  c.fillStyle = o.hair;
  if (o.hairStyle === 'cap') {
    c.beginPath(); c.arc(0, -s * 0.84, s * 0.21, Math.PI, 0); c.fill();
    rr(c, -s * 0.02, -s * 1.0, s * 0.34, s * 0.07, s * 0.03); c.fill();
  } else if (o.hairStyle === 'long') {
    c.beginPath(); c.arc(0, -s * 0.84, s * 0.21, Math.PI, 0); c.fill();
    rr(c, -s * 0.22, -s * 0.88, s * 0.11, s * 0.34, s * 0.05); c.fill();
    rr(c, s * 0.11, -s * 0.88, s * 0.11, s * 0.34, s * 0.05); c.fill();
  } else if (o.hairStyle === 'bun') {
    c.beginPath(); c.arc(0, -s * 0.84, s * 0.21, Math.PI, 0); c.fill();
    circle(c, 0, -s * 1.04, s * 0.08); c.fill();
  } else {
    c.beginPath(); c.arc(0, -s * 0.84, s * 0.21, Math.PI, 0); c.fill();
  }
  // wajah (mata + senyum lebih jelas)
  c.fillStyle = '#2e1a10';
  circle(c, -s * 0.07, -s * 0.82, s * 0.032); c.fill();
  circle(c, s * 0.07, -s * 0.82, s * 0.032); c.fill();
  c.strokeStyle = '#2e1a10'; c.lineWidth = 2;
  c.beginPath(); c.arc(0, -s * 0.78, s * 0.08, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
  c.restore();
}
// papan harga berdiri di depan toko (kanan)
function drawPriceSign(c, x, y, w, h) {
  // papan tulis
  rr(c, x, y, w, h, 10); c.fillStyle = '#A85F2B'; c.fill();
  rr(c, x + 6, y + 6, w - 12, h - 12, 7); c.fillStyle = '#2e1a10'; c.fill();
  text(c, '★ HARGA HARI INI ★', x + w / 2, y + 26, 14, '#FFD84A');
  c.strokeStyle = 'rgba(255,216,74,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 14, y + 44); c.lineTo(x + w - 14, y + 44); c.stroke();
  const items = [
    ['Classic Burger', '35'],
    ['Chicken Burger', '45'],
    ['Double Beef', '60'],
  ];
  items.forEach((it, i) => {
    const iy = y + 68 + i * 36;
    text(c, it[0], x + 16, iy, 13, '#fff3d0', 'left', false);
    text(c, it[1] + ' koin', x + w - 16, iy, 13, '#FFD84A', 'right');
  });
  c.strokeStyle = 'rgba(255,216,74,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + 14, y + h - 24); c.lineTo(x + w - 14, y + h - 24); c.stroke();
  text(c, 'Dibuat segar • Disajikan panas!', x + w / 2, y + h - 12, 11, '#f7e8c8', 'center', false);
  // kaki kayu di bawah papan
  c.fillStyle = '#653719';
  rr(c, x + 14, y + h - 4, 10, 18, 3); c.fill();
  rr(c, x + w - 24, y + h - 4, 10, 18, 3); c.fill();
}
function drawMenu(c, g) {
  // latar depan toko (menggantikan dapur di layar menu)
  drawMenuBackdrop(c);
  overlay(c, 0.15);
  // awning garis-garis di atas papan judul (khas warung burger)
  drawSignAwning(c, 340, 104, 600);
  // papan nama toko (papan judul kayu mengilap)
  glossPanel(c, 340, 130, 600, 150, 18, '#A85F2B', '#653719', '#FFD84A');
  drawLeaf(c, 360, 150, 16, -0.7); drawLeaf(c, 372, 142, 12, -0.2);
  drawLeaf(c, 920, 150, 16, 0.7); drawLeaf(c, 908, 142, 12, 0.2);
  c.fillStyle = '#ffffff'; c.beginPath(); c.arc(400, 166, 20, Math.PI, 0); c.fill();
  circle(c, 382, 162, 10); c.fill(); circle(c, 418, 162, 10); c.fill();
  rr(c, 370, 168, 60, 13, 5); c.fill();
  text(c, "CHEF'S RUSH", 640, 190, 52, '#FFD84A');
  text(c, 'KITCHEN MASTER', 640, 240, 24, '#f7e8c8');
  text(c, 'Terima pesanan • Potong • Goreng • Panggang • Rakit • Sajikan!', 640, 320, 18, '#2e1a10', 'center', false);
  text(c, 'Klik MAIN untuk mulai. P = jeda, M = suara.', 640, 348, 15, '#653719', 'center', false);
  // poster makanan di etalase kiri + kanan
  drawFoodPoster(c, 55, 315, 120, 150, 'burger', 'CLASSIC', 'BURGER!', '#ffe9b0');
  drawFoodPoster(c, 185, 315, 120, 150, 'fries', 'CRISPY', 'FRIES!', '#fff3d0');
  drawFoodPoster(c, 975, 315, 120, 150, 'drink', 'LEMONADE', '& COLA!', '#bfe3f0');
  drawFoodPoster(c, 1105, 315, 120, 150, 'burger', 'DOUBLE', 'BEEF!', '#ffe9b0');
  // antrean pengunjung di depan toko (kiri + kanan, posisi/ukuran bervariasi)
  drawQueuePerson(c, 70, 688, 105, { shirt: '#3f9e4d', hair: '#1a1a1a', hairStyle: 'short' }, g.time);
  drawQueuePerson(c, 150, 694, 100, { shirt: '#e2483d', hair: '#5a3a1a', hairStyle: 'long' }, g.time);
  drawQueuePerson(c, 230, 688, 108, { shirt: '#527DAA', hair: '#1a1a1a', hairStyle: 'cap' }, g.time);
  drawQueuePerson(c, 310, 694, 102, { shirt: '#FFB43B', hair: '#8a8a8a', hairStyle: 'bun' }, g.time);
  drawQueuePerson(c, 900, 690, 104, { shirt: '#7a5ac8', hair: '#2e1a10', hairStyle: 'long' }, g.time);
  drawQueuePerson(c, 965, 694, 100, { shirt: '#36C957', hair: '#1a1a1a', hairStyle: 'short' }, g.time);
  // papan harga berdiri di depan toko (kanan)
  drawPriceSign(c, 1010, 470, 230, 180);
  // tombol main mengilap
  c.fillStyle = 'rgba(20,10,4,0.35)'; rr(c, 493, 405, 300, 70, 35); c.fill();
  const mg = c.createLinearGradient(0, 400, 0, 470);
  mg.addColorStop(0, '#5EE87A'); mg.addColorStop(1, '#1f9e3a');
  rr(c, 490, 400, 300, 70, 35); c.fillStyle = mg; c.fill();
  c.strokeStyle = '#FFD84A'; c.lineWidth = 3; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; rr(c, 500, 405, 280, 16, 8); c.fill();
  text(c, '▶  MAIN', 640, 436, 30, '#ffffff');
  pill(c, 490, 490, 300, 56, '#653719', '#FFD84A');
  c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, 498, 494, 284, 10, 5); c.fill();
  text(c, 'PILIH LEVEL', 640, 519, 20, '#ffffff');
  text(c, 'Koin: ' + g.save.coins + '   •   Level terbuka: ' + g.save.unlocked + '/10', 640, 590, 15, '#653719', 'center', false);
}
function drawSelect(c, g) {
  overlay(c, 0.55);
  text(c, 'PILIH LEVEL', 640, 90, 34, '#FFD84A');
  LEVELS.forEach((lv, i) => {
    const col = i % 5, row = Math.floor(i / 5);
    const x = 190 + col * 190, y = 140 + row * 200;
    const locked = lv.n > g.save.unlocked;
    glossPanel(c, x, y, 170, 180, 14, locked ? '#7189A8' : '#A85F2B', locked ? '#3a4550' : '#653719', locked ? '#a8adb4' : '#FFD84A');
    if (locked) {
      text(c, '🔒', x + 85, y + 70, 40, '#b8bec4');
      text(c, 'LEVEL ' + lv.n, x + 85, y + 120, 16, '#b8bec4');
    } else {
      text(c, 'LEVEL ' + lv.n, x + 85, y + 34, 17, '#FFD84A');
      text(c, lv.name, x + 85, y + 62, 13, '#ffffff', 'center', false);
      text(c, 'Target: ' + lv.target, x + 85, y + 92, 12, '#f7e8c8', 'center', false);
      text(c, 'Waktu: ' + Math.floor(lv.shift / 60) + ':' + String(lv.shift % 60).padStart(2, '0'), x + 85, y + 114, 12, '#f7e8c8', 'center', false);
      const st = g.save.stars[lv.n] || 0;
      for (let k = 0; k < 3; k++) drawStar(c, x + 55 + k * 30, y + 148, 11, k < st ? '#FFD84A' : '#7a6a50');
    }
  });
  pill(c, 490, 600, 300, 56, '#653719', '#FFD84A');
  c.fillStyle = 'rgba(255,255,255,0.2)'; rr(c, 498, 604, 284, 10, 5); c.fill();
  text(c, '← KEMBALI', 640, 629, 18, '#ffffff');
}
function drawPaused(c, g) {
  overlay(c, 0.6);
  text(c, 'JEDA', 640, 300, 48, '#FFD84A');
  text(c, 'Tekan P atau klik untuk lanjut', 640, 360, 18, '#ffffff', 'center', false);
  pill(c, 490, 400, 300, 60, '#36C957', '#FFD84A');
  text(c, '▶  LANJUT', 640, 431, 24, '#ffffff');
}
function drawEnd(c, g, win) {
  overlay(c, 0.62);
  text(c, win ? 'LEVEL SELESAI!' : 'WAKTU HABIS', 640, 130, 44, win ? '#FFD84A' : '#ff5a4d');
  for (let i = 0; i < 3; i++) {
    drawStar(c, 550 + i * 90, 210, 34, i < g.stars ? '#FFD84A' : '#7a6a50');
  }
  text(c, 'Skor: ' + g.score + '  (target ' + g.level.target + ')', 640, 280, 20, '#ffffff');
  text(c, 'Koin didapat: +' + g.coinsEarned + '   •   Total koin: ' + g.save.coins, 640, 312, 16, '#FFD84A', 'center', false);
  if (win) {
    text(c, 'TOKO UPGRADE — klik untuk membeli', 640, 360, 16, '#ffffff');
  }
  pill(c, 340, 600, 220, 56, '#36C957', '#FFD84A');
  text(c, win ? 'LEVEL BERIKUTNYA ▶' : 'COBA LAGI', 450, 629, 18, '#ffffff');
  pill(c, 720, 600, 220, 56, '#653719', '#ffffff');
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
    glossPanel(c, x, y, 200, 130, 12, '#A85F2B', '#653719', afford ? '#FFD84A' : '#d18a2e');
    text(c, up.name, x + 100, y + 26, 15, '#ffffff');
    text(c, up.desc, x + 100, y + 52, 11, '#f7e8c8', 'center', false);
    text(c, 'Lv ' + lvl + '/' + UPGRADE_MAX, x + 100, y + 76, 12, '#FFD84A');
    text(c, maxed ? 'MAKS' : 'Beli: ' + cost + ' koin', x + 100, y + 104, 13, afford ? '#36C957' : '#ff5a4d');
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
    const dp = g.held.burnt ? 115 : g.held.perfect ? 85 : 60;
    recipe.layers.slice(-2).forEach((layer, k) => drawFood(c, layer.item, mx, my - k * 5, 26, dp));
    text(c, recipe.name, mx, my + 40, 11, '#ffffff');
  } else {
    drawFood(c, g.held.item, mx, my, 44, qPct(g.held.quality));
    const label = INGREDIENTS[g.held.item].name + (g.held.process !== 'raw' ? ' (' + g.held.process + ')' : '');
    pill(c, mx - 52, my + 26, 104, 20, 'rgba(20,12,6,0.85)');
    text(c, label, mx, my + 37, 10, '#ffffff');
    if (g.held.quality === 'burnt') text(c, 'GOSONG', mx, my - 30, 11, '#ff5a4d');
    else if (g.held.quality === 'perfect') text(c, '★ PERFECT', mx, my - 30, 11, '#FFD84A');
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
    pill(c, W / 2 - 260, 668, 520, 34, 'rgba(20,12,6,0.88)', '#FFD84A');
    text(c, g.toast.text, W / 2, 686, 14, '#ffffff');
  }
  if (g.screen === 'paused') drawPaused(c, g);
  if (g.screen === 'complete') { drawEnd(c, g, true); drawShop(c, g); }
  if (g.screen === 'gameover') drawEnd(c, g, false);
}
