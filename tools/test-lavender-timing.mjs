import assert from 'node:assert/strict';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';

const events=[];
const world=createBeta6Combat(BETA_CHARACTERS,{bounds:40,aimError:0,
  onEvent(event){if(event.type==='damage')events.push({target:event.target.key,time:world.time});}});
const lavender=world.add('lavender',{automatic:false,next:0,team:1});
const near=world.add('red',{automatic:false,x:2,hp:10000,team:2});
const far=world.add('red',{automatic:false,x:6,hp:10000,team:2});
const step=()=>world.update(1/60);
assert(world.fire(lavender,far,0));
step();assert.equal(near.hp,10000);assert.equal(far.hp,10000,'no instant full-range damage');
for(let i=0;i<5;i++)step();
assert.equal(near.hp,9300,'2 tiles receives the first tick at 0.1s');
assert.equal(far.hp,10000);
for(let i=0;i<12;i++)step();
assert.equal(far.hp,9300,'6 tiles receives the first tick at 0.3s');
assert.equal(near.hp,9300,'no second tick before 0.4s');
for(let i=0;i<60;i++)step();
assert.equal(near.hp,7900);assert.equal(far.hp,7900);
assert.equal(world.zones.length,0,'spray expires after propagation plus lingering time');
for(const target of [near,far]) {
  const times=events.filter(e=>e.target===target.key).map(e=>e.time);
  assert.equal(times.length,3);
  for(let i=1;i<times.length;i++)assert.ok(Math.abs(times[i]-times[i-1]-.3)<1e-8,'ticks are 0.3s apart');
}

const enteringWorld=createBeta6Combat(BETA_CHARACTERS,{bounds:40,aimError:0});
const caster=enteringWorld.add('lavender',{automatic:false,next:0});
const enemy=enteringWorld.add('red',{automatic:false,x:2,hp:10000});
enteringWorld.fire(caster,enemy,0);
for(let i=0;i<6;i++)enteringWorld.update(1/60);
enemy.z=10;
for(let i=0;i<36;i++)enteringWorld.update(1/60);
assert.equal(enemy.hp,9300,'outside the cloud misses ticks');
enemy.z=0;enteringWorld.update(1/60);
assert.equal(enemy.hp,8600,'re-entry gives one due tick, not a burst');
for(let i=0;i<29;i++)enteringWorld.update(1/60);
assert.equal(enemy.hp,7900,'re-entry shares the same three-hit cap');
console.log('PASS: spray travel time, per-target 0.3s ticks, three-hit cap, exit/re-entry and expiry.');
