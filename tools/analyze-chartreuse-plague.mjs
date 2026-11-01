// Chartreuse plague (execute) fairness: how much of Chartreuse's results come from executions,
// and how candidate rules change its matchups. Same 240-game sampling as the beta8 counter check.
// Usage: node tools/analyze-chartreuse-plague.mjs [--out=specs/beta9-chartreuse-plague.json]
import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { BETA8_COUNTER_TARGETS } from '../src/config/beta8-counter-targets.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
import { BETA8_SIMULATION_PROFILE as profile } from './beta8-simulation-profile.mjs';

const base = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const variants = {
  current: {},
  noPlague: { chartreusePlagueChance: 0, chartreuseFocusPlagueChance: 0 },
  executeAtHalf: { chartreusePlagueExecuteRatio: .5 },
  focus15: { chartreuseFocusPlagueChance: .15 },
  executeAtHalfFocus15: { chartreusePlagueExecuteRatio: .5, chartreuseFocusPlagueChance: .15 },
};
const target = BETA8_COUNTER_TARGETS.find(t => t.id === 'chartreuse');
const opponents = Object.keys(base).filter(id => id !== 'chartreuse');
const report = { profile: { distances: profile.distances, aimErrors: profile.aimErrors, seedsPerScenario: profile.seedsPerScenario, gamesPerPair: profile.distances.length * profile.aimErrors.length * profile.seedsPerScenario * 2 }, targetWin: target.targetWin, targetLoss: target.targetLoss, variants: {} };
for (const [name, patch] of Object.entries(variants)) {
  const config = structuredClone(base);
  Object.assign(config.chartreuse, patch);
  const rows = {};
  let total = 0, decisive = 0;
  for (const b of opponents) {
    const row = { wins: 0, losses: 0, draws: 0, games: 0 };
    for (const distance of profile.distances) for (const aimError of profile.aimErrors) for (let n = 0; n < profile.seedsPerScenario; n++) for (const reverse of [false, true]) {
      const scenario = { distance, aimError, bounds: profile.bounds, level: 6 }, seed = 20261025 + n + distance * 1000 + (aimError === .1 ? 10000 : 0);
      const first = reverse ? b : 'chartreuse', second = reverse ? 'chartreuse' : b, mirror = reverse ? -1 : 1;
      const outcome = beta6Duel(config, first, second, scenario, seed, mirror).outcome * mirror;
      row.games++; row.wins += +(outcome > 0); row.losses += +(outcome < 0); row.draws += +(outcome === 0);
    }
    row.score = (row.wins + row.draws / 2) / row.games;
    rows[b] = row; total += row.score;
    if (row.score >= .9 || row.score <= .1) decisive++;
  }
  report.variants[name] = { patch, averageScore: total / opponents.length, decisiveMatchups: decisive, matchups: rows };
  const v = report.variants[name];
  console.log(`${name.padEnd(22)} avg ${(v.averageScore * 100).toFixed(1)}%  vs ${target.targetWin} ${(rows[target.targetWin].score * 100).toFixed(1)}%  vs ${target.targetLoss} ${(rows[target.targetLoss].score * 100).toFixed(1)}%  decisive ${decisive}/16`);
}
const out = process.argv.find(a => a.startsWith('--out='))?.slice(6);
if (out) writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
