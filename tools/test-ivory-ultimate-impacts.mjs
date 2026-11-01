// Season 9 rule: Ivory's five overlapping Group Order impacts damage each target once per cast;
// the lingering fields stay non-stacking (one tick per second).
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const impact = Math.round(defs.ivory.iceCreamDamage * defs.ivory.ultimate.damageMultiplier);
const tick = Math.round(defs.ivory.iceCreamZoneDamage * defs.ivory.ultimate.damageMultiplier);
for (const [ox, oz] of [[0, 0], [2.475, 2.475], [3.5, 0], [6, 0]]) {
  const log = [];
  const w = createBeta6Combat(defs, { bounds: 40, onEvent: e => { if (e.type === 'damage' && e.target.id === 'red') log.push({ t: w.time, amount: Math.round(e.amount) }); } });
  const ivory = w.add('ivory', { automatic: false, team: 'a', x: -10, z: 0, next: 0 });
  const t = w.add('red', { automatic: false, team: 'b', x: ox, z: oz, hp: 1e6 }); t.d = { ...t.d, maxHealth: 1e6 };
  ivory.charge = ivory.u.chargeRequired;
  assert(w.cast(ivory, t, { angle: 0, point: { x: 0, z: 0 } }));
  for (let i = 0; i < 60 * 1.2; i++) w.update(1 / 60);
  assert.deepEqual(log.map(e => e.amount), [impact], `one impact at (${ox}, ${oz})`);
  for (let i = 0; i < 60 * 3; i++) w.update(1 / 60);
  assert(log.slice(1).every(e => e.amount === tick), 'field ticks');
  for (let i = 2; i < log.length; i++) assert(log[i].t - log[i - 1].t > .9, 'fields do not stack');
}
{
  // Two separate casts still each hit once.
  const log = [];
  const w = createBeta6Combat(defs, { bounds: 40, onEvent: e => { if (e.type === 'damage' && e.target.id === 'red' && e.amount === impact) log.push(e); } });
  const ivory = w.add('ivory', { automatic: false, team: 'a', x: -10, z: 0, next: 0 });
  const t = w.add('red', { automatic: false, team: 'b', x: 0, z: 0, hp: 1e6 }); t.d = { ...t.d, maxHealth: 1e6 };
  for (let n = 0; n < 2; n++) { ivory.charge = ivory.u.chargeRequired; assert(w.cast(ivory, t, { angle: 0, point: { x: 0, z: 0 } })); for (let i = 0; i < 60 * 5; i++) w.update(1 / 60); }
  assert.equal(log.length, 2, 'one impact per cast');
}
console.log(`PASS Ivory ultimate: one ${impact} impact per target per cast at centre/diagonal/axis, non-stacking ${tick} field ticks.`);
