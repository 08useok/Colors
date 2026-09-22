import assert from 'node:assert/strict';
import { comparisonConfigs } from './compare-season5-season6.mjs';
import { createSeasonDuel } from './season-comparison-model.mjs';
import { duel as originalDuel } from './simulate-matchups.mjs';

const { season5, season6 } = comparisonConfigs();
const baseline = createSeasonDuel(season5);
assert.equal(Object.keys(season5).length, 13);
assert.equal(Object.keys(season6).length, 14);
assert(season6.mint && season6.azure);
for (const id of Object.keys(season5)) {
  if (id !== 'yellow') assert.deepEqual(season5[id], season6[id]);
  else { const { ultimate, ...six } = season6.yellow; assert.deepEqual(six, season5.yellow); }
}
for (const id of Object.keys(season5)) for (const distance of [4, 10, 16]) {
  const scenario = { distance, aimError: 0.035 }, a = { _events: {} }, b = { _events: {} };
  assert.equal(baseline(id, 'pink', scenario, 20260917, 1, true, a), originalDuel(id, 'pink', scenario, 20260917, 1, true, b));
  assert.deepEqual(a, b);
}
const duel = createSeasonDuel(season6), scenario = { distance: 4, aimError: 0.035 };
for (const initialCharge of [0, 100]) {
  const trace = [], diag = { _events: {}, _observe: event => trace.push(event) };
  duel('azure', 'pink', scenario, 1, 1, true, diag, initialCharge);
  let hits = 0;
  for (const event of trace) {
    if (event.event === 'waveStart') hits = 0;
    if (event.event === 'waveHit') assert(++hits <= 1, 'one hit per wave');
    if (event.event === 'waveStep') assert(event.ultimate ? event.ride === 0 : event.ride <= 2 + 1e-10, 'wave ride distance');
  }
  assert(trace.some(e => e.event === 'waveStep'));
  if (initialCharge) assert(diag._events.azureUltimateHit > 0, 'charged ultimate must hit');
  else assert.equal(diag.azure ?? 0, 0, 'no ultimate before seven hits');
}
// Synthetic long-lived opponents validate circuitry independently of short duels.
const fixture = structuredClone(season6);
fixture.yellow.electricDamage = 100;
fixture.yellow.maxHealth = 100000;
fixture.pink.healCircleDamage = 10;
const circuit = { _events: {} };
for (let seed = 1; seed <= 20; seed++) createSeasonDuel(fixture)('yellow', 'pink', scenario, seed, 1, true, circuit, 100);
assert(circuit._events.devicePlaced > 1);
assert(circuit._events.circuitActivated > 0);
assert(circuit._events.circuitHit > 0);
fixture.yellow.electricDamage = 0;
const oneDevice = { _events: {} };
createSeasonDuel(fixture)('yellow', 'pink', scenario, 1, 1, true, oneDevice, 100);
assert.equal(oneDevice._events.devicePlaced, 1);
assert.equal(oneDevice._events.circuitActivated ?? 0, 0);
assert.equal(oneDevice._events.circuitHit ?? 0, 0);
const first = { _events: {} }, second = { _events: {} };
assert.equal(duel('azure', 'mint', scenario, 42, 1, true, first), duel('azure', 'mint', scenario, 42, 1, true, second));
assert.deepEqual(first, second);
console.log('PASS: roster, baseline parity, Azure ride/one-hit/charge, circuit activation, deterministic replay.');
