import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function wins(config, left, right, repetitions = 50) {
  let total = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
    const r = mirror === 1 ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1);
    if (r.outcome * mirror > 0) total++;
  }
  return total;
}
const rows = [];
for (const duration of [.12, .14, .16, .18, .2]) for (const speed of [5, 5.5, 6, 6.5, 7]) for (const forward of [.55, .6, .65, .7, .8]) {
  const c = applyBeta6Balance();
  Object.assign(c.crimson, { projectileDodgeDuration: duration, projectileDodgeSpeedMultiplier: speed, projectileDodgeForwardFactor: forward });
  rows.push({ duration, speed, forward, crimsonVsYellow: wins(c, 'crimson', 'yellow'), azureVsCrimson: wins(c, 'azure', 'crimson') });
}
console.table(rows.filter(row => row.crimsonVsYellow === 600 && row.azureVsCrimson === 600).sort((a, b) => a.speed - b.speed || a.duration - b.duration));
