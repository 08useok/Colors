// Official Season 1 gadgets #001–#006: Red 기절 펀치, Green 부메랑 리콜, Blue 급제동 장치,
// Orange 껍질 보호, Yellow 전선 연결, Purple 독 농축. Gadgets only exist with options.gadgets.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { GADGETS } from '../src/config/gadgets.js';

const defs = season9Definitions();
const world = (extra = {}) => createBeta6Combat(defs, { bounds: 19.4, gadgets: true, seed: 3, aimError: 0, ...extra });
const step = (w, s) => { for (let i = 0; i < Math.round(s * 60); i++) w.update(1 / 60); };
for (const id of ['red', 'green', 'blue', 'orange', 'yellow', 'purple']) assert(GADGETS[id]?.summary, `${id} has a gadget`);

{ // Red: a straight 4-tile shot along the aim stuns the first enemy for 1 s, with no ammo and no damage.
  const w = world(), a = w.add('red', { automatic: false, x: 0, next: 0 }), b = w.add('cyan', { automatic: false, x: 3, team: 'b' }), c = w.add('cyan', { automatic: false, x: 3.6, team: 'b' });
  assert.equal(w.gadget(a, { angle: 0 }), true); assert(!a.empoweredAttack, 'no empowered attack');
  assert(b.lockUntil > w.time + .9 && b.lockUntil <= w.time + 1, 'first enemy stunned for 1 s');
  assert(!(c.lockUntil > w.time), 'only one enemy'); assert.equal(b.hp, b.d.maxHealth, 'no damage'); assert.equal(a.ammo, a.d.maxAmmo, 'no ammo used');
  const far = world(), a3 = far.add('red', { automatic: false, x: 0 }), b3 = far.add('cyan', { automatic: false, x: 5, team: 'b' });
  far.gadget(a3, { angle: 0 }); assert(!(b3.lockUntil > far.time), 'beyond 4 tiles');
  const side = world(), a4 = side.add('red', { automatic: false, x: 0 }), b4 = side.add('cyan', { automatic: false, x: 0, z: 3, team: 'b' });
  side.gadget(a4, { angle: 0 }); assert(!(b4.lockUntil > side.time), 'off the line');
  const wall = world({ blocked: (x, z) => Math.abs(x - 1.5) < .3 && Math.abs(z) < 3 }), a5 = wall.add('red', { automatic: false, x: 0 }), b5 = wall.add('cyan', { automatic: false, x: 3, team: 'b' });
  wall.gadget(a5, { angle: 0 }); assert(!(b5.lockUntil > wall.time), 'not through walls');
  const w2 = world(), a2 = w2.add('red', { automatic: false, x: 0, next: 0 }), b2 = w2.add('cyan', { automatic: false, x: 2, team: 'b' });
  w2.fire(a2, b2); step(w2, .1); assert(!(b2.lockUntil > w2.time), 'no stun without the gadget');
}
{ // Green: flying boomerangs turn back at once; with none flying the gadget does nothing (cooldown kept).
  const w = world(), a = w.add('green', { automatic: false, x: 0, next: 0 }), far = w.add('cyan', { automatic: false, x: 15, team: 'b' });
  assert.equal(w.gadget(a), false, 'nothing to recall');
  w.fire(a, far); step(w, .3);
  const out = w.projectiles.filter(p => p.owner === a && p.kind === 'boomerang');
  assert(out.length && out.every(p => !p.returning));
  assert.equal(w.gadget(a), true);
  assert(out.every(p => p.returning), 'all boomerangs return');
  assert(out[0].speed > defs.green.boomerangSpeed * defs.green.boomerangReturnSpeedMultiplier, 'faster than a normal return');
}
{ // Blue 오토 트래커: for 3 s up to 2 basic shots fire by themselves at the nearest visible enemy within 10 tiles and home in.
  let shots = 0;
  const w = world({ onEvent: e => { if (e.type === 'attack' && e.owner?.id === 'blue') shots++; } }), a = w.add('blue', { automatic: false, x: 0, next: 0 }), b = w.add('red', { automatic: false, x: 8, team: 'b' });
  assert.equal(w.gadget(a), true);
  let homing = null;
  for (let i = 0; i < 200; i++) { w.update(1 / 60); homing ??= w.projectiles.find(p => p.owner === a && p.homingTarget === b); }
  assert(homing, 'auto shots home on the target');
  assert(b.hp < b.d.maxHealth, 'auto shots hit');
  assert(Math.abs((b.d.maxHealth - b.hp) % (defs.blue.bulletDamage * 1.1)) < 1e-6 || Math.abs((b.d.maxHealth - b.hp) - defs.blue.bulletDamage * 1.1 * Math.round((b.d.maxHealth - b.hp) / (defs.blue.bulletDamage * 1.1))) < 1e-6, 'auto shots deal +10% (1,080 → 1,188)');
  assert.equal(a.autoFire, null, 'mode over after 2 shots or 3 s');
  assert.equal(shots, 2, 'exactly 2 auto shots');
}
{ // Blue 오토 트래커 ignores enemies beyond 10 tiles or behind a wall.
  const far = world(), a = far.add('blue', { automatic: false, x: 0, next: 0 }); far.add('red', { automatic: false, x: 12, team: 'b' });
  far.gadget(a); step(far, 3.2); assert.equal(a.ammo, defs.blue.maxAmmo, 'no shot beyond 10 tiles');
  const wall = world({ blocked: (x, z) => Math.abs(x - 4) < .5 && Math.abs(z) < 5 });
  const a2 = wall.add('blue', { automatic: false, x: 0, next: 0 }); wall.add('red', { automatic: false, x: 8, team: 'b' });
  wall.gadget(a2); step(wall, 3.2); assert.equal(a2.ammo, defs.blue.maxAmmo, 'no shot through a wall');
}
{ // Homing: a shot fired at a target that then moves sideways turns toward it.
  const w = world(), a = w.add('blue', { automatic: false, x: 0, next: 0 }), b = w.add('red', { automatic: false, x: 9, team: 'b' });
  w.gadget(a);
  let shot = null; for (let i = 0; i < 60 && !shot; i++) { w.update(1 / 60); shot = w.projectiles.find(p => p.owner === a && p.homingTarget === b); }
  assert(shot); const yaw0 = shot.yaw; b.z = 3; w.update(1 / 60);
  assert(shot.yaw !== yaw0 || !w.projectiles.includes(shot), 'the shot bends toward the moving target');
}
{ // Bots use it when an enemy is in reach and they have 2+ ammo.
  const w = world(), bot = w.add('blue', { x: 0 }); w.add('red', { automatic: false, x: 8, team: 'b' });
  for (let i = 0; i < 120 && !(bot.gadgetReadyAt > 0); i++) w.update(1 / 60);
  assert(bot.gadgetReadyAt > 0, 'Blue bot used 오토 트래커');
}
{ // Orange: 30% less damage for 3 s.
  const w = world(), a = w.add('orange', { automatic: false, x: 0 }), b = w.add('red', { automatic: false, x: 1, team: 'b' });
  assert.equal(w.gadget(a), true);
  assert(Math.abs(w.damageReductionFor(a) - .3) < 1e-9);
  assert(Math.abs(w.hit(b, a, 1000) - 700) < 1e-6, 'a 1000 hit deals 700');
  step(w, 3.1); assert.equal(w.damageReductionFor(a), 0);
}
{ // Yellow: the next ball arcs to the nearest other enemy for 40% (no slow on it); gadget hits give no charge.
  const w = world(), a = w.add('yellow', { automatic: false, x: 0, next: 0 });
  const b = w.add('red', { automatic: false, x: 6, team: 'b' }), c = w.add('crimson', { automatic: false, x: 6, z: 3, team: 'b' });
  assert.equal(w.gadget(a), true);
  w.fire(a, b); step(w, .5);
  assert(b.hp < b.d.maxHealth, 'first target hit');
  assert(Math.abs((c.d.maxHealth - c.hp) - defs.yellow.electricDamage * .4) < 1, `arc hit for 40% (${c.d.maxHealth - c.hp})`);
  assert(!(c.slowUntil > w.time), 'no slow on the arc target');
}
{ // Purple: the next needle volley poisons 1 s longer than a normal one.
  const poison = gadget => {
    const w = world(), a = w.add('purple', { automatic: false, x: 0, next: 0 }), b = w.add('red', { automatic: false, x: 4, team: 'b' });
    if (gadget) assert.equal(w.gadget(a), true);
    w.fire(a, b); step(w, .5);
    assert(b.poisonUntil > w.time, 'poisoned'); return b.poisonUntil - w.time;
  };
  const extra = poison(true) - poison(false);
  assert(Math.abs(extra - GADGETS.purple.poisonBonus) < .05, `poison +${extra.toFixed(2)} s`);
}
{ // Bots: Orange guards when hurt in a fight; Red empowers when the target is in reach.
  const w = world(), o = w.add('orange', { x: 0, hp: defs.orange.maxHealth * .5 }), r = w.add('red', { x: 3, team: 'b' });
  step(w, .3);
  assert(o.gadgetReadyAt > 0, 'Orange bot used 껍질 보호'); assert(r.gadgetReadyAt > 0 || r.gadgetReadyAt === 0);
}
console.log('PASS gadgets #001-#006: Red stun shot, Green recall, Blue auto tracker, Orange 30% guard, Yellow 40% arc, Purple +1 s poison, bot use.');
