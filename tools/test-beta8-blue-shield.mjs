import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const old=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(old);
const advance=(w,seconds)=>{for(let t=0;t<seconds-1e-9;t+=1/60)w.update(Math.min(1/60,seconds-t));};
function setup(){const w=createBeta6Combat(defs,{bounds:40}),a=w.add('blue',{automatic:false,team:'a',hp:100000}),enemy=w.add('red',{x:20,automatic:false,team:'b',hp:100000});a.charge=a.u.chargeRequired;return{w,a,enemy};}
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
{
 const {w,a,enemy}=setup();close(w.hit(enemy,a,1000),1000);assert(w.cast(a,enemy));close(w.damageReductionFor(a),.7);close(w.hit(enemy,a,1000),300);
 advance(w,a.u.motionWindup+.01);assert(a.dash);assert(a.invulnerableUntil<=w.time,'rolling is reduction, not invulnerability');close(w.hit(enemy,a,1000),300);
 advance(w,a.u.duration+.1);assert(!a.dash);close(w.damageReductionFor(a),0);close(w.hit(enemy,a,1000),1000);w.clear();
}
{
 const {w,a,enemy}=setup();w.cast(a,enemy);a.frozenUntil=100;close(w.damageReductionFor(a),0);advance(w,a.u.motionWindup+.1);assert(!a.ultimatePreparing&&!a.dash);close(w.hit(enemy,a,1000),1000);w.clear();
}
{
 const {w,a,enemy}=setup();w.cast(a,enemy);advance(w,a.u.motionWindup+.01);a.dash=null;close(w.damageReductionFor(a),0);close(w.hit(enemy,a,1000),1000);w.clear();
}
{
 const {w,a,enemy}=setup();a.invulnerableUntil=5;w.cast(a,enemy);advance(w,a.u.motionWindup+.01);assert.equal(a.invulnerableUntil,5);assert.equal(w.hit(enemy,a,1000),0,'respawn protection remains separate');w.clear();
}
assert.equal(old.blue.special.damageReduction,undefined);assert.equal(defs.blue.bulletKnockback,0);
console.log('PASS Blue shield: 70% during preparation/rolling, full damage before/after/interruption, no permanent guard, respawn protection retained, basic no-knockback and prior season unchanged.');
