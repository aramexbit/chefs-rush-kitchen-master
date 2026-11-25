// Chef's Rush — suara sintetis Web Audio (tanpa file eksternal).
// Semua bunyi dibuat dari osilator/noise; game tetap jalan tanpa audio.

let ctx = null;
let muted = false;

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function ac() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.10, freq = 1200, when = 0) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const t = c.currentTime + when;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
  const g = c.createGain(); g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f); f.connect(g); g.connect(c.destination);
  src.start(t);
}

export const sfx = {
  click() { tone(660, 0.06, 'square', 0.05); },
  pick() { tone(520, 0.07, 'sine', 0.09); tone(780, 0.07, 'sine', 0.07, 0.05); },
  chop() { noise(0.09, 0.16, 900); tone(180, 0.08, 'triangle', 0.10); },
  place() { tone(300, 0.08, 'triangle', 0.10); noise(0.05, 0.06, 500); },
  sizzle() { noise(0.25, 0.05, 3200); },
  ding() { tone(880, 0.18, 'sine', 0.12); tone(1320, 0.22, 'sine', 0.08, 0.08); },
  coin() { tone(988, 0.09, 'sine', 0.11); tone(1319, 0.16, 'sine', 0.11, 0.07); },
  error() { tone(160, 0.18, 'sawtooth', 0.09); tone(120, 0.22, 'sawtooth', 0.08, 0.08); },
  pop() { tone(440, 0.08, 'sine', 0.09); tone(660, 0.10, 'sine', 0.08, 0.06); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.11, i * 0.11)); },
  lose() { [392, 330, 262].forEach((f, i) => tone(f, 0.25, 'triangle', 0.10, i * 0.14)); },
};
