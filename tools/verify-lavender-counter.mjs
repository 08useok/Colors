import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { beta6Duel, atCharacterLevel } from './simulate-beta6-balance.mjs';
const after=applyBeta7Balance(BETA_CHARACTERS),before=structuredClone(after);
Object.assign(before.lavender.special,{chargeRequired:6,rechargePerHit:.15});
const rows=[];
for(const [version,config] of [['before',before],['after',after]]) for(const opponent of ['crimson','gold','azure']) {
 const row={version,opponent,wins:0,losses:0,draws:0,games:0,casts:0,seconds:0};
 for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<30;seed++)for(const reverse of [false,true]) {
  const duel=beta6Duel(config,reverse?opponent:'lavender',reverse?'lavender':opponent,
   {distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
  const outcome=duel.outcome*(reverse?-1:1);row.wins+=outcome>0?1:0;row.losses+=outcome<0?1:0;row.draws+=outcome===0?1:0;row.games++;
  row.casts+=duel.casts[reverse?1:0];row.seconds+=duel.time;
 }
 row.winRate=100*(row.wins+row.draws/2)/row.games;row.averageTime=row.seconds/row.games;rows.push(row);
}
function trace(config,opponent){
 const events=[];
 const world=createBeta6Combat(atCharacterLevel(config,6),{seed:20280919,aimError:.035,bounds:40,suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},
  onEvent(e){if(['damage','ultimate','attack'].includes(e.type))events.push({type:e.type,time:e.time,owner:e.owner.id,target:e.target?.id,damage:e.amount??0,distance:e.target?Math.hypot(e.owner.x-e.target.x,e.owner.z-e.target.z):null,charge:e.owner.charge});}});
 const a=world.add('lavender',{x:-6.5}),b=world.add(opponent,{x:6.5});
 for(let i=0;i<45*60&&a.hp>0&&b.hp>0;i++)world.update(1/60);
 return {hp:[a.hp,b.hp],time:world.time,casts:[a.castCount,b.castCount],attacks:[a.attackCount,b.attackCount],damageHits:events.filter(e=>e.type==='damage').length,events};
}
console.table(rows);
const traces=Object.fromEntries(['crimson','gold'].map(id=>[id,{before:trace(before,id),after:trace(after,id)}]));
console.table(Object.entries(traces).flatMap(([opponent,versions])=>Object.entries(versions).map(([version,r])=>({opponent,version,time:r.time,hpLavender:r.hp[0],hpEnemy:r.hp[1],casts:r.casts.join('/'),firstHit:r.events.find(e=>e.type==='damage')?.time}))));
writeFileSync(new URL('../specs/lavender-counter-results.json',import.meta.url),JSON.stringify({level:6,initialCharge:0,repetitions:30,distances:[10,13,16],aimErrors:[.035,.1],bothOrders:true,bounds:40,rows,traces},null,2)+'\n');
assert.equal(rows.find(r=>r.version==='after'&&r.opponent==='crimson').losses,0,'Crimson target loses none in tested conditions');
assert.equal(rows.find(r=>r.version==='after'&&r.opponent==='crimson').draws,0,'Crimson target wins all tested games');
assert.equal(rows.find(r=>r.version==='after'&&r.opponent==='azure').wins,0,'Azure target beats Lavender in tested conditions');
assert.equal(rows.find(r=>r.version==='after'&&r.opponent==='azure').draws,0,'Azure target has no draws');
