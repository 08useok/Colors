import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {BETA7_COUNTER_TARGETS} from '../src/config/beta7-counter-targets.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const repetitions=30;
const chargeRequired=Number(process.argv.find(arg=>arg.startsWith('--charge='))?.split('=')[1]??9);
if(!Number.isInteger(chargeRequired)||chargeRequired<1)throw new Error('Invalid ultimate charge');
const stage1Damage=Number(process.argv.find(arg=>arg.startsWith('--damage='))?.split('=')[1]??2000);
if(!Number.isFinite(stage1Damage)||stage1Damage<=0)throw new Error('Invalid ore damage');
const fragments=process.argv.includes('--scale-fragments');
const profiles={mainStats:applyBeta6Balance(BETA_CHARACTERS),beta7:applyBeta7Balance(BETA_CHARACTERS)};
const reports={};
function pair(config,opponent) {
 const ids=Object.keys(config),first=ids.indexOf('gold')<ids.indexOf(opponent)?'gold':opponent;
 const second=first==='gold'?opponent:'gold';
 const row={wins:0,losses:0,draws:0,games:0,casts:0,seconds:0};
 const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
 for(let s=0;s<scenarios.length;s++)for(let n=0;n<repetitions;n++)for(const mirror of [1,-1]) {
  const a=mirror===1?first:second,b=mirror===1?second:first;
  const result=beta6Duel(config,a,b,scenarios[s],20260919+s*10000+n,mirror);
  const outcome=result.outcome*(a==='gold'?1:-1);
  row.wins+=outcome>0;row.losses+=outcome<0;row.draws+=outcome===0;row.games++;
  row.casts+=result.casts[a==='gold'?0:1];row.seconds+=result.time;
 }
 row.winRate=100*(row.wins+row.draws*.5)/row.games;
 row.castsPerGame=row.casts/row.games;row.averageSeconds=row.seconds/row.games;
 return row;
}
for(const [name,before] of Object.entries(profiles)) {
 const after=structuredClone(before);
 after.gold.stage1Damage=stage1Damage;after.gold.ultimateChargeRequired=chargeRequired;
 if(fragments){after.gold.stage2Damage=stage1Damage/2;after.gold.stage3Damage=stage1Damage/4;}
 // Gold's runtime reads the outer charge field; keep nested display data consistent.
 after.gold.ultimate.chargeRequired=chargeRequired;
 const rows=[];
 for(const opponent of Object.keys(before).filter(id=>id!=='gold')) {
  const baseline=pair(before,opponent),candidate=pair(after,opponent);
  rows.push({opponent,before:baseline,after:candidate});
  console.log(name,opponent,baseline.winRate.toFixed(2),'→',candidate.winRate.toFixed(2));
 }
 const average=key=>rows.reduce((s,r)=>s+r[key].winRate,0)/rows.length;
 const casts=key=>rows.reduce((s,r)=>s+r[key].castsPerGame,0)/rows.length;
 reports[name]={beforeGold:before.gold,afterGold:after.gold,rows,beforeAverage:average('before'),afterAverage:average('after'),beforeCasts:casts('before'),afterCasts:casts('after')};
}
const beta=reports.beta7;
const affectedTargets=BETA7_COUNTER_TARGETS.filter(t=>t.id==='gold'||t.targetWin==='gold').map(t=>{
 const r=beta.rows.find(r=>r.opponent===(t.id==='gold'?t.targetWin:t.id));
 const rate=key=>t.id==='gold'?r[key].winRate:100-r[key].winRate;
 return {...t,before:rate('before'),after:rate('after'),broken:rate('before')===100&&rate('after')<100};
});
const output=fragments?`gold-${stage1Damage}-charge-${chargeRequired}-fragments-comparison.json`:stage1Damage===2000&&chargeRequired===9?'gold-2000-comparison.json':`gold-${stage1Damage}-charge-${chargeRequired}-comparison.json`;
const patch={stage1Damage,ultimateChargeRequired:chargeRequired,...(fragments?{stage2Damage:stage1Damage/2,stage3Damage:stage1Damage/4}:{})};
writeFileSync(new URL(`../specs/${output}`,import.meta.url),JSON.stringify({applied:false,level:6,repetitions,seed:20260919,totalGames:21600,engine:'shared beta6 combat; mainStats is a stats-based proxy, not a main-page runtime test',patch,reports,affectedTargets},null,2)+'\n');
console.log('TARGETS',JSON.stringify(affectedTargets));
console.log('SUMMARY',JSON.stringify(Object.fromEntries(Object.entries(reports).map(([name,r])=>[name,{beforeAverage:r.beforeAverage,afterAverage:r.afterAverage,beforeCasts:r.beforeCasts,afterCasts:r.afterCasts}]))));
