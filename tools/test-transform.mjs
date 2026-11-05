// Transform (변신): gauge, activation rules, Orange's 15-peel ultimate and Chartreuse's angel mark.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { TRANSFORMS } from '../src/config/transforms.js';

const defs = season9Definitions();
const world = (extra = {}) => createBeta6Combat(defs, { bounds: 19.4, transforms: true, ...extra });
const step = (w, seconds) => { for (let i = 0; i < seconds * 60; i++) w.update(1 / 60); };

{ // Off unless the option is set (main season and balance tools keep the old engine behaviour).
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const a = w.add('orange', { automatic: false });
  assert.equal(a.t, null);
  a.transformCharge = 1; a.charge = a.u.chargeRequired;
  assert.equal(w.transform(a), false);
}
{ // Gauge fills with ultimate charge, at chargeMultiplier ultimates' worth.
  const w = world();
  const a = w.add('chartreuse', { automatic: false, team: 'a', x: 0, z: 0 });
  const b = w.add('red', { automatic: false, team: 'b', x: 3, z: 0 });
  w.hit(a, b, 10, true, a.u.chargeRequired, true);
  assert(Math.abs(a.transformCharge - 1 / TRANSFORMS.chartreuse.chargeMultiplier) < 1e-9, `gauge ${a.transformCharge}`);
  assert.equal(w.transform(a), false, 'needs a full gauge');
  a.transformCharge = 1;
  assert.equal(w.transform(a), true);
  assert.equal(a.transformCharge, 0);
  w.hit(a, b, 10, true, 1);
  assert.equal(a.transformCharge, 0, 'no charge while transformed');
  step(w, TRANSFORMS.chartreuse.duration + .1);
  assert(w.time >= a.transformUntil, 'transform ends');
}
{ // Orange needs its ultimate ready; transformed ultimate throws 15 peels in rows of 1..5.
  const w = world();
  const a = w.add('orange', { automatic: false, team: 'a', x: 0, z: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 8, z: 0 });
  a.transformCharge = 1;
  assert.equal(w.transform(a), false, 'ultimate not ready');
  a.charge = a.u.chargeRequired;
  assert.equal(w.transform(a), true);
  w.cast(a, target, { angle: 0, point: { x: 8, z: 0 } });
  step(w, (a.u.motionWindup ?? 0) + .02);
  const peels = w.projectiles.filter(p => p.kind === 'orangePeel');
  assert.equal(peels.length, 15, `peels ${peels.length}`);
  assert(peels.every(p => p.damage === TRANSFORMS.orange.peelDamage));
  const rows = new Map();
  for (const p of peels) { const ahead = Math.round(Math.cos(p.yaw) * p.reach * 10) / 10; rows.set(ahead, (rows.get(ahead) ?? 0) + 1); }
  assert.deepEqual([...rows.entries()].sort((x, y) => x[0] - y[0]).map(r => r[1]), [1, 2, 3, 4, 5]);
  // Normal ultimate afterwards: back to the usual count.
  const w2 = world();
  const o = w2.add('orange', { automatic: false, team: 'a' }), t2 = w2.add('red', { automatic: false, team: 'b', x: 8 });
  o.charge = o.u.chargeRequired; w2.cast(o, t2, { angle: 0, point: { x: 8, z: 0 } }); step(w2, (o.u.motionWindup ?? 0) + .02);
  assert.equal(w2.projectiles.filter(p => p.kind === 'orangePeel').length, o.u.count);
}
{ // Chartreuse transformed: Heaven rounds mark; a later CC kills the marked enemy.
  const w = world();
  const c = w.add('chartreuse', { automatic: false, team: 'a', x: 0, z: 0 });
  const ally = w.add('raspberry', { automatic: false, team: 'a', x: 0, z: 2 });
  const foe = w.add('salmon', { automatic: false, team: 'b', x: 5, z: 0 });
  c.transformCharge = 1; w.transform(c); c.next = ally.next = 0;
  w.fire(c, foe, 0); step(w, .6);
  assert(w.time < foe.angelMarkUntil, 'Heaven round leaves a mark');
  assert(foe.hp > 0, 'the mark alone does not kill');
  // An ally's vine bind is crowd control.
  w.fire(ally, foe, Math.atan2(foe.z - ally.z, foe.x - ally.x)); step(w, .6);
  assert.equal(foe.hp, 0, 'marked enemy dies to crowd control');
}
{ // Unmarked enemies take CC normally; marks expire.
  const w = world();
  const c = w.add('chartreuse', { automatic: false, team: 'a', x: 0, z: 0 });
  const ally = w.add('raspberry', { automatic: false, team: 'a', x: 0, z: 2 });
  const foe = w.add('salmon', { automatic: false, team: 'b', x: 5, z: 0 });
  c.transformCharge = 1; w.transform(c); c.next = ally.next = 0;
  w.fire(c, foe, 0); step(w, .6 + TRANSFORMS.chartreuse.markDuration);
  const hp = foe.hp;
  w.fire(ally, foe, Math.atan2(foe.z - ally.z, foe.x - ally.x)); step(w, .6);
  assert(foe.hp > 0 && foe.hp < hp, 'expired mark: ordinary hit');
}
{ // Not transformed: Chartreuse fires its usual random rounds, never Heaven.
  const w = world();
  const c = w.add('chartreuse', { automatic: false, team: 'a' }), foe = w.add('red', { automatic: false, team: 'b', x: 30 });
  for (let i = 0; i < 30; i++) { c.ammo = 3; c.next = 0; w.fire(c, foe, 0); step(w, .1); }
  assert(!w.projectiles.some(p => p.kind === 'heaven'));
}
{ // Bots transform on their own in a fight.
  let used = 0;
  for (const id of ['orange', 'chartreuse']) for (let seed = 1; seed <= 6; seed++) {
    const w = world({ seed, onEvent: e => { if (e.type === 'transform') used++; } });
    // Full gauge and ultimate: the bot transforms once an enemy is in reach (Orange then throws 15 peels).
    const bot = w.add(id, { team: 'a', x: -5, z: 0, transformCharge: 1 }); bot.charge = bot.u.chargeRequired; w.add('red', { team: 'b', x: 5, z: 0 }); w.add('pink', { team: 'b', x: 6, z: 3 });
    let most = 0; for (let i = 0; i < 300; i++) { w.update(1 / 60); most = Math.max(most, w.projectiles.filter(p => p.transformed).length); }
    if (id === 'orange') assert.equal(most, 15, 'bot Orange throws the transformed ultimate');
  }
  assert.equal(used, 12, `bots use transform (${used} of 12)`);
}
console.log('PASS transform: gauge, Orange 15 peels in rows 1-5, Chartreuse Heaven mark + CC execute, bots transform, off by default.');
