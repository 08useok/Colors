import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {beta6Duel,atCharacterLevel} from './simulate-beta6-balance.mjs';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const config=applyBeta7Balance(BETA_CHARACTERS), losses=[]; delete config.crystal.botAimLeadFactor;
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError})));
for(let s=0;s<6;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]){
 const seed=20260919+s*10000+n,scenario=scenarios[s],ids=mirror===1?['red','crystal']:['crystal','red'];
 const result=beta6Duel(config,...ids,scenario,seed,mirror);
 if(result.outcome*mirror<=0)continue;
 const events=[],snapshots=[];
 const world=createBeta6Combat(atCharacterLevel(config),{seed,aimError:scenario.aimError,bounds:40,suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},onEvent(e){if(['damage','analysis','analysisExecute','analysisReleased','ultimate'].includes(e.type))events.push({time:e.time,type:e.type,owner:e.owner?.id,target:e.target?.id,amount:e.amount,targetHP:e.target?.hp,guardUntil:e.target?.guardUntil});}});
 const a=world.add(ids[0],{x:-mirror*scenario.distance/2}),b=world.add(ids[1],{x:mirror*scenario.distance/2});
 for(let frame=0;frame<2700&&a.hp>0&&b.hp>0;frame++){world.update(1/60);if(frame%60===0)snapshots.push({time:world.time,actors:[a,b].map(p=>({id:p.id,hp:p.hp,x:p.x,z:p.z,charge:p.charge,lockUntil:p.lockUntil,guardUntil:p.guardUntil,analysis:!!p.analysisTarget}))});}
 losses.push({seed,scenario,mirror,result,events,snapshots});
}
writeFileSync('specs/crystal-red-loss-trace.json',JSON.stringify({losses},null,2)+'\n');
console.log(JSON.stringify(losses,null,2));
