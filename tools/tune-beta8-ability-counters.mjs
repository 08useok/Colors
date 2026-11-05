import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const base=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
function score(config,a,b,n=1){let wins=0,count=0;for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let i=0;i<n;i++)for(const reverse of [false,true]){const r=beta6Duel(config,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20261025+i+distance*1000+(aimError===.1?10000:0),reverse?-1:1);wins+=Number(r.outcome*(reverse?-1:1)>0);count++;}return wins/count;}
const azureOptions=[{}, {botApproachMin:2},{botFireRangeFactor:1},{botApproachMin:2,botFireRangeFactor:1},{botApproachMin:1.5,botFireRangeFactor:1,botIdealDistance:1.5}];
const rows=[];
for(const chargeRequired of [.5,1,1.5,2])for(const maxHealth of [6000,7000,8000])for(const azure of azureOptions){
 const d=structuredClone(base);d.lavender.special.chargeRequired=chargeRequired;d.lavender.maxHealth=maxHealth;Object.assign(d.azure,azure);
 const scores=[score(d,'green','azure'),score(d,'azure','lavender'),score(d,'lavender','crimson')];rows.push({patch:{lavender:{maxHealth,special:{chargeRequired}},azure},scores,min:Math.min(...scores),sum:scores.reduce((a,b)=>a+b,0)});
}
rows.sort((a,b)=>b.min-a.min||b.sum-a.sum);
const finalists=rows.slice(0,8);for(const row of finalists){const d=structuredClone(base);d.lavender.maxHealth=row.patch.lavender.maxHealth;Object.assign(d.lavender.special,row.patch.lavender.special);Object.assign(d.azure,row.patch.azure);row.scores=[score(d,'green','azure',10),score(d,'azure','lavender',10),score(d,'lavender','crimson',10)];row.min=Math.min(...row.scores);row.sum=row.scores.reduce((a,b)=>a+b,0);}
finalists.sort((a,b)=>b.min-a.min||b.sum-a.sum);writeFileSync(new URL('../specs/beta8-ability-counter-candidates.json',import.meta.url),JSON.stringify({scope:'not applied',finalists},null,2)+'\n');console.log(JSON.stringify(finalists));
