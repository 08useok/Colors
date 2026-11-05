import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const run=(w,s)=>{for(let i=0;i<Math.ceil(s*60);i++)w.update(1/60);};
const setup=(options={})=>{const w=createBeta6Combat(defs,{bounds:30,...options});const a=w.add('salmon',{automatic:false,next:0,team:'a'});return {w,a};};
{
 const {w,a}=setup();const b=w.add('red',{x:7,team:'b',automatic:false,hp:100000});
 const c=w.add('red',{x:8,team:'b',automatic:false,hp:100000});
 assert(w.fire(a,b));assert.equal(a.ammo,4);run(w,.8);assert.equal(b.hp,100000);
 run(w,.1);assert.equal(b.hp,97000);assert.equal(c.hp,99400);assert.equal(a.ammo,5);assert.equal(a.charge,4);
 assert(b.salmonAirborne);assert(!w.fire(b,a));assert(!w.cast(b,a));
 assert.equal(w.hit(a,b,100),100,'airborne targets remain damageable');
 assert(Math.abs(b.salmonAirborne.until-b.salmonAirborne.start-1.2)<1e-9);
 // Advance exactly to the midpoint to verify the larger peak as well as the lock.
 const peakAt=b.salmonAirborne.start+.6;while(w.time<peakAt-1e-9)w.update(Math.min(1/60,peakAt-w.time));assert(Math.abs(b.salmonHeight-4.5)<1e-7);
 run(w,.5);assert(b.salmonAirborne,'still airborne before 1.2 seconds');assert(!w.fire(b,a));
 run(w,.2);assert(!b.salmonAirborne);assert.equal(b.salmonHeight,0);assert(Math.abs(b.x-9)<1e-7);
 assert.equal(b.hp,96300,'captured target takes 600 landing damage');assert.equal(c.hp,99400,'landing does not damage bystanders');
 const landedHp=b.hp,landedCharge=a.charge;run(w,.2);assert.equal(b.hp,landedHp,'landing hits once');assert.equal(a.charge,landedCharge,'landing grants no extra ultimate charge');
}
{
 const {w,a}=setup();assert(w.fire(a,{x:3,z:0}));run(w,.65);assert.equal(w.salmon.floats.length,1);
 assert(w.fire(a,{x:8,z:0}),'recovery ignores shot cooldown');assert.equal(a.ammo,5);assert.equal(w.salmon.floats.length,0);assert.equal(a.charge,0);
 assert(!w.fire(a,{x:3,z:0}));run(w,2);assert(w.fire(a,{x:3,z:0}));run(w,.65);
 a.ammo=0;assert(w.fire(a,{x:8,z:0}));assert.equal(a.ammo,1);
 run(w,10);assert.equal(a.ammo,1,'no automatic reload');
}
{
 const {w,a}=setup();a.charge=20;assert(w.cast(a,{x:5,z:0}));run(w,.7);assert.equal(w.salmon.devices.length,0);run(w,.04);assert.equal(w.salmon.devices.length,8);
 const d=w.salmon.devices[0];assert.equal(w.hit(a,d,1000,true),0,'owner cannot hurt own device');
 const b=w.add('red',{x:d.x,z:d.z,team:'b',automatic:false,hp:100000});run(w,.02);
 assert.equal(d.hp,0);assert(!w.actors.includes(d));assert.equal(w.salmon.devices.length,7,'contact consumes exactly one device immediately');assert.equal(b.hp,97000);assert(b.salmonAirborne);assert.equal(a.charge,0);assert.equal(a.ammo,5);
 assert(Math.abs(b.salmonAirborne.until-b.salmonAirborne.start-1.2)<1e-9);
 run(w,1.3);assert.equal(b.slow,.3);assert(b.slowUntil>w.time);assert.equal(b.hp,96400,'device contact 3000 plus landing 600');
 const charge=b.charge;w.hit(b,w.salmon.devices[0],900,true);assert.equal(b.charge,charge,'device damage grants no charge');run(w,.02);assert.equal(w.salmon.devices.length,6);
 a.hp=0;run(w,.1);assert.equal(w.salmon.devices.length,6,'devices survive owner death');w.clear();assert.equal(w.salmon.devices.length,0);
}
{
 const {w,a}=setup();a.charge=20;assert(!w.fire(a,undefined));assert(!w.cast(a,undefined));w.update(1/60);
 const b=w.add('red',{x:3,team:'b',automatic:false,hp:100000});assert(w.fire(a,b));run(w,.6);assert(b.salmonAirborne);run(w,.2);assert(b.salmonHeight>0);b.hp=0;const hp=b.hp;run(w,1.3);assert.equal(b.hp,hp,'no landing hit on an already dead target');assert.equal(b.salmonHeight,0,'dead target does not retain floating height');assert.equal(b.salmonAirborne,null);
}
{
 const {w,a}=setup({blocked:(x,z)=>x>4&&x<6});a.charge=20;assert(!w.cast(a,{x:5,z:0}));assert.equal(a.charge,20);
 assert(w.fire(a,{x:8,z:0}));run(w,1.1);a.x=7;assert(w.fire(a,{x:8,z:0}));
}
console.log('PASS Salmon: flight, single capture/splash, airborne lock/damage, rewards, recovery at zero ammo, no reload, installation delay, device ownership/destruction/no charge, death persistence, cleanup and invalid placement.');
