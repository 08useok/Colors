import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance,beta6Ultimate} from '../src/config/beta6-balance.js';
import {atCharacterLevel} from './simulate-beta6-balance.mjs';
const trace=JSON.parse(readFileSync('specs/main-crystal-loss-trace-remaining-five-percent.json','utf8'));
const source=readFileSync('src/main.js','utf8').replace(/\r\n/g,'\n'),start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');
const context=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),context);
const base=atCharacterLevel(JSON.parse(JSON.stringify(context.CHARACTERS)),6);
// Instrument an in-memory engine copy, preserving RNG calls during no-dodge replay.
// The game source and balance settings are not edited by this diagnostic.
const engineSource=readFileSync('src/combat/beta6-combat.js','utf8').replace(/^import .*;\r?$/m,'').replace('export function createBeta6Combat','function createBeta6Combat')
 .replace('projectiles.push(projectile);','projectiles.push(projectile); options.traceProjectile?.(projectile);')
 .replace('b.dodgeNext = time + (b.d.projectileDodgeCooldown ?? 0);','b.dodgeNext = time + (b.d.projectileDodgeCooldown ?? 0); if (options.suppressDodge) b.dodgeUntil = time;');
const createBeta6Combat=new Function('beta6Ultimate',engineSource+'\nreturn createBeta6Combat;')(beta6Ultimate);
function replay(row,variant){
 const config=structuredClone(base),shots=new Map();let crystal,crimson;
 if(variant==='noLead')config.crystal.botAimLeadFactor=0;
 const world=createBeta6Combat(config,{seed:row.seed,aimError:variant==='perfectAim'?0:[.035,.1][row.s%2],bounds:40,suppressDodge:variant==='noDodge',suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},traceProjectile:p=>{
  if(p.owner===crystal&&p.stage===1)shots.set(p.key,{p,time:world.time,origin:{x:p.x,z:p.z},targetAtFire:{x:crimson.x,z:crimson.z,vx:crimson.vx,vz:crimson.vz},yaw:p.yaw,enemyDodging:null,closest:Infinity,hit:false});
 }});
 const left=world.add(row.order===1?'crimson':'crystal',{x:-row.order*row.distance/2}),right=world.add(row.order===1?'crystal':'crimson',{x:row.order*row.distance/2});
 crystal=row.order===1?right:left;crimson=row.order===1?left:right;
 for(let frame=0;frame<2700&&crystal.hp>0&&crimson.hp>0;frame++){
  const previous=new Map([...shots].map(([key,s])=>[key,{x:s.p.x,z:s.p.z}]));world.update(1/60);
  for(const [key,s]of shots)if(!s.ended){if(s.enemyDodging===null)s.enemyDodging=world.time<crimson.dodgeUntil;const a=previous.get(key)??s.origin,b=s.p,dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((crimson.x-a.x)*dx+(crimson.z-a.z)*dz)/(dx*dx+dz*dz||1)));s.closest=Math.min(s.closest,Math.hypot(crimson.x-a.x-t*dx,crimson.z-a.z-t*dz));s.hit=s.hit||s.p.hits.has(crimson.key);if(!world.projectiles.includes(s.p))s.ended=true;}
 }
 return {win:crimson.hp<=0&&crystal.hp>0,time:world.time,charge:crystal.charge,casts:crystal.castCount,shots:[...shots.values()].map(({p,ended,...s})=>s)};
}
const rows=trace.losses.map(row=>({seed:row.seed,order:row.order,distance:row.distance,s:row.s,baseline:replay(row,'baseline'),noDodge:replay(row,'noDodge'),perfectAim:replay(row,'perfectAim'),noLead:replay(row,'noLead')}));
assert(rows.length===30&&rows.every(r=>!r.baseline.win));
for(let i=0;i<rows.length;i++){
 assert.equal(rows[i].baseline.charge,trace.losses[i].charge);
 assert.equal(rows[i].baseline.casts,trace.losses[i].casts);
 assert(Math.abs(rows[i].baseline.time-trace.losses[i].time)<1e-8,'instrumented baseline must replay exactly');
}
const variants=['noDodge','perfectAim','noLead'],summary=Object.fromEntries(variants.map(v=>[v,{recovered:rows.filter(r=>r[v].win).length,stillLost:rows.filter(r=>!r[v].win).length}]));
summary.baselineShots=rows.flatMap(r=>r.baseline.shots).length;
summary.baselineFirstHits=rows.flatMap(r=>r.baseline.shots).filter(s=>s.hit).length;
summary.lossesWithAnyDodgeReaction=rows.filter(r=>r.baseline.shots.some(s=>s.enemyDodging)).length;
writeFileSync('specs/main-crystal-miss-analysis.json',JSON.stringify({scope:'Diagnostic replays of only the 30 baseline losses; counterfactual variants are not applied to gameplay and are not full win rates',summary,rows},null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
