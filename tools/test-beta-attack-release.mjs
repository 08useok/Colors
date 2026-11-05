import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { BETA_ATTACK_MOTIONS, betaAttackPose } from '../src/config/beta-attack-motion.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { RASPBERRY_CHARACTER } from '../src/config/raspberry.js';
const previous=applyBeta7Balance(BETA_CHARACTERS),snapshot=structuredClone(previous),defs=applyBeta8Balance(previous);
assert.deepEqual(previous,snapshot);
// Raspberry (Season 9 beta) is added by the beta page, not by applyBeta8Balance.
defs.raspberry={...structuredClone(RASPBERRY_CHARACTER),attackWindup:BETA_ATTACK_MOTIONS.raspberry.release};
for(const [id,p]of Object.entries(BETA_ATTACK_MOTIONS)){
 const events=[],world=createBeta6Combat(defs,{aimError:0,onEvent:e=>{if(e.type==='damage'||e.type==='heal')events.push(e);}});
 const a=world.add(id,{automatic:false,next:0,team:1}),target=world.add('red',{automatic:false,team:2,x:1,hp:1e8});
 a.rounds=['enhanced'];assert(world.fire(a,target,0));
 world.update(p.release-.005);
 assert.equal(world.projectiles.length+world.zones.length+events.length,0,id+' must prepare before release');
 for(let i=0;i<5;i++)world.update(.01);
 assert(world.projectiles.length+world.zones.length+events.length>0,id+' must release');
 assert.equal(a.attackCount,1,id+' spends ammo/count once');
 assert.equal(a.ammo,a.d.maxAmmo-1);
 if(previous[id])assert.equal(previous[id].attackWindup,undefined,'old season keeps original timing');
 for(const time of [0,p.release*.4,p.release,p.duration*.8,p.duration]){
  const pose=betaAttackPose(id,time);assert(pose.strength>=-1e-8&&pose.strength<=1+1e-8);
  assert([...pose.arm,...pose.forearm,...pose.leftArm,...pose.leftForearm].every(Number.isFinite));
 }
 // A mode teardown must remove prepared attacks along with their owner.
 const removed=createBeta6Combat(defs);const b=removed.add(id,{automatic:false,next:0}),enemy=removed.add('red',{automatic:false,x:1});
 removed.fire(b,enemy);removed.remove(b);removed.update(.25);assert.equal(removed.projectiles.length+removed.zones.length,0);
}
console.log('PASS: all 16 new basic motions share combat release timing, one ammo consumption, finite poses, queued attack cleanup, and unchanged Season 7 definitions.');
