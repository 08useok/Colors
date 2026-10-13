import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { beta6Duel, atCharacterLevel } from './simulate-beta6-balance.mjs';
// Reproduce the historical pre-pursuit loss even after live bot tuning changes.
const historical=JSON.parse(readFileSync(new URL('../specs/gold-green-loss-trace.json',import.meta.url),'utf8'));
const config=applyBeta7Balance(BETA_CHARACTERS);
Object.assign(config,{gold:historical.config.gold,green:historical.config.green});
const report={scenarios:[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,noZone:false,walls:false,timeLimit:45,level:6}))),
 repetitions:30,seed:20260919,matrix:{gold:{green:{wins:historical.wins,draws:historical.draws,losses:historical.losses.length}}}};
const losses=[];let wins=0,draws=0;
// Tournament roster order is Green then Gold; retain its creation order and seeds.
for(let s=0;s<report.scenarios.length;s++)for(let n=0;n<report.repetitions;n++)for(const mirror of [1,-1]){
 const scenario=report.scenarios[s],seed=report.seed+s*10000+n;
 const left=mirror===1?'green':'gold',right=mirror===1?'gold':'green';
 const r=beta6Duel(config,left,right,scenario,seed,mirror);
 const goldOutcome=-r.outcome*mirror;
 if(goldOutcome>0)wins++;else if(goldOutcome===0)draws++;else losses.push({scenario,seed,mirror,left,right,result:r});
}
assert.equal(wins,report.matrix.gold.green.wins);
assert.equal(draws,report.matrix.gold.green.draws);
assert.equal(losses.length,report.matrix.gold.green.losses);
for(const loss of losses){
 const events=[],snapshots=[];
 const world=createBeta6Combat(atCharacterLevel(config,6),{seed:loss.seed,aimError:loss.scenario.aimError,bounds:40,
  suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},onEvent(e){
   events.push({type:e.type,time:e.time,owner:e.owner?.id,target:e.target?.id,damage:e.amount,
    ownerHP:e.owner?.hp,targetHP:e.target?.hp,ownerCharge:e.owner?.charge,
    distance:e.owner&&e.target?Math.hypot(e.owner.x-e.target.x,e.owner.z-e.target.z):undefined});
  }});
 const a=world.add(loss.left,{x:-loss.mirror*loss.scenario.distance/2,charge:0});
 const b=world.add(loss.right,{x:loss.mirror*loss.scenario.distance/2,charge:0});
 for(let frame=0;frame<2700&&a.hp>0&&b.hp>0;frame++){
  world.update(1/60);
  if(frame%30===0)snapshots.push({time:world.time,actors:[a,b].map(v=>({id:v.id,hp:v.hp,ammo:v.ammo,charge:v.charge,x:v.x,z:v.z,hidden:world.hidden(v,v===a?b:a),locked:v.lockUntil>world.time})),projectiles:world.projectiles.length});
 }
 assert.deepEqual([a.hp,b.hp],loss.result.hp);
 loss.events=events;loss.snapshots=snapshots;
 loss.damageByOwner=Object.fromEntries(['gold','green'].map(id=>[id,events.filter(e=>e.type==='damage'&&e.owner===id).reduce((sum,e)=>sum+e.damage,0)]));
 console.log(JSON.stringify({scenario:loss.scenario,seed:loss.seed,mirror:loss.mirror,left:loss.left,right:loss.right,result:loss.result,damage:loss.damageByOwner},null,2));
 console.table(events.filter(e=>e.type!=='zoneDamage'));
}
writeFileSync(new URL('../specs/gold-green-loss-trace.json',import.meta.url),JSON.stringify({config:{gold:config.gold,green:config.green},wins,draws,losses},null,2)+'\n');
