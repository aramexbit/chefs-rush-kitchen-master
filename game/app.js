// Chef's Rush — boot: buat game, pasang input, jalankan loop utama.
import { createGame, update } from './world.js?v=13';
import { render } from './render.js?v=13';
import { attachInput } from './input.js?v=13';
import { setMuted, sfx } from './audio.js?v=13';
import { installShots } from './shots.js?v=13';

export function boot() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const g = createGame();
  setMuted(g.save.muted);
  const input = attachInput(canvas, g);
  installShots(g);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(g, dt);
    if (g.fx && sfx[g.fx]) { sfx[g.fx](); g.fx = null; }
    const m = input.mouse();
    render(ctx, g, m.x, m.y);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
