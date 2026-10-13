import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const config=applyBeta7Balance(BETA_CHARACTERS);
const original=structuredClone(BETA_CHARACTERS);
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);

// Landing damage and periodic damage remain independent, including ultimate zones.
for(const ultimate of [false,true]){
 const events=[];
 const world=createBeta6Combat(config,{bounds:100,onEvent:e=>{if(e.type==='damage')events.push(e);}});
 const caster=world.add('ivory',{automatic:false,team:1,charge:3,next:0});
 const target=world.add('red',{automatic:false,team:2,x:2,hp:100000});
 if(ultimate)world.cast(caster,target,{point:{x:2,z:0},angle:0});else world.fire(caster,target,0);
 for(let i=0;i<180;i++)world.update(1/60);
 assert(events.some(e=>e.amount===2400),'impact damage stays 2400');
 const ticks=events.filter(e=>e.amount===2600);
 assert.equal(ticks.length,2,'both one-second ticks hit for 2600 without skipped ticks');
 for(let i=1;i<ticks.length;i++)assert(ticks[i].time-ticks[i-1].time>=1-1e-7,'overlapping zones cannot stack ticks');
}
assert.deepEqual(BETA_CHARACTERS,original,'base definitions untouched');
assert.equal(applyBeta6Balance(BETA_CHARACTERS).ivory.iceCreamZoneDamage,undefined,'season 6 fallback preserved');

// Execute the actual pointer-to-range and player-to-combat bridge functions.
const source=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
function extract(name){const start=source.indexOf(`function ${name}(`);const end=source.indexOf('\n}\n',start);assert(start>=0&&end>start);return source.slice(start,end+3);}
const calls=[];
const hero={id:'ivory',hp:6600,team:1,x:10,z:5,u:config.ivory.ultimate,d:config.ivory};
 const world={actors:[hero,{hp:10000,team:2,x:10,z:7}],hidden:()=>false,range:()=>config.ivory.iceCreamRange,
 fire:(actor,target,angle)=>{calls.push({ultimate:false,target,angle});return false;},
 cast:(actor,target,aim)=>{calls.push({ultimate:true,target,aim});return false;}};
const context={BETA_CHARACTERS:config,THREE:{MathUtils:{clamp:(v,a,b)=>Math.min(b,Math.max(a,v))}},
 THROW_AIM_MIN_RANGE:Number(source.match(/const THROW_AIM_MIN_RANGE = ([\d.]+);/)[1]),
 player:{position:{x:10,z:5},rotation:{y:0}},betaState:{selectedCharacter:'ivory'},manualAimPoint:{x:10,z:5},
  ivoryAttackAimRange:config.ivory.iceCreamRange,ivoryUltimateAimRange:20,canvas:{dataset:{}},updateIvoryThrowAimVisuals(){},
 beta6Combat:world,beta6PlayerActor:hero,goldRushState:{dead:false,health:6600},beta6PendingEvents:[],
 yellowUltimateAimPointValid:false,purpleUltimateAimPointValid:false,syncBeta6PlayerHud(){}};
context.groundPointAtPointer=e=>{context.manualAimPoint.x=10+e.x;context.manualAimPoint.z=5+e.z;return context.manualAimPoint;};
vm.createContext(context);vm.runInContext(extract('aimPlayerAtPointer')+extract('useBeta6PlayerSkill'),context);
for(const ultimate of [false,true])for(const distance of [0,.5,2,6,8,9,10,20,30]){
 assert(vm.runInContext(`aimPlayerAtPointer({x:${distance},z:0},'${ultimate?'ultimate':'attack'}')`,context));
 vm.runInContext(`useBeta6PlayerSkill(${ultimate},true)`,context);
 const call=calls.at(-1),point=ultimate?call.aim.point:call.target;
 close(Math.hypot(point.x-10,point.z-5),Math.min(distance,ultimate?20:config.ivory.iceCreamRange));
}
// The real combat launch respects the selected normal landing distance.
for(const distance of [0,.5,2,6,8,9,10,30]){
 const w=createBeta6Combat(config,{bounds:100});
 const a=w.add('ivory',{automatic:false,next:0});
 w.fire(a,{x:distance,z:0,vx:0,vz:0,hp:1},0);
 close(w.projectiles[0].reach,Math.min(distance,config.ivory.iceCreamRange));
}
for(const distance of [0,.5,6,20,30]){
 const w=createBeta6Combat(config,{bounds:100});
 const a=w.add('ivory',{automatic:false,charge:3});
 const target={x:distance,z:0,vx:0,vz:0,hp:1};
 w.cast(a,target,{point:target,angle:0});
 assert.equal(w.projectiles.length,5);
 const endpoints=w.projectiles.map(p=>({x:p.x+Math.cos(p.yaw)*p.reach,z:p.z+Math.sin(p.yaw)*p.reach}));
 close(endpoints.reduce((sum,p)=>sum+p.x,0)/5,Math.min(distance,20));
 close(endpoints.reduce((sum,p)=>sum+p.z,0)/5,0);
}
console.log('PASS: independent impact/tick damage, ultimate/normal non-stacking zones, aiming at feet/near/far, player input bridge, range caps and season isolation.');
