import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS);
const applied=base.ivory.iceCreamRange===9;
base.ivory.iceCreamRange=6; // Frozen pre-change baseline.
const ranged=structuredClone(base);ranged.ivory.iceCreamRange=9;
const combined=structuredClone(ranged);
Object.assign(combined.gold,{stage1Damage:2000,stage2Damage:1000,stage3Damage:500,ultimateChargeRequired:7});
combined.gold.ultimate.chargeRequired=7;
const rows=[];
function pair(config,opponent) {
 const ids=Object.keys(config),first=ids.indexOf('ivory')<ids.indexOf(opponent)?'ivory':opponent;
 const second=first==='ivory'?opponent:'ivory';
 const row={wins:0,losses:0,draws:0,games:0};
 const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
 for(let s=0;s<6;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]) {
  const a=mirror===1?first:second,b=mirror===1?second:first;
  const r=beta6Duel(config,a,b,scenarios[s],20260919+s*10000+n,mirror);
  const outcome=r.outcome*(a==='ivory'?1:-1);
  row.wins+=outcome>0;row.losses+=outcome<0;row.draws+=outcome===0;row.games++;
 }
 row.winRate=100*(row.wins+.5*row.draws)/row.games;return row;
}
for(const opponent of Object.keys(base).filter(id=>id!=='ivory')) {
 const before=pair(base,opponent),after=pair(ranged,opponent);
 const withGoldCandidate=opponent==='gold'?pair(combined,opponent):after;
 rows.push({opponent,before,after,withGoldCandidate});
 console.log(opponent,before.winRate.toFixed(2),'→',after.winRate.toFixed(2),opponent==='gold'?`gold candidate ${withGoldCandidate.winRate.toFixed(2)}`:'');
}
const average=k=>rows.reduce((s,r)=>s+r[k].winRate,0)/rows.length;
const report={scope:'beta7',level:6,seed:20260919,repetitions:30,games:11160,applied,patch:{ivory:{iceCreamRange:9}},goldCandidateApplied:false,goldCandidate:{stage1Damage:2000,stage2Damage:1000,stage3Damage:500,ultimateChargeRequired:7},beforeConfig:base,afterConfig:ranged,rows,averages:{before:average('before'),after:average('after'),withGoldCandidate:average('withGoldCandidate')}};
writeFileSync(new URL('../specs/ivory-range-9-comparison.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log('AVERAGES',JSON.stringify(report.averages));
