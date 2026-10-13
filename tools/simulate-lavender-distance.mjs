import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const rangePatch=process.argv.includes('--range');
const after=applyBeta7Balance(BETA_CHARACTERS);
Object.assign(after.lavender.special,{chargeRequired:6,rechargePerHit:.15});
if(!rangePatch) Object.assign(after.lavender,{attackRange:6,sprayDuration:.9,sprayTickInterval:.3});
const before=structuredClone(after);
if(rangePatch) Object.assign(before.lavender,{attackRange:6,sprayDuration:.9,sprayTickInterval:.3});
else { before.lavender.sprayDistanceDamageBonus=0; before.lavender.special.slowPercent=.3; }
const rows=[];
for(const [version,config] of [['before',before],['after',after]]) for(const initialCharge of [0,100]) {
 const row={version,initialCharge,games:0,wins:0,draws:0,casts:0,seconds:0,matchups:{}};
 for(const opponent of Object.keys(config).filter(id=>id!=='lavender')) {
  const match={games:0,wins:0,draws:0};
  for(const distance of [10,13,16]) for(const aimError of [.035,.1]) for(let seed=0;seed<3;seed++) for(const reverse of [false,true]) {
   const duel=beta6Duel(config,reverse?opponent:'lavender',reverse?'lavender':opponent,
    {distance,aimError,bounds:40,level:6},20261006+seed,reverse?-1:1,initialCharge);
   const outcome=duel.outcome*(reverse?-1:1);
   match.games++; match.wins+=outcome>0?1:0;match.draws+=outcome===0?1:0;
   row.casts+=duel.casts[reverse?1:0];row.seconds+=duel.time;
  }
  match.winRate=100*(match.wins+match.draws/2)/match.games;
  row.matchups[opponent]=match;row.games+=match.games;row.wins+=match.wins;row.draws+=match.draws;
 }
 row.winRate=100*(row.wins+row.draws/2)/row.games;row.averageTime=row.seconds/row.games;rows.push(row);
}
console.table(rows.map(({version,initialCharge,games,winRate,averageTime,casts})=>({version,initialCharge,games,winRate,averageTime,casts})));
writeFileSync(new URL(rangePatch?'../specs/lavender-range-results.json':'../specs/lavender-distance-results.json',import.meta.url),JSON.stringify({
 scope:'beta season 7, Lavender vs other 15 characters',level:6,repetitions:3,distances:[10,13,16],aimErrors:[.035,.1],seeds:[20261006,20261007,20261008],bothOrders:true,drawScore:.5,
 before:{sprayDamage:before.lavender.sprayDamage,distanceBonus:before.lavender.sprayDistanceDamageBonus,slow:before.lavender.special.slowPercent,range:before.lavender.attackRange,tickInterval:before.lavender.sprayTickInterval,duration:before.lavender.sprayDuration},after:{sprayDamage:after.lavender.sprayDamage,distanceBonus:after.lavender.sprayDistanceDamageBonus,slow:after.lavender.special.slowPercent,range:after.lavender.attackRange,tickInterval:after.lavender.sprayTickInterval,duration:after.lavender.sprayDuration},rows,
},null,2)+'\n');
