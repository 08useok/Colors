import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const base = applyBeta7Balance(BETA_CHARACTERS), snapshot = structuredClone(base), defs = applyBeta8Balance(base);
assert.deepEqual(base, snapshot); assert.equal(base.lavender.sprayDamageBands, undefined);
const report = [];
function setup(config, x) {
 const hits = [];
 const world = createBeta6Combat(config, { aimError: 0, onEvent: e => { if (e.type === 'damage') hits.push({ time: world.time, damage: e.amount }); } });
 const a = world.add('lavender', { automatic: false, team: 1, next: 0 });
 const b = world.add('red', { automatic: false, team: 2, x, hp: 1e6 });
 return { world, a, b, hits, step(seconds) { for (let i=0; i<Math.round(seconds*240); i++) world.update(1/240); } };
}
for (const [distance, damage] of [[0,1100],[1.5,1100],[2.999,1100],[3,1100],[3.001,1375],[4.5,1375],[6,1375],[6.001,1650],[7.5,1650],[9,1650]]) {
 const q = setup(defs, distance); assert(q.world.fire(q.a,q.b,0)); q.step(2.1);
 assert.equal(q.hits.length,3); assert(q.hits.every(hit=>hit.damage===damage)); assert.equal(q.a.charge,1.5);
 report.push({distance,perTick:damage,total:damage*3,hits:q.hits.length});
}
{ const q=setup(defs,9.01);q.world.fire(q.a,q.b,0);q.step(2.1);assert.equal(q.hits.length,0); }
// Recheck each tick against the emitted cloud, not the moving caster.
{ const q=setup(defs,2);q.world.fire(q.a,q.b,0);q.step(.11);q.a.x=20;q.b.x=5;q.step(.3);q.b.x=8;q.step(.4);
 assert.deepEqual(q.hits.map(h=>h.damage),[1100,1375,1650]); }
// A level-scaled base damage must scale all three bands as well.
{ const scaled=structuredClone(defs);scaled.lavender.sprayDamage*=1.1;const q=setup(scaled,5);q.world.fire(q.a,q.b,0);q.step(2.1);assert(q.hits.every(h=>Math.abs(h.damage-1512.5)<1e-7)); }
// Older seasons retain continuous distance damage.
{ const q=setup(base,2);q.world.fire(q.a,q.b,0);q.step(2.1);assert(Math.abs(q.hits[0].damage-1100*(1+.5*2/9))<1e-7); }
writeFileSync('specs/lavender-damage-bands-verification.json',JSON.stringify({report,outsideBlocked:true,perTickBandAndFixedOrigin:true,levelScaling:true,olderSeasonsUnchanged:true},null,2)+'\n');
console.log('PASS: three fixed bands, both exact boundaries, 3-hit/charge cap, per-tick movement, outside range, level scaling and previous-season isolation');
