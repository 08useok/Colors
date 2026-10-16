import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const base=applyBeta7Balance(BETA_CHARACTERS), defs=applyBeta8Balance(base), report=[];
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function setup(config, distance){
 const hits=[];
 const world=createBeta6Combat(config,{aimError:0,onEvent:e=>{if(e.type==='damage')hits.push({time:world.time,damage:e.amount});}});
 const a=world.add('lavender',{automatic:false,team:1,next:0});
 const b=world.add('red',{automatic:false,team:2,x:distance,hp:1e6});
 return {world,a,b,hits,step(seconds){for(let i=0;i<Math.round(seconds*240);i++)world.update(1/240);}};
}
for(const [distance,interval,duration,damage] of [[0,.25,.75,1100],[4.5,.375,1.125,1375],[9,.5,1.5,1650]]){
 const q=setup(defs,distance);assert(q.world.fire(q.a,q.b,0));
 q.step(.5);const record=q.world.zones[0].hits.get(q.b.key);
 close(record.until-distance/20,duration);
 q.step(2);
 assert.equal(q.hits.length,3);
 for(let i=1;i<3;i++)close(q.hits[i].time-q.hits[i-1].time,interval);
 for(const hit of q.hits)close(hit.damage,damage);
 close(q.a.charge,1.5);
 report.push({distance,interval,duration,totalDamage:damage*3,charge:q.a.charge,hits:q.hits});
}
// A target entering expired nearby mist must not receive its first delayed tick.
{const q=setup(defs,0);q.b.z=20;q.world.fire(q.a,q.b,0);q.step(1);q.b.z=0;q.step(.5);assert.equal(q.hits.length,0);}
// Leaving and re-entering does not restart the target's short lifetime or hit cap.
{const q=setup(defs,0);q.world.fire(q.a,q.b,0);q.step(.05);q.b.z=20;q.step(.8);q.b.z=0;q.step(.5);assert.equal(q.hits.length,1);}
// Ultimate timing and the main/Season 7 spray retain their previous intervals.
{const q=setup(defs,0);q.a.charge=2;q.world.cast(q.a,q.b);q.step(6);assert.equal(q.hits.length,6);for(let i=1;i<6;i++)assert(Math.abs(q.hits[i].time-q.hits[i-1].time-1)<=1/240+1e-8);close(q.hits[0].damage,975);}
{const q=setup(base,0);q.world.fire(q.a,q.b,0);q.step(2);assert.equal(q.hits.length,3);close(q.hits[1].time-q.hits[0].time,.5);}
assert.equal(base.lavender.sprayCloseTickInterval,undefined);
writeFileSync('specs/lavender-close-ticks-verification.json',JSON.stringify({date:'2026-10-16',report,lateEntryBlocked:true,reentryDoesNotReset:true,ultimateAndMainUnchanged:true},null,2)+'\n');
console.log('PASS: near/mid/far timing and duration, three-hit cap, fixed damage/charge, expiry/reentry, ultimate and main isolation');
