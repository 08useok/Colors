import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const root = new URL('../', import.meta.url);
export function beta6Duel(config, left, right, scenario, seed, mirror = 1, initialCharge = 0) {
  const world = createBeta6Combat(config, {
    seed, aimError: scenario.aimError, bounds: scenario.bounds ?? 40,
    suddenDeath: { start: 30, end: 45, startRadius: 40, endRadius: 8, damagePerSecond: .25 },
  });
  const a = world.add(left, { x: -mirror * scenario.distance / 2, charge: initialCharge });
  const b = world.add(right, { x: mirror * scenario.distance / 2, charge: initialCharge });
  for (let frame = 0; frame < 45 * 60 && a.hp > 0 && b.hp > 0; frame++) world.update(1 / 60);
  assert([a.hp, b.hp, a.x, b.x, a.z, b.z].every(Number.isFinite));
  const healthDifference = a.hp / a.d.maxHealth - b.hp / b.d.maxHealth;
  return {
    outcome: a.hp <= 0 && b.hp <= 0 ? Math.sign(healthDifference) : a.hp <= 0 ? -1 : b.hp <= 0 ? 1 : Math.sign(healthDifference),
    casts: [a.castCount, b.castCount], attacks: [a.attackCount, b.attackCount],
    hp: [a.hp, b.hp], charge: [a.charge, b.charge], distance: Math.hypot(a.x - b.x, a.z - b.z),
    lastDamageKind: [a.lastDamageKind ?? null, b.lastDamageKind ?? null], time: world.time,
  };
}
export function tournament(config, repetitions = 50) {
  const ids = Object.keys(config), matrix = Object.fromEntries(ids.map(id => [id, {}])), casts = Object.fromEntries(ids.map(id => [id, 0]));
  const scenarios = [10, 13, 16].flatMap(distance => [.035, .1].map(aimError => ({ distance, aimError })));
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const a = ids[i], b = ids[j]; let wins = 0, losses = 0, draws = 0;
    for (let s = 0; s < scenarios.length; s++) for (let n = 0; n < repetitions; n++) for (const mirror of [1, -1]) {
      const result = mirror === 1 ? beta6Duel(config, a, b, scenarios[s], 20260919 + s * 10000 + n, 1) : beta6Duel(config, b, a, scenarios[s], 20260919 + s * 10000 + n, -1);
      const outcome = result.outcome * mirror;
      casts[a] += result.casts[mirror === 1 ? 0 : 1]; casts[b] += result.casts[mirror === 1 ? 1 : 0];
      if (outcome > 0) wins++; else if (outcome < 0) losses++; else draws++;
    }
    const games = scenarios.length * repetitions * 2, score = (wins + draws / 2) / games;
    assert.equal(wins + losses + draws, games);
    matrix[a][b] = { wins, losses, draws, games, score };
    matrix[b][a] = { wins: losses, losses: wins, draws, games, score: 1 - score };
  }
  const averages = Object.fromEntries(ids.map(a => [a, Object.values(matrix[a]).reduce((sum, r) => sum + r.score, 0) / (ids.length - 1) * 100]));
  return { repetitions, seed: 20260919, scenarios, games: ids.length * (ids.length - 1) / 2 * scenarios.length * repetitions * 2, averages, matrix, casts };
}
function run() {
  const repetitions = process.argv.includes('--quick') ? 5 : 50;
  const before = tournament(BETA_CHARACTERS, repetitions); console.log('Unpatched beta6 definitions complete.');
  const after = tournament(applyBeta6Balance(), repetitions);
  const targets = JSON.parse(readFileSync(new URL('specs/counter-targets.json', root), 'utf8'));
  const audit = targets.selected.map(r => ({ id: r.id, winTarget: r.targetWin, lossTarget: r.targetLoss,
    winScore: after.matrix[r.id][r.targetWin].score, lossScore: after.matrix[r.id][r.targetLoss].score,
    winCount: Object.values(after.matrix[r.id]).filter(v => v.score === 1).length,
    lossCount: Object.values(after.matrix[r.id]).filter(v => v.score === 0).length }));
  const achieved = audit.every(r => r.winScore === 1 && r.lossScore === 0 && r.winCount === 1 && r.lossCount === 1);
  console.table(Object.keys(BETA_CHARACTERS).map(id => ({ id, before: before.averages[id].toFixed(1), after: after.averages[id].toFixed(1), casts: after.casts[id] })));
  console.table(audit); console.log('Target fully achieved:', achieved);
  if (process.argv.includes('--quick')) return;
  const paths = ['src/config/beta-characters.js', 'src/config/beta6-balance.js', 'src/combat/beta6-combat.js', 'tools/simulate-beta6-balance.mjs'];
  const hashes = Object.fromEntries(paths.map(p => [p, createHash('sha256').update(readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n')).digest('hex')]));
  const report = { model: 'beta6-runtime-bots-v1', initialCharge: 0, achieved, audit, hashes, before, after };
  writeFileSync(new URL('specs/beta6-balance-results.json', root), JSON.stringify(report, null, 2) + '\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) run();
