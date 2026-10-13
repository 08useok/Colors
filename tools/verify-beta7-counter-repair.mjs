import { readFileSync, writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
// Preserve the old targets for this historical, unapplied repair candidate.
const oldCycle = ['red', 'blue', 'chartreuse', 'ivory', 'gold', 'cyan', 'green',
 'azure', 'lavender', 'crimson', 'yellow', 'mint', 'pink', 'purple', 'orange', 'crystal'];
const oldTargets = oldCycle.map((id, index) => ({id, targetWin:oldCycle[(index+1)%oldCycle.length]}));
const before=applyBeta7Balance(BETA_CHARACTERS);
const patch={gold:{projectileDamageReduction:715},cyan:{spreadLineRange:10},
 yellow:{electricRange:14,electricSpeed:28},mint:{iceBulletDamage:1000,iceBulletSpeed:28,reloadDuration:.7},
 orange:{bombRange:10},purple:{needleRange:15,vialRange:13}};
const after=structuredClone(before);
for(const [id,stats]of Object.entries(patch))Object.assign(after[id],stats);
const rows=[];
for(const t of oldTargets){
 const a=t.id,b=t.targetWin,row={id:a,target:b,wins:0,losses:0,draws:0,games:0,seconds:0};
 for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<30;seed++)for(const reverse of [false,true]){
  const r=beta6Duel(after,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
  const outcome=r.outcome*(reverse?-1:1);row.wins+=outcome>0?1:0;row.losses+=outcome<0?1:0;row.draws+=outcome===0?1:0;row.games++;row.seconds+=r.time;
 }
 row.winRate=100*(row.wins+row.draws/2)/row.games;row.averageTime=row.seconds/row.games;rows.push(row);
}
console.table(rows.map(({id,target,wins,losses,draws,winRate})=>({id,target,wins,losses,draws,winRate})));
writeFileSync(new URL('../specs/beta7-counter-repair-verification.json',import.meta.url),JSON.stringify({
 level:6,initialCharge:0,repetitions:30,distances:[10,13,16],aimErrors:[.035,.1],seed:20260919,bothOrders:true,
 applied:false,scope:'Candidate comparison only; no live balance changes',
 baseline:before,patch,rows,allTargetEdgesAchieved:rows.every(r=>r.wins===r.games),
},null,2)+'\n');
