import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const config = applyBeta6Balance();
const pairs = [['red', 'blue'], ['blue', 'chartreuse'], ['chartreuse', 'ivory'], ['ivory', 'gold'], ['gold', 'cyan'], ['cyan', 'green'], ['green', 'azure'], ['azure', 'crimson'], ['crimson', 'yellow'], ['yellow', 'mint'], ['mint', 'pink'], ['pink', 'purple'], ['purple', 'orange'], ['orange', 'red']];
const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
for (const [left, right] of pairs) {
  let wins = 0, losses = 0, draws = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, left, right, scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, right, left, scenarios[s], 20260919 + s * 10000 + n, -1);
    const outcome = result.outcome * mirror;
    if (outcome > 0) wins++; else if (outcome < 0) losses++; else draws++;
  }
  console.log(`${left} -> ${right}: ${wins}/${wins + losses + draws} (${(wins / 6).toFixed(1)}%), losses=${losses}, draws=${draws}`);
}
