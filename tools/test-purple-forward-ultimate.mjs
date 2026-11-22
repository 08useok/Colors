// Beta/official Purple 독성 대도약 (11.22): 5000 central damage at takeoff and landing, 16 thorns forward in a 60-degree fan
// that fly until a wall (or the arena edge). Main keeps the beta8 ring (no projectileSpread).
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { applyBeta9Balance } from '../src/config/beta9-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const defs = applyBeta9Balance(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)));
defs.purple.purpleUltimateEnabled = true; defs.purple.ultimate.motionWindup = 0;
const u = defs.purple.ultimate;
assert.equal(u.damage, 5000); assert.equal(u.projectileRange, 60); assert(Math.abs(u.projectileSpread - Math.PI / 3) < 1e-12);
assert.equal(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)).purple.ultimate.projectileSpread, undefined, 'main keeps the ring');
const run = (w, t) => { for (let i = 0; i < Math.round(t * 240); i++) w.update(1 / 240); };
{ // Fan: 16 thorns spread evenly over 60 degrees around the facing direction; central hit is 5000.
  const w = createBeta6Combat(defs, { bounds: 40 });
  const a = w.add('purple', { automatic: false, team: 1, charge: 8 }), near = w.add('red', { automatic: false, team: 2, x: 1, hp: 50000 });
  w.add('red', { automatic: false, team: 2, x: 12, hp: 50000 });
  assert(w.cast(a, near, { point: { x: 12, z: 0 }, angle: 0 }));
  assert.equal(near.hp, 50000 - 5000, 'takeoff central damage 5000');
  const yaws = w.projectiles.filter(p => p.kind === 'purpleThorn').map(p => p.yaw);
  assert.equal(yaws.length, 16);
  const rel = yaws.map(y => Math.atan2(Math.sin(y - a.angle), Math.cos(y - a.angle))).sort((x, y) => x - y);
  assert(Math.abs(rel[0] + Math.PI / 6) < 1e-9 && Math.abs(rel[15] - Math.PI / 6) < 1e-9, 'fan edges at ±30°');
  assert(w.projectiles.every(p => p.kind !== 'purpleThorn' || p.reach === 60));
}
{ // Long reach: a thorn hits an enemy 15 tiles ahead (old range was 10). Far away, enemies can slip between the 4° gaps.
  const w = createBeta6Combat(defs, { bounds: 40 });
  const a = w.add('purple', { automatic: false, team: 1, charge: 8 }), far = w.add('red', { automatic: false, team: 2, x: 15, hp: 50000 });
  assert(w.cast(a, far, { point: { x: 0.1, z: 0 }, angle: 0 }), 'cast'); run(w, 3);
  assert(far.hp < 50000, 'thorns reach 15 tiles');
}
{ // Walls stop the thorns.
  const w = createBeta6Combat(defs, { bounds: 40, blocked: (x, z) => x > 4 && x < 4.6 && Math.abs(z) < 20 });
  const a = w.add('purple', { automatic: false, team: 1, charge: 8 }), b = w.add('red', { automatic: false, team: 2, x: 8, hp: 50000 });
  w.cast(a, b, { point: { x: 0.1, z: 0 }, angle: 0 }); run(w, 2);
  assert.equal(b.hp, 50000, 'no thorn through the wall');
}
{ // Arena edge removes thorns.
  const w = createBeta6Combat(defs, { bounds: 10 });
  const a = w.add('purple', { automatic: false, team: 1, charge: 8 }), b = w.add('red', { automatic: false, team: 2, x: -5, z: 9, hp: 50000 });
  w.cast(a, b, { point: { x: 0.1, z: 0 }, angle: 0 }); run(w, 6);
  assert.equal(w.projectiles.filter(p => p.kind === 'purpleThorn').length, 0, 'thorns leave the arena');
}
console.log('PASS Purple forward thorns: 5000 central damage, 16 thorns in a 60° fan, wall-to-wall reach, walls and arena edge stop them, main keeps the ring.');
