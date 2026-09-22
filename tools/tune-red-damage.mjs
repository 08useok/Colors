import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
const rows = [];
for (const damage of [2341, 2342, 2343, 2344, 2345]) {
  const config = applyBeta6Balance(); config.red.attackDamage = damage;
  let wins = 0, losses = 0, draws = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, 'red', 'blue', scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, 'blue', 'red', scenarios[s], 20260919 + s * 10000 + n, -1);
    const outcome = result.outcome * mirror;
    if (outcome > 0) wins++; else if (outcome < 0) losses++; else draws++;
  }
  rows.push({ damage, wins, losses, draws, score: `${(wins / 6).toFixed(1)}%` });
  if (wins === 600) break;
}
console.table(rows);
