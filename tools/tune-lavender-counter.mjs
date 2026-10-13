import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS);
Object.assign(base.lavender.special,{chargeRequired:6,rechargePerHit:.15});
const repetitions=process.argv.includes('--extended')?30:3;
const candidates=[{name:'baseline',stats:{}},
 ...[1.1,1.2,1.3,1.4,1.5].map(speed=>({name:`speed${speed}`,stats:{moveSpeedMultiplier:speed}})),
 ...[7000,8000,9000,10000].map(hp=>({name:`hp${hp}`,stats:{maxHealth:hp}})),
 ...[5,4,3,2,1].map(charge=>({name:`charge${charge}`,stats:{},special:{chargeRequired:charge}})),
 {name:'charge3-recharge.075',stats:{},special:{chargeRequired:3,rechargePerHit:.075}},
 {name:'charge2-recharge.05',stats:{},special:{chargeRequired:2,rechargePerHit:.05}},
 ...[7000,8000].map(hp=>({name:`hp${hp}-charge3`,stats:{maxHealth:hp},special:{chargeRequired:3,rechargePerHit:.075}})),
 ...[1.1,1.2,1.3].map(speed=>({name:`speed${speed}-charge3`,stats:{moveSpeedMultiplier:speed},special:{chargeRequired:3}}))];
const rows=[];
for(const candidate of candidates) {
 const config=structuredClone(base);
 Object.assign(config.lavender,candidate.stats);Object.assign(config.lavender.special,candidate.special);
 const row={...candidate,opponents:{}};
 for(const opponent of ['crimson','gold']) {
  let wins=0,draws=0,games=0,casts=0,time=0;
  for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<repetitions;seed++)for(const reverse of [false,true]) {
   const duel=beta6Duel(config,reverse?opponent:'lavender',reverse?'lavender':opponent,{distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
   const outcome=duel.outcome*(reverse?-1:1);wins+=outcome>0?1:0;draws+=outcome===0?1:0;games++;casts+=duel.casts[reverse?1:0];time+=duel.time;
  }
  row.opponents[opponent]={wins,draws,games,winRate:100*(wins+draws/2)/games,casts,averageTime:time/games};
 }
 rows.push(row);
}
console.table(rows.map(r=>({name:r.name,crimson:r.opponents.crimson.winRate,gold:r.opponents.gold.winRate,casts:r.opponents.crimson.casts})));
writeFileSync(new URL('../specs/lavender-counter-candidates.json',import.meta.url),JSON.stringify({level:6,initialCharge:0,repetitions,rows},null,2)+'\n');
