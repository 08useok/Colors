import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function score(config, left, right, repetitions = 10) {
  let wins = 0, losses = 0, draws = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1);
    const outcome = result.outcome * mirror;
    if (outcome > 0) wins++; else if (outcome < 0) losses++; else draws++;
  }
  return { wins, losses, draws, games: scenarios.length * repetitions * 2 };
}

const rows = [];
for (const range of [9.5]) for (const damageScale of [3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.4, 3.45, 3.5]) {
  const config = applyBeta6Balance();
  Object.assign(config.chartreuse, {
    chartreuseRange: range,
    chartreuseDamage: Math.round(1200 * damageScale),
    chartreuseEnhancedDamage: Math.round(2400 * damageScale),
  });
  const ivory = score(config, 'chartreuse', 'ivory');
  const blue = score(config, 'blue', 'chartreuse');
  rows.push({ range, damageScale, chartVsIvory: `${(ivory.wins / ivory.games * 100).toFixed(1)}%`, blueVsChart: `${(blue.wins / blue.games * 100).toFixed(1)}%`, ivoryWins: ivory.wins, blueWins: blue.wins });
}
console.table(rows.sort((a, b) => b.ivoryWins - a.ivoryWins || b.blueWins - a.blueWins));
