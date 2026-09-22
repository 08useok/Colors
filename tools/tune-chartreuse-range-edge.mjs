import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function wins(config, left, right) {
  let total = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 10; n++) for (const mirror of [1, -1]) {
    const r = mirror === 1 ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1);
    if (r.outcome * mirror > 0) total++;
  }
  return total;
}
const rows = [];
for (const ivoryRange of [6, 7, 8, 9]) for (const scale of [1, 1.25, 1.5, 2]) {
  const c = applyBeta6Balance(); c.ivory.iceCreamRange = ivoryRange;
  c.chartreuse.chartreuseDamage = Math.round(1200 * scale); c.chartreuse.chartreuseEnhancedDamage = Math.round(2400 * scale);
  rows.push({ ivoryRange, scale, chartVsIvory: wins(c, 'chartreuse', 'ivory'), blueVsChart: wins(c, 'blue', 'chartreuse') });
}
console.table(rows.sort((a, b) => b.chartVsIvory - a.chartVsIvory || b.blueVsChart - a.blueVsChart));
