import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior),run=(w,s)=>{for(let t=0;t<s-1e-9;t+=1/60)w.update(Math.min(1/60,s-t));};
assert.equal(prior.blue.special.chargeRequired,3);assert.equal(prior.blue.special.rechargePerHit,.33);
{
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('blue',{automatic:false,next:0,team:'a'}),b=w.add('red',{x:5,automatic:false,team:'b',hp:100000});
 for(let hit=1;hit<=5;hit++){a.ammo=3;assert(w.fire(a,b,0));run(w,.4);assert.equal(a.charge,hit*.5);if(hit<5)assert(!w.cast(a,b),'not ready before five basic hits');}
 assert(w.cast(a,b));assert.equal(a.charge,0);w.clear();
}
for(const count of [4,5]){
 const w=createBeta6Combat(defs,{bounds:40}),a=w.add('blue',{automatic:false,team:'a'});let target;
 for(let i=0;i<count;i++)target=w.add('red',{x:3+i*3,automatic:false,team:'b',hp:100000});
 a.charge=a.u.chargeRequired;assert(w.cast(a,target,{angle:0}));run(w,1.5);
 assert.equal(a.charge,count*.5,'each distinct ultimate hit recharges once');assert.equal(a.charge===a.u.chargeRequired,count===5);w.clear();
}
for(const enlarged of [false,true]){
 const config=structuredClone(defs);if(!enlarged)config.blue.bulletHitboxMultiplier=1;
 const w=createBeta6Combat(config,{aimError:0}),a=w.add('blue',{automatic:false,next:0,team:'a'}),b=w.add('red',{x:5,z:.76,automatic:false,team:'b',hp:100000});
 assert(w.fire(a,b,0));run(w,.07);assert(Math.abs(w.projectiles[0].radius-(enlarged ? .22 : .2))<1e-9);run(w,1);assert.equal(b.hp<100000,enlarged,'ten-percent larger edge actually hits');w.clear();
}
assert.equal(defs.blue.bulletKnockback,0);assert.equal(defs.blue.special.damageReduction,.7);
console.log('PASS Blue: five basic hits to charge, five ultimate hits to recycle, distinct-hit protection and 10% hitbox edge behavior; prior season unchanged.');
