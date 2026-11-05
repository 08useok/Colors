// Season 9 Orange: an orange hit charges 10% of the ultimate, each juice hit 5%, and they add up.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = season9Definitions();
assert.deepEqual(defs.orange.ultimateChargeShare, { bomb: .1, juice: .05 });
const step = (w, s) => { for (let i = 0; i < s * 60; i++) w.update(1 / 60); };
const near = (x, y) => Math.abs(x - y) < 1e-9;

{ // Direct hit: orange 10% + the four juices it eats, 5% each = 30%.
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const o = w.add('orange', { automatic: false, team: 'a', x: 0, z: 0 });
  const t = w.add('salmon', { automatic: false, team: 'b', x: 5, z: 0 });
  o.next = 0; w.fire(o, t, 0); step(w, 1.5);
  const ratio = o.charge / o.u.chargeRequired;
  assert(ratio >= .3 - 1e-9 && ratio <= .35 + 1e-9, `direct hit charged ${(ratio * 100).toFixed(1)}%`);
}
{ // Juice only: the orange lands short of the target; one juice reaches it = 5%.
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const o = w.add('orange', { automatic: false, team: 'a', x: 0, z: 0 });
  const t = w.add('salmon', { automatic: false, team: 'b', x: defs.orange.bombRange + 2, z: 0 });
  o.next = 0; w.fire(o, t, 0); step(w, 2);
  assert(near(o.charge / o.u.chargeRequired, .05), `juice hit charged ${(o.charge / o.u.chargeRequired * 100).toFixed(1)}%`);
}
{ // Stacks across targets: two enemies in the splash each count.
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const o = w.add('orange', { automatic: false, team: 'a', x: 0, z: 0 });
  const a = w.add('salmon', { automatic: false, team: 'b', x: defs.orange.bombRange + 2, z: 0 });
  const b = w.add('salmon', { automatic: false, team: 'b', x: defs.orange.bombRange + 1.4, z: 1.4 });
  o.next = 0; w.fire(o, a, 0); step(w, 2);
  assert(o.charge / o.u.chargeRequired >= .1 - 1e-9, `two juice hits charged ${(o.charge / o.u.chargeRequired * 100).toFixed(1)}%`);
}
console.log('PASS Orange charge: orange 10%, juice 5% each, stacking (direct hit 30%).');
