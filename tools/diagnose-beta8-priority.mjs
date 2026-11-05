import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {atCharacterLevel} from './simulate-beta6-balance.mjs';
import {BETA8_SIMULATION_PROFILE as profile} from './beta8-simulation-profile.mjs';
const base=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),reports=[];
for(const[left,right,before]of [['blue','orange',true],['blue','orange',false],['azure','lavender',false],['yellow','ivory',false]]){
 const config=structuredClone(base);if(before)config.blue.bulletKnockback=1.5;
 let wins=0,losses=0,draws=0;const samples=[],lossCauses={},lossCasts={zero:0,used:0},lossCharge=[];
 for(const distance of profile.distances)for(const aimError of profile.aimErrors)for(let seed=0;seed<profile.seedsPerScenario;seed++)for(const reverse of [false,true]){
  const events=[],definitions=atCharacterLevel(config,6),world=createBeta6Combat(definitions,{seed:20261025+seed+distance*1000+(aimError===.1?10000:0),aimError,bounds:profile.bounds,suddenDeath:profile.zone,onEvent(e){if(['damage','attack','ultimatePrepare','ultimate','zoneDamage','landingDodge','approachSurf'].includes(e.type))events.push({time:Math.round(e.time*1000)/1000,type:e.type,owner:e.owner?.id,target:e.target?.id,amount:e.amount,ownerHp:e.owner?.hp,targetHp:e.target?.hp});}});
  const first=world.add(reverse?right:left,{x:(reverse?1:-1)*distance/2,charge:0}),second=world.add(reverse?left:right,{x:(reverse?-1:1)*distance/2,charge:0});
  const a=reverse?second:first,b=reverse?first:second;
  let inAttackRange=0,lowHealth=0;const positions=[];
  for(let frame=0;frame<45*60&&a.hp>0&&b.hp>0;frame++){world.update(1/60);const gap=Math.hypot(a.x-b.x,a.z-b.z);inAttackRange+=Number(gap<=world.range(a));lowHealth+=Number(a.hp<=a.d.maxHealth*.5);if(frame%60===0)positions.push({time:+world.time.toFixed(2),gap:+gap.toFixed(2),a:[+a.x.toFixed(1),+a.z.toFixed(1)],b:[+b.x.toFixed(1),+b.z.toFixed(1)],hp:[Math.round(a.hp),Math.round(b.hp)]});}
  const outcome=a.hp<=0&&b.hp<=0?0:a.hp<=0?-1:b.hp<=0?1:Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth);wins+=Number(outcome>0);losses+=Number(outcome<0);draws+=Number(outcome===0);
  if(outcome<0){const last=events.filter(e=>e.target===left&&['damage','zoneDamage'].includes(e.type)).at(-1),cause=last?.type||'health decision';lossCauses[cause]=(lossCauses[cause]||0)+1;lossCasts[a.castCount?'used':'zero']++;lossCharge.push({charge:a.charge,required:a.u.chargeRequired,missing:a.u.chargeRequired-a.charge,casts:a.castCount});}
  if(outcome<0&&samples.length<4)samples.push({distance,aimError,seed,reverse,time:+world.time.toFixed(3),hp:[a.hp,b.hp],charge:[a.charge,b.charge],attacks:[a.attackCount,b.attackCount],casts:[a.castCount,b.castCount],damageEvents:events.filter(e=>e.type==='damage').length,inAttackRangeSeconds:inAttackRange/60,lowHealthSeconds:lowHealth/60,positions,events});
 }
 const histogram={};for(const q of lossCharge){const key=Number(q.charge.toFixed(6))+'/'+q.required;histogram[key]=(histogram[key]||0)+1;}
 const row={left,right,beforeBlueKnockbackRemoval:before,wins,losses,draws,games:wins+losses+draws,lossCauses,lossCasts,lossCharge,histogram,samples};reports.push(row);console.log(JSON.stringify({left,right,before,losses,lossCasts,histogram}));
}
writeFileSync(new URL('../specs/beta8-priority-diagnosis.json',import.meta.url),JSON.stringify({scope:'Level6, shared enlarged Beta8 simulation profile; battle traces, no gameplay changes',profile,reports},null,2)+'\n');
