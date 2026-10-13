import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { createMainSeasonCombat } from '../src/combat/main-season-combat.js';
import { attackGuide, ultimateGuide } from '../src/config/aim-guides.js';
const definitions = applyBeta7Balance(BETA_CHARACTERS);
for (const [id, d] of Object.entries(definitions)) {
  const parts = ultimateGuide(id, d, { distance: 4, yaw: .7 });
  assert(parts.length, id + ' ultimate preview');
  for (const p of parts) for (const value of Object.values(p)) if (typeof value === 'number') assert(Number.isFinite(value), id);
}
for (const id of ['gold', 'mint', 'azure', 'ivory', 'crystal']) assert(attackGuide(id, definitions[id], { distance: 3 }).length, id);
// At every angle six pellets share one velocity, and retain 0.75 tile spacing.
for (const angle of [0, Math.PI / 2, .7]) {
  const world = createBeta6Combat(definitions, { aimError: 0 });
  const a = world.add('cyan', { automatic: false, next: 0 });
  const b = world.add('red', { automatic: false, x: 7 });
  assert(world.fire(a, b, angle));
  assert.equal(world.projectiles.length, 6);
  world.projectiles.forEach(p => { assert.equal(p.yaw, angle); assert.equal(p.damage, 700); });
  for (let i = 1; i < 6; i++) assert(Math.abs(Math.hypot(world.projectiles[i].x-world.projectiles[i-1].x, world.projectiles[i].z-world.projectiles[i-1].z)-.75) < 1e-9);
}
// A centered stationary target has the same hit count at near and far ranges.
for (const distance of [2, 5, 8]) {
  let amount = 0;
  const world = createBeta6Combat(definitions, { onEvent: e => { if (e.type === 'damage') amount += e.amount; } });
  const a = world.add('cyan', { automatic: false, next: 0 });
  const b = world.add('red', { automatic: false, x: distance, hp: 100000 });
  world.fire(a, b, 0);
  for (let i = 0; i < 60; i++) world.update(1/60);
  assert.equal(amount, 1400);
}
// Ivory uses the manually chosen landing distance even with a nearer enemy.
const position = x => ({ x, y: 0, z: 0 });
const f = (id,x) => ({characterType:id,mesh:{position:position(x)},shadow:{position:{set(){}}},health:definitions[id].maxHealth,maxHealth:definitions[id].maxHealth,ammo:3,yaw:Math.PI/2,isPlayer:true});
const ivory=f('ivory',0),enemy=f('red',1);
const bridge=createMainSeasonCombat(definitions,{fighters:()=>[ivory,enemy],time:()=>0,blocked:()=>false,damage(){},aim:()=>({x:3,z:0})});
assert(bridge.fire(ivory));
assert.equal(bridge.world.projectiles[0].reach,3);
assert.equal(attackGuide('ivory',definitions.ivory,{distance:3})[1].z,3);
assert.equal(ultimateGuide('ivory',definitions.ivory,{distance:4}).filter(p=>p.type==='ring').length,5);
console.log('PASS: 16 ultimate previews, missing basic previews, parallel Cyan spacing/damage at three ranges, Ivory manual landing');
