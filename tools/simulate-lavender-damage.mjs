import { writeFileSync } from 'node:fs';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';

const base = applyBeta7Balance(BETA_CHARACTERS);
// Preserve the original flat-damage comparison after the distance/slow patch.
base.lavender.sprayDistanceDamageBonus = 0;
base.lavender.special.slowPercent = .3;
Object.assign(base.lavender.special, { chargeRequired: 6, rechargePerHit: .15 });
Object.assign(base.lavender, { attackRange: 6, sprayDuration: .9, sprayTickInterval: .3 });
const opponents = Object.keys(base).filter(id => id !== 'lavender');
const rows = [];
for (const damage of [700, 900, 1100, 1400, 1700, 2000]) {
  const config = structuredClone(base);
  config.lavender.sprayDamage = damage;
  const result = { damage, games: 0, wins: 0, draws: 0, casts: 0, totalTime: 0, matchups: {} };
  for (const opponent of opponents) {
    let wins = 0, draws = 0, games = 0;
    for (const distance of [10, 13, 16]) for (const aimError of [.035, .1]) for (let seed = 0; seed < 3; seed++) for (const reverse of [false, true]) {
      const duel = beta6Duel(config, reverse ? opponent : 'lavender', reverse ? 'lavender' : opponent,
        { distance, aimError, bounds: 40, level: 6 }, 20261006 + seed, reverse ? -1 : 1);
      const outcome = duel.outcome * (reverse ? -1 : 1);
      wins += outcome > 0 ? 1 : 0;
      draws += outcome === 0 ? 1 : 0;
      games++;
      result.casts += duel.casts[reverse ? 1 : 0];
      result.totalTime += duel.time;
    }
    result.matchups[opponent] = { wins, draws, games, winRate: 100 * (wins + draws / 2) / games };
    result.wins += wins; result.draws += draws; result.games += games;
  }
  result.winRate = 100 * (result.wins + result.draws / 2) / result.games;
  result.averageTime = result.totalTime / result.games;
  rows.push(result);
}
console.table(rows.map(({ damage, winRate, averageTime, casts, games }) => ({ damage, winRate, averageTime, casts, games })));
writeFileSync(new URL('../specs/lavender-damage-results.json', import.meta.url), JSON.stringify({
  scope: 'beta season 7, Lavender vs other 15 characters', level: 6, initialCharge: 0,
  appliedDamage: base.lavender.sprayDamage,
  repetitions: 3, distances: [10, 13, 16], aimErrors: [.035, .1], seeds: [20261006, 20261007, 20261008],
  bothOrders: true, drawScore: .5, rows,
}, null, 2) + '\n');
