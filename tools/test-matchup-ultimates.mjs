import assert from 'node:assert/strict';
import { duel } from './simulate-matchups.mjs';
import { CHARACTERS } from '../src/config/characters.js';

const scenario = { distance: 4, aimError: 0.035 };
const totals = { _events: {} };
for (const id of Object.keys(CHARACTERS).filter(id => CHARACTERS[id].ultimate && id !== 'pink')) {
  const diagnostics = { _events: {} };
  // Charged fixtures exercise rare skills; production tournaments still start at zero.
  for (let seed = 1; seed <= 10; seed++) duel(id, 'pink', scenario, seed, 1, true, diagnostics, 100);
  assert(diagnostics[id] > 0, `${id} ultimate never activated`);
  for (const [key, count] of Object.entries(diagnostics._events)) totals._events[key] = (totals._events[key] ?? 0) + count;
}
for (const key of ['guardDamage', 'focusedShot', 'ivoryUltimateZone', 'goldLock', 'concealedTarget', 'dashHit', 'mintFieldTick', 'crimsonHit', 'galeHit']) {
  assert(totals._events[key] > 0, `Missing ultimate behavior: ${key}`);
}
const pink = { _events: {} };
duel('pink', 'orange', scenario, 42, 1, true, pink, 100);
assert.equal(pink.pink ?? 0, 0, 'Pink must not self-revive in 1v1');
const disabled = { _events: {} };
duel('red', 'blue', scenario, 42, 1, false, disabled, 100);
assert.equal(disabled.red ?? 0, 0); assert.equal(disabled.blue ?? 0, 0);
const first = { _events: {} }, second = { _events: {} };
assert.equal(duel('mint', 'cyan', scenario, 42, 1, true, first), duel('mint', 'cyan', scenario, 42, 1, true, second));
assert.deepEqual(first, second);
const noUltBasic = duel('orange', 'purple', scenario, 42, 1, false);
assert.equal(noUltBasic, duel('orange', 'purple', scenario, 42, 1, true));
console.log('Ultimate model checks passed: nine solo skills, team-only Pink exclusion, disabled mode, repeatability, unchanged no-ultimate pair.');
