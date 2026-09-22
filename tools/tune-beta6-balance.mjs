// Bounded stat search. The target table is used only for evaluation, never combat.
import { readFileSync, writeFileSync } from 'node:fs';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { beta6Duel, tournament } from './simulate-beta6-balance.mjs';
const root = new URL('../', import.meta.url), start = applyBeta6Balance(), ids = Object.keys(start);
const target = JSON.parse(readFileSync(new URL('specs/counter-targets.json', root), 'utf8')).targets;
const repetitions = 5, scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
function error(matrix) {
  let value = 0;
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j], score = matrix[a][b].score;
    if (typeof target[a][b] === 'number') value += (score - target[a][b]) ** 2;
  }
  return value;
}
function changedPairs(config, id, matrix) {
  const next = structuredClone(matrix);
  for (const other of ids.filter(x => x !== id)) {
    const [a, b] = ids.indexOf(id) < ids.indexOf(other) ? [id, other] : [other, id];
    let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      const result = mirror === 1 ? beta6Duel(config, a, b, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, b, a, scenarios[s], 20260919 + s * 10000 + n, -1);
      const r = result.outcome * mirror;
      if (r > 0) wins++; else if (r < 0) losses++; else draws++;
    }
    const score = (wins + draws / 2) / 60;
    next[a][b] = { wins, losses, draws, games: 60, score }; next[b][a] = { wins: losses, losses: wins, draws, games: 60, score: 1 - score };
  }
  return next;
}
let config = structuredClone(start), matrix = tournament(config, repetitions).matrix, currentError = error(matrix);
const initialError = currentError, accepted = [], trials = [];
for (let round = 0; round < 14; round++) {
  let best = null;
  for (const id of ids) {
    const damageFields = Object.keys(start[id]).filter(k => /Damage$|^poisonDPS$/.test(k) && !k.startsWith('ultimate') && typeof start[id][k] === 'number');
    for (const group of ['health', 'damage']) for (const factor of [.6, .75, .85, 1.1, 1.25, 1.5, 1.8]) {
      const candidate = structuredClone(config), patch = {};
      for (const key of group === 'health' ? ['maxHealth'] : damageFields) patch[key] = Math.round(start[id][key] * factor);
      if (patch.attackDamage && start[id].attackDamages) patch.attackDamages = start[id].attackDamages.map(v => Math.round(v * factor));
      if (Object.keys(patch).every(key => JSON.stringify(config[id][key]) === JSON.stringify(patch[key]))) continue;
      Object.assign(candidate[id], patch);
      const result = changedPairs(candidate, id, matrix), score = error(result);
      trials.push({ round, id, group, factor, error: score });
      if (score < currentError - 1e-9 && (!best || score < best.score)) best = { candidate, result, score, id, patch };
    }
  }
  if (!best) break;
  config = best.candidate; matrix = best.result; currentError = best.score;
  accepted.push({ id: best.id, patch: best.patch, error: best.score });
  console.log('Round', round + 1, JSON.stringify(accepted.at(-1)));
}
const patches = {};
for (const id of ids) for (const key of Object.keys(config[id])) if (JSON.stringify(config[id][key]) !== JSON.stringify(start[id][key])) (patches[id] ??= {})[key] = config[id][key];
writeFileSync(new URL('specs/beta6-tuning-trials.json', root), JSON.stringify({ seed: 20260919, repetitions, scenarios, initialError, finalError: currentError, accepted, patches, trials }, null, 2) + '\n');
console.log('Selected patches', JSON.stringify(patches, null, 2));
