// Chef's Rush — bantuan staging untuk screenshot (bukan gameplay).
// Probe memanggil window.__rush.stage('menu'|'select'|'play'|'serve'|'complete'),
// lalu menunggu window.__shotReady.
import { RECIPES, CUSTOMERS } from './config.js';
import { startLevel, patienceOf } from './world.js';

function fakeOrder(g, id, recipeId, cust, patienceFrac) {
  const maxP = patienceOf(g, g.level);
  return { id, recipeId, cust, patience: maxP * patienceFrac, maxPatience: maxP,
    reward: RECIPES[recipeId].price, mood: 'happy', animT: 0 };
}

export function installShots(g) {
  window.__rush = {
    game: g,
    stage(name) {
      window.__shotReady = false;
      if (name === 'menu') {
        g.screen = 'menu';
      } else if (name === 'select') {
        g.screen = 'select';
      } else if (name === 'play') {
        startLevel(g, 1);
        g.timeLeft = 118;
        g.orders = [
          fakeOrder(g, 1, 'classic', 0, 0.7),
          fakeOrder(g, 2, 'chicken', 1, 0.45),
        ];
        g.nextOrderId = 3;
        g.targetOrderId = 1;
        g.grill[0] = { item: 'patty', t: 3.0 };
        g.fry[0] = { item: 'chicken', t: 3.6 };
        g.chop = { item: 'tomato', clicks: 2 };
        g.board = [
          { item: 'bun', process: 'raw', quality: 'raw' },
          { item: 'lettuce', process: 'chop', quality: 'good' },
        ];
        g.score = 120;
      } else if (name === 'serve') {
        startLevel(g, 1);
        g.timeLeft = 96;
        g.orders = [fakeOrder(g, 1, 'classic', 2, 0.8)];
        g.nextOrderId = 2;
        g.targetOrderId = 1;
        g.plates[0] = { recipeId: 'classic', burnt: false, perfect: true };
        g.score = 240;
        g.coinsEarned = 70;
      } else if (name === 'complete') {
        startLevel(g, 1);
        g.score = 520;
        g.coinsEarned = 140;
        g.stars = 2;
        g.screen = 'complete';
      }
      requestAnimationFrame(() => { window.__shotReady = true; });
    },
  };
  window.__shotReady = true;
}
