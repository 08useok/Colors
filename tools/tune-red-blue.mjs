import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
const rows = [];
for (const speed of [1.8, 2.2, 2.6, 3]) for (const resistance of [.8, 1]) for (const health of [8000, 9800]) {
  const config = applyBeta6Balance();
  Object.assign(config.red, { moveSpeedMultiplier: speed, knockbackResistance: resistance, maxHealth: health });
  let wins = 0, losses = 0, draws = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 10; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, 'red', 'blue', scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, 'blue', 'red', scenarios[s], 20260919 + s * 10000 + n, -1);
    const outcome = result.outcome * mirror;
    if (outcome > 0) wins++; else if (outcome < 0) losses++; else draws++;
  }
  rows.push({ speed, resistance, health, wins, losses, draws, score: `${(wins / 1.2).toFixed(1)}%` });
}
console.table(rows.sort((a, b) => b.wins - a.wins).slice(0, 12));
