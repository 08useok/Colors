import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../../src/config/beta-characters.js';import {applyBeta7Balance} from '../../src/config/beta7-balance.js';import {applyBeta8Balance} from '../../src/config/beta8-balance.js';import {beta6Duel} from '../simulate-beta6-balance.mjs';
const config=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),rows=[];
for(const noZone of [false,true])for(const bounds of [20,40,49,60,80])for(const distance of [6,10,14,20,28,36]){
 let wins=0,losses=0,draws=0;const samples=[];
 for(const aimError of [.035,.1])for(let n=0;n<10;n++)for(const reverse of [false,true]){const scenario={bounds,distance,aimError,noZone,level:6},seed=20261025+n+distance*1000+(aimError===.1?10000:0),mirror=reverse?-1:1,r=beta6Duel(config,reverse?'orange':'blue',reverse?'blue':'orange',scenario,seed,mirror);wins+=+(r.outcome*mirror>0);losses+=+(r.outcome*mirror<0);draws+=+(r.outcome===0);samples.push(r.outcome*mirror);}
 rows.push({noZone,bounds,side:bounds*2,distance,wins,losses,draws,games:40,outcomes:samples});
}
writeFileSync(new URL('../../specs/beta8-map-sensitivity.json',import.meta.url),JSON.stringify({scope:'Blue vs Orange; independent boundary and spawn distance factors; same seeds across sizes; fixed historical zone and no-zone control',rows},null,2));
console.table(rows.map(({outcomes,...r})=>r));
