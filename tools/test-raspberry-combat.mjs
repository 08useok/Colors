// Raspberry engine rules from specs/characters/raspberry.md.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { RASPBERRY_CHARACTER } from '../src/config/raspberry.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = { ...applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)), raspberry: structuredClone(RASPBERRY_CHARACTER) };
const run = (w, s) => { for (let i = 0; i < Math.round(s * 60); i++) w.update(1 / 60); };
const big = (w, id, x, z = 0, extra = {}) => { const b = w.add(id, { automatic: false, team: 'b', x, z, ...extra }); b.hp = 1e6; b.d = { ...b.d, maxHealth: 1e6 }; return b; };

{
  // Basic: configured vine damage (2,250 since 2026-11-03), 1.6 s bind, straight shot that stops at the first enemy; one sixth of the ultimate.
  const w = createBeta6Combat(defs, { bounds: 40, aimError: 0 });
  const r = w.add('raspberry', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const front = big(w, 'red', 10), back = big(w, 'red', 14);
  assert(w.fire(r, front, 0));
  run(w, .5);
  assert.equal(1e6 - front.hp, defs.raspberry.vineDamage);
  assert.equal(back.hp, 1e6, 'no pierce');
  assert(Math.abs(front.rootUntil - w.time - (1.6 - (w.time - (10 - .6) / 36))) < .1, 'bind about 1.6 s');
  assert(Math.abs(r.charge - 1) < 1e-9, 'full basic charge per hit (6 hits = ultimate)');
}
{
  // Bound actors cannot move or start moving ultimates, but can attack and use in-place ultimates.
  const w = createBeta6Combat(defs, { bounds: 40 });
  const r = w.add('raspberry', { automatic: false, team: 'a', x: -10, z: 0 });
  const blue = w.add('blue', { automatic: true, team: 'b', x: 0, z: 0 });
  const red = w.add('red', { automatic: false, team: 'b', x: 0, z: 3, next: 0 });
  blue.rootUntil = red.rootUntil = w.time + 5;
  const x0 = blue.x, z0 = blue.z;
  run(w, 1);
  assert(Math.hypot(blue.x - x0, blue.z - z0) < 1e-9, 'bound bot does not walk');
  blue.charge = blue.u.chargeRequired; blue.hp = blue.d.maxHealth * .2;
  assert(!w.cast(blue, r, { angle: Math.PI }), 'Blue roll cannot start while bound');
  assert(w.fire(red, r, Math.PI), 'basic attack still allowed');
  run(w, 1);
  red.charge = red.u.chargeRequired;
  assert(w.cast(red, r), 'Red guard (in place) still allowed');
  // Re-bind keeps the later end time.
  const until = blue.rootUntil; w.hit(r, blue, 0); blue.rootUntil = Math.max(blue.rootUntil, w.time + 1);
  assert.equal(blue.rootUntil, until);
}
{
  // Knockback still moves a bound target.
  const w = createBeta6Combat(defs, { bounds: 40 });
  const cyan = w.add('cyan', { automatic: false, team: 'a', x: 0, z: 0 });
  const t = big(w, 'red', 4); t.rootUntil = w.time + 5;
  cyan.charge = cyan.u.chargeRequired;
  assert(w.cast(cyan, t, { angle: 0 }));
  run(w, 1);
  assert(t.x > 4.5, 'knocked back while bound');
}
{
  // Ultimate: 0.4 s warning, then 600 + 2 s bind inside (centre-point rule, boundary included),
  // no effect on airborne, invulnerable or wall-covered enemies, late entrants only slowed,
  // 30% slow after the bind while inside, 4 s total, no self-recharge, survives the caster.
  const wall = (x, z, r = 0) => x + r >= 8.9 && x - r <= 9.1 && Math.abs(z) < 5;
  const w = createBeta6Combat(defs, { bounds: 40, blocked: (x, z, r) => wall(x, z, r) });
  const r = w.add('raspberry', { automatic: false, team: 'a', x: 0, z: 0 });
  const centre = big(w, 'red', 6), edge = big(w, 'red', 9.5 - 3.5 + 3.5 * 0 + 0, 3.5);
  edge.x = 6; edge.z = 3.5; // exactly on the boundary
  const outside = big(w, 'red', 6, 3.6);
  const flying = big(w, 'red', 6.5, -1); flying.airborne = true;
  const shielded = big(w, 'red', 5.5, 1); shielded.invulnerableUntil = w.time + 5;
  const covered = big(w, 'red', 9.4, 0); // centre 6 -> 9.4 crosses the wall at x = 9
  r.charge = r.u.chargeRequired;
  assert(w.cast(r, centre, { point: { x: 6, z: 0 } }));
  assert.equal(r.charge, 0);
  run(w, .3);
  assert.equal(centre.hp, 1e6, 'nothing before 0.4 s');
  assert(w.zones.some(z => z.kind === 'vinePrisonWarning'), 'warning shown');
  run(w, .15);
  assert.equal(1e6 - centre.hp, 600);
  assert.equal(1e6 - edge.hp, 600, 'boundary counts');
  for (const [label, b] of [['outside', outside], ['airborne', flying], ['invulnerable', shielded], ['behind wall', covered]]) assert.equal(b.hp, 1e6, label);
  assert(centre.rootUntil - w.time > 1.8, '2 s bind');
  assert.equal(r.charge, 0, 'ultimate does not recharge itself');
  // Late entrant: slowed, not damaged or bound.
  outside.z = 2; run(w, .1);
  assert.equal(outside.hp, 1e6); assert(!(outside.rootUntil > w.time)); assert(outside.slowUntil > w.time && Math.abs(outside.slow - .3) < 1e-9);
  // After the bind ends the bound target is slowed while inside.
  run(w, 2);
  assert(centre.slowUntil > w.time && Math.abs(centre.slow - .3) < 1e-9);
  // Caster death keeps the field.
  w.hit(centre, r, 1e6); run(w, .5);
  assert(w.zones.some(z => z.kind === 'vinePrison'), 'field outlives caster');
  run(w, 1.5);
  assert(!w.zones.some(z => z.kind === 'vinePrison'), 'field ends after 4 s');
}
{
  // Recast replaces the previous prison.
  const w = createBeta6Combat(defs, { bounds: 40 });
  const r = w.add('raspberry', { automatic: false, team: 'a', x: 0, z: 0 });
  const t = big(w, 'red', 5);
  for (const x of [5, -5]) { r.charge = r.u.chargeRequired; assert(w.cast(r, t, { point: { x, z: 0 } })); run(w, .5); }
  assert.equal(w.zones.filter(z => z.kind === 'vinePrison').length, 1);
}
console.log(`PASS Raspberry: ${defs.raspberry.vineDamage.toLocaleString('en-US')} straight vine with 1.6 s bind and no pierce, 6-hit charge, bound movement/dash rules, knockback while bound, prison warning/centre rule/boundary/air/invulnerable/wall/late entrant/slow/duration/replacement and caster-death persistence.`);
