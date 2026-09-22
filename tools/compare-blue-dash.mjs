import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const scenarios = [4, 10, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));

function compare(dashAwayFromTarget) {
  const config = applyBeta6Balance();
  config.blue.dashAwayFromTarget = dashAwayFromTarget;
  let wins = 0, losses = 0, draws = 0, casts = 0;
  for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < 50; n++) for (const mirror of [1, -1]) {
    const result = mirror === 1
      ? beta6Duel(config, 'blue', 'chartreuse', scenarios[s], 20260919 + s * 10000 + n, 1)
      : beta6Duel(config, 'chartreuse', 'blue', scenarios[s], 20260919 + s * 10000 + n, -1);
    const outcome = result.outcome * mirror;
    casts += result.casts[mirror === 1 ? 0 : 1];
    if (outcome > 0) wins++;
    else if (outcome < 0) losses++;
    else draws++;
  }
  return { mode: dashAwayFromTarget ? 'escape' : 'forward', wins, losses, draws, score: (wins + draws / 2) / 600, casts };
}

console.table([compare(true), compare(false)].map(r => ({ ...r, score: `${(r.score * 100).toFixed(1)}%` })));
