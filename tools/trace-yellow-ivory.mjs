import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {atCharacterLevel} from './simulate-beta6-balance.mjs';
// Preserve the diagnosed pre-evasion matchup after the live dodge patch.
const baseline=applyBeta7Balance(BETA_CHARACTERS);
const current=process.argv.includes('--current');
if(!current){delete baseline.yellow.botAvoidLandingZones;delete baseline.yellow.botLandingDodgeSpeedMultiplier;}
const config=atCharacterLevel(baseline,6);
const rows=[],details=[];
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError})));
for(let s=0;s<6;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]) {
 const seed=20260919+s*10000+n,scenario=scenarios[s],events=[],snapshots=[];
 let yellow,ivory;
 const world=createBeta6Combat(config,{seed,aimError:scenario.aimError,bounds:40,
  suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},
  onEvent(e){
   if(e.type==='zoneDamage')return;
   events.push({time:e.time,type:e.type,owner:e.owner?.id,target:e.target?.id,
    deviceAim:e.type==='attack'&&e.owner?.id==='yellow'&&!e.target?.id,
    damage:e.amount,clearance:e.clearance,ultimate:e.ultimate,ownerHP:e.owner?.hp,targetHP:e.target?.hp,ownerCharge:e.owner?.charge,
    device:e.device&&{...e.device},from:e.from&&{...e.from},to:e.to&&{...e.to},
    ownerPosition:e.owner&&{x:e.owner.x,z:e.owner.z},targetPosition:e.target&&{x:e.target.x,z:e.target.z}});
  }});
 const first=mirror===1?'yellow':'ivory',second=mirror===1?'ivory':'yellow';
 const a=world.add(first,{x:-mirror*scenario.distance/2,charge:0});
 const b=world.add(second,{x:mirror*scenario.distance/2,charge:0});
 yellow=first==='yellow'?a:b;ivory=first==='ivory'?a:b;
 for(let frame=0;frame<2700&&a.hp>0&&b.hp>0;frame++) {
  world.update(1/60);
  if(frame%30===0)snapshots.push({time:world.time,yellow:{x:yellow.x,z:yellow.z,hp:yellow.hp,charge:yellow.charge,devices:yellow.devices.length},ivory:{x:ivory.x,z:ivory.z,hp:ivory.hp},distance:Math.hypot(yellow.x-ivory.x,yellow.z-ivory.z)});
 }
 const outcome=yellow.hp<=0?-1:ivory.hp<=0?1:Math.sign(yellow.hp/yellow.d.maxHealth-ivory.hp/ivory.d.maxHealth);
 const owned=(type,id)=>events.filter(e=>e.type===type&&e.owner===id);
 const damages=owned('damage','yellow');
 const circuitDamage=damages.filter(e=>Math.abs(e.damage-config.yellow.ultimate.connectionDamage)<1e-6);
 const row={seed,scenario,mirror,outcome,time:world.time,hp:[yellow.hp,ivory.hp],
  yellowCasts:yellow.castCount,ivoryCasts:ivory.castCount,yellowAttacks:yellow.attackCount,ivoryAttacks:ivory.attackCount,
  installed:owned('devicePlaced','yellow').length,circuits:owned('circuit','yellow').length,
  deviceShots:owned('attack','yellow').filter(e=>e.deviceAim).length,
  yellowDamage:damages.reduce((s,e)=>s+e.damage,0),ivoryDamage:owned('damage','ivory').reduce((s,e)=>s+e.damage,0),
  circuitDamageHits:circuitDamage.length,
  firstDevice:owned('devicePlaced','yellow')[0]?.time??null,secondDevice:owned('devicePlaced','yellow')[1]?.time??null,
  firstCircuit:owned('circuit','yellow')[0]?.time??null};
 rows.push(row);details.push({...row,events,snapshots});
}
const losses=rows.filter(r=>r.outcome<0),wins=rows.filter(r=>r.outcome>0);
if(!current){assert.equal(losses.length,279);assert.equal(wins.length,81);}
const summary={games:rows.length,wins:wins.length,losses:losses.length,
 lossesBeforeTwoInstalled:losses.filter(r=>r.installed<2).length,
 lossesWithoutCircuit:losses.filter(r=>r.circuits===0).length,
 lossesWithoutCircuitDamage:losses.filter(r=>r.circuitDamageHits===0).length,
 lossesWithCircuitDamage:losses.filter(r=>r.circuitDamageHits>0).length,
 averageLossSeconds:losses.reduce((s,r)=>s+r.time,0)/losses.length,
 averageLossYellowDamage:losses.reduce((s,r)=>s+r.yellowDamage,0)/losses.length,
 averageLossYellowCasts:losses.reduce((s,r)=>s+r.yellowCasts,0)/losses.length};
const representative=[details.find(r=>r.outcome<0&&r.installed<2),details.find(r=>r.outcome<0&&r.circuits>0&&r.circuitDamageHits===0),details.find(r=>r.outcome<0&&r.circuitDamageHits>0)].filter(Boolean);
// The dodge-loss-trace artifact is the frozen pre-fix reproduction used by regression tests.
writeFileSync(new URL(current?'../specs/yellow-ivory-live-trace.json':'../specs/yellow-ivory-loss-trace.json',import.meta.url),JSON.stringify({level:6,config:{yellow:config.yellow,ivory:config.ivory},summary,rows,representative},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
for(const r of representative){console.log('EXAMPLE',JSON.stringify({...r,events:undefined,snapshots:undefined}));console.log(JSON.stringify(r.events.filter(e=>['damage','devicePlaced','ultimate','circuit'].includes(e.type)),null,2));}
