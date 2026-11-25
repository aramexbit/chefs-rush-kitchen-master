// Chef's Rush — input mouse & keyboard (klik semua stasiun, tombol, dan tiket).
import { LEVELS, UPGRADES } from './config.js';
import { L, startLevel, clickBin, clickChop, clickFry, clickGrill, clickBoard,
  clickPlate, clickTrash, clickServe, selectOrder, buyUpgrade, togglePause } from './world.js';
import { sfx, setMuted } from './audio.js';

function inRect(x, y, r) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
function inCircle(x, y, cx, cy, rad) { const dx = x - cx, dy = y - cy; return dx * dx + dy * dy <= rad * rad; }

export function attachInput(canvas, g) {
  let mx = null, my = null;
  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  canvas.addEventListener('mousemove', (e) => { const p = pos(e); mx = p.x; my = p.y; });
  canvas.addEventListener('mouseleave', () => { mx = null; my = null; });
  canvas.addEventListener('click', (e) => {
    const p = pos(e); const x = p.x, y = p.y;
    // tombol global (semua layar)
    if (inRect(x, y, L.muteBtn)) {
      g.save.muted = !g.save.muted;
      setMuted(g.save.muted);
      try { localStorage.setItem('chefs-rush-save-v1', JSON.stringify(g.save)); } catch (err) { /* abaikan */ }
      return;
    }
    if (inRect(x, y, L.pauseBtn)) {
      if (g.screen === 'playing' || g.screen === 'paused') { togglePause(g); sfx.click(); }
      return;
    }
    if (g.screen === 'menu') {
      if (inRect(x, y, { x: 490, y: 400, w: 300, h: 70 })) { sfx.click(); startLevel(g, 1); }
      else if (inRect(x, y, { x: 490, y: 490, w: 300, h: 56 })) { sfx.click(); g.screen = 'select'; }
      return;
    }
    if (g.screen === 'select') {
      for (let i = 0; i < 10; i++) {
        const col = i % 5, row = Math.floor(i / 5);
        const r = { x: 190 + col * 190, y: 140 + row * 200, w: 170, h: 180 };
        if (inRect(x, y, r)) {
          if (i + 1 <= g.save.unlocked) { sfx.click(); startLevel(g, i + 1); }
          else { sfx.error(); }
          return;
        }
      }
      if (inRect(x, y, { x: 490, y: 600, w: 300, h: 56 })) { sfx.click(); g.screen = 'menu'; }
      return;
    }
    if (g.screen === 'paused') {
      if (inRect(x, y, { x: 490, y: 400, w: 300, h: 60 })) { sfx.click(); togglePause(g); }
      return;
    }
    if (g.screen === 'complete' || g.screen === 'gameover') {
      if (g.screen === 'complete') {
        for (let i = 0; i < UPGRADES.length; i++) {
          const r = { x: 340 + i * 220, y: 400, w: 200, h: 130 };
          if (inRect(x, y, r)) {
            if (buyUpgrade(g, UPGRADES[i].id)) sfx.coin(); else sfx.error();
            return;
          }
        }
      }
      if (inRect(x, y, { x: 340, y: 600, w: 220, h: 56 })) {
        sfx.click();
        if (g.screen === 'complete' && g.levelN < 10) startLevel(g, g.levelN + 1);
        else startLevel(g, g.levelN);
        return;
      }
      if (inRect(x, y, { x: 720, y: 600, w: 220, h: 56 })) { sfx.click(); g.screen = 'menu'; return; }
      return;
    }
    if (g.screen !== 'playing') return;
    // ---- layar bermain ----
    for (const b of L.bins) { if (inRect(x, y, b)) { clickBin(g, b.id); return; } }
    if (inRect(x, y, L.chop)) { clickChop(g); return; }
    for (let i = 0; i < 2; i++) {
      const fr = { x: L.fry.x + 34 + i * 128, y: L.fry.y + 52, w: 84, h: 100 };
      if (inRect(x, y, fr)) { clickFry(g, i); return; }
      const gr = { x: L.grill.x + 34 + i * 128, y: L.grill.y + 52, w: 84, h: 100 };
      if (inRect(x, y, gr)) { clickGrill(g, i); return; }
    }
    if (inRect(x, y, L.board)) { clickBoard(g); return; }
    for (let i = 0; i < g.plates.length; i++) {
      const px = L.plates.x + 52 + i * 84, py = L.plates.y + 84;
      if (inCircle(x, y, px, py, 44)) { clickPlate(g, i); return; }
    }
    if (inRect(x, y, L.trash)) { clickTrash(g); return; }
    if (inRect(x, y, L.serve)) { clickServe(g); return; }
    // tiket pesanan (kanan) — pilih target rakitan
    for (let i = 0; i < 3; i++) {
      const r = { x: L.railR.x + 10, y: L.railR.y + 44 + i * 210, w: 244, h: 196 };
      if (inRect(x, y, r) && g.orders[i]) { selectOrder(g, g.orders[i].id); sfx.click(); return; }
    }
    // pelanggan (kiri) — klik pelanggan = pilih pesanannya
    for (let i = 0; i < 3; i++) {
      const r = { x: 10, y: L.railL.y + 44 + i * 210, w: 176, h: 196 };
      if (inRect(x, y, r) && g.orders[i]) { selectOrder(g, g.orders[i].id); sfx.click(); return; }
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') { if (g.screen === 'playing' || g.screen === 'paused') togglePause(g); }
    if (e.key === 'm' || e.key === 'M') {
      g.save.muted = !g.save.muted; setMuted(g.save.muted);
      try { localStorage.setItem('chefs-rush-save-v1', JSON.stringify(g.save)); } catch (err) { /* abaikan */ }
    }
    if (e.key === 'Escape' && g.screen === 'playing') togglePause(g);
  });
  return { mouse: () => ({ x: mx, y: my }) };
}
