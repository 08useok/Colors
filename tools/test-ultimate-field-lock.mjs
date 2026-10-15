import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const defs = applyBeta7Balance(BETA_CHARACTERS);
for (const id of ['lavender', 'gold']) {
  const world = createBeta6Combat(defs, {bounds:100, aimError:0});
  const a = world.add(id, {automatic:false, team:1, next:0});
  const b = world.add('red', {automatic:false, team:2, x:2, hp:1e8});
  a.charge = a.u.chargeRequired;
  assert(world.cast(a, b), id + ' initial cast');
  a.charge = a.u.chargeRequired;
  assert(world.ultimateFieldActive(a), id + ' includes installation/flight');
  assert.equal(world.cast(a, b), false, id + ' cannot recast immediately');
  assert.equal(a.charge, a.u.chargeRequired, id + ' rejected cast preserves charge');
  for (let i=0; i<120; i++) world.update(1/60);
  assert(world.ultimateFieldActive(a), id + ' active field');
  assert.equal(world.cast(a, b), false, id + ' cannot stack active field');
  // The lock applies only to the ultimate: basic attacks can still charge it.
  a.charge=0; a.next=0; a.ammo=3;
  assert(world.fire(a, b, 0), id + ' can fire during ultimate');
  for (let i=0; i<60; i++) world.update(1/60);
  assert(a.charge>0, id + ' basic attacks still recharge');
  for (let i=0; i<900; i++) world.update(1/60);
  assert.equal(world.ultimateFieldActive(a), false, id + ' expires');
  a.charge=a.u.chargeRequired;
  assert(world.cast(a, b), id + ' can cast after expiration');
  world.remove(a);
  assert.equal(world.zones.some(z=>z.owner===a), false, id + ' removal clears field');
  console.log('PASS field lock:', id);
}
// Stationary fields and bushes keep their original recast rules.
for (const id of ['mint','ivory','green']) {
 const world=createBeta6Combat(defs,{bounds:100});
 const a=world.add(id,{automatic:false,team:1});
 const b=world.add('red',{automatic:false,team:2,x:2,hp:1e8});
 a.charge=a.u.chargeRequired;assert(world.cast(a,b));
 a.charge=a.u.chargeRequired;
 assert.equal(world.ultimateFieldActive(a),false,id+' excluded even during flight');
 assert(world.cast(a,b),id+' may recast immediately when recharged');
 for(let i=0;i<120;i++)world.update(1/60);
 a.charge=a.u.chargeRequired;
 assert(world.cast(a,b),id+' may recast while field exists');
 console.log('PASS excluded field:',id);
}
// Ordinary Ivory puddles and Lavender's basic spray do not block an ultimate.
for (const id of ['ivory', 'lavender']) {
  const world=createBeta6Combat(defs, {bounds:100});
  const a=world.add(id, {automatic:false,team:1,next:0});
  const b=world.add('red',{automatic:false,team:2,x:2,hp:1e8});
  world.fire(a,b,0);
  for(let i=0;i<60;i++)world.update(1/60);
  assert.equal(world.ultimateFieldActive(a), false);
  a.charge=a.u.chargeRequired;
  assert(world.cast(a,b));
}
// Damage and recharge use the same real zone ticks, independent of basics.
const events=[];
const world=createBeta6Combat(defs,{onEvent:e=>{if(e.type==='damage')events.push(e);}});
const a=world.add('lavender',{automatic:false,team:1,charge:2});
const b=world.add('red',{automatic:false,team:2,x:2,hp:1e8});
assert(world.cast(a,b));
for(let i=0;i<360;i++)world.update(1/60);
assert.equal(events.length,6);
assert(events.every(e=>e.amount===780));
assert.equal(1e8-b.hp,4680);
assert(Math.abs(a.charge-.15)<1e-8);
console.log('PASS Lavender: six 780-damage ticks, total 4680, recharge 0.15');
