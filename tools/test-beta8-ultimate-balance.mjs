import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const before=applyBeta7Balance(BETA_CHARACTERS), snapshot=structuredClone(before), after=applyBeta8Balance(before);
assert.deepEqual(before,snapshot,'Season 7/main definitions remain unchanged');
const close=(a,b,label)=>assert(Math.abs(a-b)<1e-7,`${label}: ${a} != ${b}`);
function probe(defs,id,ultimate=false) {
  const events=[];
  const world=createBeta6Combat(defs,{bounds:100,aimError:0,seed:123,onEvent:e=>{if(e.type==='damage')events.push(e.amount);}});
  const a=world.add(id,{automatic:false,team:1,next:0});
  const b=world.add('red',{automatic:false,team:2,x:2,hp:1e9});
  world.add('red',{automatic:false,team:1,x:1,hp:1e9});
  a.charge=ultimate?a.u.chargeRequired:0;
  if(!ultimate)a.u={...a.u,chargeRequired:1000};
  a.rounds=['enhanced','enhanced','enhanced'];
  assert(ultimate?world.cast(a,b,{angle:0}):world.fire(a,b,0),id+' cast/fire');
  if(ultimate&&id==='chartreuse')assert(world.fire(a,b,0));
  if(ultimate&&id==='yellow'){
    for(let i=0;i<60;i++)world.update(1/60);
    a.charge=a.u.chargeRequired;
    assert(world.cast(a,b,{point:{x:6,z:0}}));
    for(let i=0;i<60;i++)world.update(1/60);
    assert(world.fire(a,b,0));
  }
  for(let i=0;i<720;i++)world.update(1/60);
  return {charge:a.charge,damage:events.reduce((sum,n)=>sum+n,0),ticks:events,required:a.u.chargeRequired};
}
const report=[];
for(const id of Object.keys(after)) {
  const basicBefore=probe(before,id),basicAfter=probe(after,id);
  close(basicAfter.charge,basicBefore.charge*.5,id+' basic charge halved');
  if(id==='lavender')close(basicAfter.damage,3300,'Lavender near-band damage');
  else close(basicAfter.damage,basicBefore.damage,id+' ordinary damage unchanged');
  const ultBefore=probe(before,id,true),ultAfter=probe(after,id,true);
  if(id==='purple')close(ultAfter.charge,4,'Purple central and first-thorn charging are separate');
  else if(id!=='chartreuse')close(ultAfter.charge,ultBefore.charge,id+' ultimate recharge unchanged');
  else close(ultAfter.charge,ultBefore.charge*.5,id+' focused basic still uses basic charging');
  assert.equal(ultAfter.required,ultBefore.required,id+' capacity unchanged');
  if(ultBefore.damage>0&&id!=='crystal'){
    // Mint's 450 per tick rounds to 563; all other authored damage stays exact.
    const expected=id==='purple'?after.purple.ultimate.damage*2+after.purple.ultimate.projectileDamage*17:id==='mint'?ultBefore.damage/450*563:ultBefore.damage*1.25;
    close(ultAfter.damage,expected,id+' ultimate damage increased');
  }else close(ultAfter.damage,ultBefore.damage,id+' nondamage/execute unchanged');
  report.push({id,basicChargeBefore:basicBefore.charge,basicChargeAfter:basicAfter.charge,ultimateDamageBefore:ultBefore.damage,ultimateDamageAfter:ultAfter.damage,ultimateRechargeBefore:ultBefore.charge,ultimateRechargeAfter:ultAfter.charge});
  console.log('PASS beta8 basic charge and ultimate damage:',id);
}
// Several enemies still charge per target, at half the previous basic rate.
for(const defs of [before,after]){
 const world=createBeta6Combat(defs,{bounds:100});
 const a=world.add('lavender',{automatic:false,team:1,next:0});
 const enemies=[1,2,3].map(x=>world.add('red',{automatic:false,team:2,x,hp:1e9}));
 a.u={...a.u,chargeRequired:100};assert(world.fire(a,enemies[0],0));
 for(let i=0;i<180;i++)world.update(1/60);
 close(a.charge,defs.lavender.basicUltimateChargeMultiplier===.5?4.5:9,'Lavender three targets');
}
writeFileSync('specs/beta8-ultimate-balance-verification.json',JSON.stringify({date:'2026-10-15',mainUnchanged:true,report},null,2)+'\n');
