import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';import {atCharacterLevel} from './simulate-beta6-balance.mjs';import {BETA8_SIMULATION_PROFILE as p} from './beta8-simulation-profile.mjs';
const base=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),reports=[];
for(const [left,right,variants]of [['azure','lavender',['baseline','noLowHealthRetreat']]])for(const variant of variants){
 const config=structuredClone(base);if(variant==='noAnalysis')config.crystal.ultimate.chargeRequired=1e9;if(variant==='noLowHealthRetreat')config.azure.pursuesWhileLowHealth=true;if(variant==='noSpecialDodge')config.chartreuse.projectileDodgeDuration=0;
 const result={left,right,variant,wins:0,losses:0,draws:0,lossCauses:{},lossCasts:{zero:0,used:0},lossCharge:{},analysisInLosses:0,analysisAfterOwnUlt:0,samples:[]};
 for(const distance of p.distances)for(const aimError of p.aimErrors)for(let n=0;n<10;n++)for(const reverse of [false,true]){
  let a,b;const events=[];const w=createBeta6Combat(atCharacterLevel(config,6),{seed:20261025+n+distance*1000+(aimError===.1?10000:0),aimError,bounds:p.bounds,suddenDeath:p.zone,onEvent(e){if(['damage','zoneDamage','ultimatePrepare','ultimate','analysis','analysisExecute','analysisReleased','purpleLeap','salmonRecover','salmonCapture','salmonReward','attack'].includes(e.type))events.push({time:+e.time.toFixed(3),type:e.type,owner:e.owner?.id,target:e.target?.id,amount:e.amount,targetHp:e.target?.hp,charge:e.target?.charge,ownerCharge:e.owner?.charge,ownCasts:a?.castCount,phase:e.phase,gap:a&&b?Math.hypot(a.x-b.x,a.z-b.z):null});}});
  const first=w.add(reverse?right:left,{x:(reverse?1:-1)*distance/2,charge:0}),second=w.add(reverse?left:right,{x:(reverse?-1:1)*distance/2,charge:0});a=reverse?second:first;b=reverse?first:second;
  let attackRangeFrames=0;const positions=[];
  for(let f=0;f<2700&&a.hp>0&&b.hp>0;f++){
   if(variant==='noPlague')b.rounds=b.rounds.map(r=>r==='plague'?'blank':r);
   w.update(1/60);attackRangeFrames+=+(Math.hypot(a.x-b.x,a.z-b.z)<=w.range(a));if(f%120===0)positions.push({time:+w.time.toFixed(2),hp:[a.hp,b.hp],ammo:a.ammo,charge:a.charge,floats:w.salmon.floats.length,gap:+Math.hypot(a.x-b.x,a.z-b.z).toFixed(2),a:[+a.x.toFixed(1),+a.z.toFixed(1)],b:[+b.x.toFixed(1),+b.z.toFixed(1)]});
  }
  const outcome=a.hp<=0&&b.hp<=0?Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth):a.hp<=0?-1:b.hp<=0?1:Math.sign(a.hp/a.d.maxHealth-b.hp/b.d.maxHealth);result.wins+=+(outcome>0);result.losses+=+(outcome<0);result.draws+=+(outcome===0);
  if(outcome<0){const death=events.filter(e=>e.target===left&&['damage','zoneDamage','analysisExecute'].includes(e.type)).at(-1);const cause=death?.type==='analysisExecute'?'analysisExecute':death?.type==='zoneDamage'?'zone':a.hp<=0?(a.lastDamageKind??'combat'):'timeoutHP';result.lossCauses[cause]=(result.lossCauses[cause]??0)+1;result.lossCasts[a.castCount?'used':'zero']++;const charge=+a.charge.toFixed(6)+'/'+a.u.chargeRequired;result.lossCharge[charge]=(result.lossCharge[charge]??0)+1;const analysis=events.filter(e=>e.type==='analysis'&&e.target===left);result.analysisInLosses+=+(analysis.length>0);result.analysisAfterOwnUlt+=+(analysis.some(e=>e.ownCasts>0));
   if(result.samples.length<3||!result.samples.some(s=>s.cause===cause))result.samples.push({distance,aimError,n,reverse,cause,time:+w.time.toFixed(3),hp:[a.hp,b.hp],charge:[a.charge,b.charge],casts:[a.castCount,b.castCount],attacks:[a.attackCount,b.attackCount],attackRangeSeconds:attackRangeFrames/60,positions,events});
  }w.clear();
 }
 reports.push(result);console.log(JSON.stringify({...result,samples:undefined}));
}
writeFileSync(new URL('../specs/beta8-azure-lavender-losses.json',import.meta.url),JSON.stringify({profile:p,scope:'Current baseline traces plus diagnostic-only counterfactuals; no gameplay changes',reports},null,2)+'\n');
