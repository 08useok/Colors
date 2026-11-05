import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);
assert.equal(prior.blue.botAvoidBurstProjectiles,undefined);assert.equal(defs.blue.botAvoidBurstProjectiles,true);
for(const[k,v]of Object.entries({maxHealth:5200,bulletDamage:1080,moveSpeedMultiplier:1,attackCooldown:.3,reloadDuration:.5,projectileDodgeChance:.5,projectileDodgeDuration:.18}))assert.equal(defs.blue[k],v);
assert.equal(defs.blue.special.damageReduction,.7);assert.equal(defs.blue.special.chargeRequired,2.5);assert.equal(defs.orange.bombSplashDamage,1170);
function run(enabled,mode='normal'){
 const c=structuredClone(defs);c.blue.botAvoidBurstProjectiles=enabled;
 const w=createBeta6Combat(c,{seed:17,aimError:0,bounds:20,blocked:mode==='wall'?((x)=>x>2.5&&x<3.5):undefined});
 const b=w.add('orange',{automatic:false,next:0}),a=w.add('blue',{x:6,next:100,automatic:mode!=='manual',frozenUntil:mode==='frozen'?2:0});assert(w.fire(b,a));
 if(mode==='renamed')b.id='testThrower';
 let last={x:a.x,z:a.z};for(let f=0;f<20;f++){w.update(1/60);assert(Math.hypot(a.x-last.x,a.z-last.z)<=8/60+1e-8,'movement stays within normal speed');assert(Math.abs(a.x)<=20&&Math.abs(a.z)<=20);last={x:a.x,z:a.z};}
 const r={x:a.x,z:a.z};w.clear();return r;
}
assert.notDeepEqual(run(true),run(false),'projectile path changes normal movement');assert.deepEqual(run(true,'renamed'),run(true),'uses projectile geometry, not opponent ID');
for(const mode of ['wall','manual','frozen'])assert.deepEqual(run(true,mode),run(false,mode),mode+' unchanged');
console.log('PASS Blue burst geometry, wall occlusion, manual/frozen exclusions, normal speed cap, prior season and preserved stats/50-percent dodge.');
