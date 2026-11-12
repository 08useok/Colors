// Transform balance check, kept apart from 꼬리잡기 (the 240-0 counter cycle is judged without transforms).
// 1v1 like Knockout: best of three rounds (first to 2, draws give no point, at most 5 rounds),
// with transforms on. Ultimate charge and the transform gauge carry over between rounds.
// Same scenarios as the cycle: 6 distances x 2 aim errors x 10 seeds x both orders = 240 matches per pair.
// Pairs that include a transform character are also run with transforms off, to show what the transform changes.
// Usage: node tools/simulate-transform-bo3.mjs   → specs/beta9-transform-bo3.json and a summary table
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { season9CycleConfig } from './beta9-cycle-definitions.mjs';
import { atCharacterLevel, SIMULATION_LEVEL } from './simulate-beta6-balance.mjs';
import { BETA8_SIMULATION_PROFILE as profile } from './beta8-simulation-profile.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { TRANSFORMS } from '../src/config/transforms.js';

const ROUND_SECONDS = 45, WINS_NEEDED = 2, MAX_ROUNDS = 5;

export function transformBo3(config, left, right, scenario, seed, mirror, transforms) {
  const wins = [0, 0], carry = [{ charge: 0, transformCharge: 0 }, { charge: 0, transformCharge: 0 }];
  const transformed = [0, 0];
  let rounds = 0;
  while (rounds < MAX_ROUNDS && wins[0] < WINS_NEEDED && wins[1] < WINS_NEEDED) {
    const world = createBeta6Combat(config, {
      seed: seed + rounds * 7919, aimError: scenario.aimError, bounds: scenario.bounds, transforms, gadgets: false,
      suddenDeath: { start: 30, end: 45, startRadius: 40, endRadius: 8, damagePerSecond: .25 },
    });
    const a = world.add(left, { x: -mirror * scenario.distance / 2, ...carry[0] });
    const b = world.add(right, { x: mirror * scenario.distance / 2, ...carry[1] });
    for (let frame = 0; frame < ROUND_SECONDS * 60 && a.hp > 0 && b.hp > 0; frame++) world.update(1 / 60);
    assert([a.hp, b.hp].every(Number.isFinite));
    const diff = a.hp / a.d.maxHealth - b.hp / b.d.maxHealth;
    const outcome = a.hp <= 0 && b.hp <= 0 ? Math.sign(diff) : a.hp <= 0 ? -1 : b.hp <= 0 ? 1 : Math.sign(diff);
    if (outcome > 0) wins[0]++; else if (outcome < 0) wins[1]++;
    [a, b].forEach((actor, i) => { if (actor.transformUntil > 0) transformed[i]++; carry[i] = { charge: actor.charge, transformCharge: actor.transformCharge }; });
    rounds++;
  }
  return { outcome: Math.sign(wins[0] - wins[1]), wins, rounds, transformed };
}

function pairResult(config, left, right, transforms) {
  const row = { wins: 0, losses: 0, draws: 0, games: 0, rounds: 0, transformRounds: [0, 0] };
  for (const distance of profile.distances) for (const aimError of profile.aimErrors) for (let n = 0; n < profile.seedsPerScenario; n++) for (const reverse of [false, true]) {
    const scenario = { distance, aimError, bounds: profile.bounds };
    const seed = 20261025 + n + distance * 1000 + (aimError === .1 ? 10000 : 0), mirror = reverse ? -1 : 1;
    const first = reverse ? right : left, second = reverse ? left : right;
    const r = transformBo3(config, first, second, scenario, seed, mirror, transforms);
    const o = reverse ? -r.outcome : r.outcome;
    row.games++; row.wins += +(o > 0); row.losses += +(o < 0); row.draws += +(o === 0); row.rounds += r.rounds;
    const [tf, ts] = r.transformed; row.transformRounds[0] += reverse ? ts : tf; row.transformRounds[1] += reverse ? tf : ts;
  }
  row.score = (row.wins + row.draws / 2) / row.games;
  return row;
}

if (process.argv[1]?.endsWith('simulate-transform-bo3.mjs')) {
  const config = atCharacterLevel(season9CycleConfig(), SIMULATION_LEVEL), ids = Object.keys(config);
  const transformIds = ids.filter(id => TRANSFORMS[id]);
  const on = {}, off = {};
  const started = Date.now();
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const l = ids[i], r = ids[j], key = `${l}>${r}`;
    on[key] = pairResult(config, l, r, true);
    if (transformIds.includes(l) || transformIds.includes(r)) off[key] = pairResult(config, l, r, false);
  }
  const score = (table, id) => { let s = 0, n = 0; for (const [key, row] of Object.entries(table)) { const [l, r] = key.split('>'); if (l === id) { s += row.score; n++; } else if (r === id) { s += 1 - row.score; n++; } } return n ? s / n : null; };
  const overall = Object.fromEntries(ids.map(id => [id, +(score(on, id) * 100).toFixed(1)]));
  const vs = id => Object.fromEntries(ids.filter(o => o !== id).map(o => { const k = on[`${id}>${o}`] ? `${id}>${o}` : `${o}>${id}`, flip = !on[`${id}>${o}`];
    const pick = (t) => { const row = t[k]; if (!row) return null; return flip ? `${row.losses}-${row.wins}${row.draws ? '-' + row.draws : ''}` : `${row.wins}-${row.losses}${row.draws ? '-' + row.draws : ''}`; };
    return [o, { transformOn: pick(on), transformOff: pick(off) }]; }));
  const report = { date: new Date().toISOString().slice(0, 10), scope: '1v1 best of three (first to 2, draws no point, max 5 rounds), level 6, transforms on; ultimate and transform gauges carry over; same scenarios as the counter cycle (240 matches per pair); not part of 꼬리잡기',
    transformCharacters: transformIds, overallScore: overall, matchups: Object.fromEntries(transformIds.map(id => [id, vs(id)])), on, off, seconds: Math.round((Date.now() - started) / 1000) };
  writeFileSync(new URL('../specs/beta9-transform-bo3.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(`transform characters: ${transformIds.join(', ')} · ${report.seconds}s`);
  console.table(Object.entries(overall).sort((a, b) => b[1] - a[1]).map(([id, s]) => ({ id, scorePct: s })));
  for (const id of transformIds) console.table(Object.entries(report.matchups[id]).map(([o, v]) => ({ [id]: o, on: v.transformOn, off: v.transformOff })));
}
