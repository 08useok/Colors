import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {CHARACTERS} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {BETA7_COUNTER_CYCLE} from '../src/config/beta7-counter-targets.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
function config(source){source=source.replace(/\r\n/g,'\n');const start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');const c=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),c);return JSON.parse(JSON.stringify(c.CHARACTERS));}
const before=config(execFileSync('git',['show','91fc77c:src/main.js'],{encoding:'utf8'}));
const after=config(readFileSync('src/main.js','utf8')),azureOnly=structuredClone(before);azureOnly.azure=structuredClone(after.azure);
const repetitions=50,ids=Object.keys(after),results={before:{},azureOnly:{},after:{}};
function pair(defs,a,b){let wins=0,losses=0,draws=0,timeouts=0,seconds=0,casts=0;
 for(let s=0;s<6;s++)for(let n=0;n<repetitions;n++)for(const order of [1,-1]){
  const r=beta6Duel(defs,order===1?a:b,order===1?b:a,{distance:[10,13,16][Math.floor(s/2)],aimError:[.035,.1][s%2],bounds:40,level:6},20260919+s*10000+n,order);
  const out=r.outcome*order;wins+=out>0;losses+=out<0;draws+=out===0;timeouts+=r.hp.every(h=>h>0);seconds+=r.time;casts+=r.casts.reduce((a,b)=>a+b,0);
 }
 return {wins,losses,draws,games:600,winRate:100*(wins+draws/2)/600,timeouts,averageSeconds:seconds/600,casts};
}
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
 const a=ids[i],b=ids[j],key=a+':'+b;
 results.before[key]=pair(before,a,b);
 results.azureOnly[key]=[a,b].includes('azure')?pair(azureOnly,a,b):results.before[key];
 results.after[key]=[a,b].includes('crimson')?pair(after,a,b):results.azureOnly[key];
 console.log(key,results.before[key].winRate.toFixed(1),'=>',results.after[key].winRate.toFixed(1));
}
function row(variant,a,b){const direct=results[variant][a+':'+b];if(direct)return direct;const r=results[variant][b+':'+a];return {...r,wins:r.losses,losses:r.wins,winRate:100-r.winRate};}
const cycle=BETA7_COUNTER_CYCLE.filter(id=>ids.includes(id));
const targets=cycle.map((id,i)=>{const target=cycle[(i+1)%cycle.length];return {id,target,before:row('before',id,target).winRate,azureOnly:row('azureOnly',id,target).winRate,after:row('after',id,target).winRate};});
const averages=ids.map(id=>({id,...Object.fromEntries(Object.keys(results).map(v=>[v,ids.filter(b=>b!==id).reduce((s,b)=>s+row(v,id,b).winRate,0)/(ids.length-1)]))}));
const affected=['azure','crimson'].flatMap(id=>ids.filter(b=>b!==id).map(target=>({id,target,...Object.fromEntries(Object.keys(results).map(v=>[v,row(v,id,target).winRate]))})));
// Probe actual movement against a full-length wall at several offsets.
for(const wall of [1,1.5,2,2.5,3]){const blocked=(x,z,r=.55)=>Math.abs(x-wall)<.5+r;const w=createBeta6Combat(after,{blocked});const a=w.add('azure',{automatic:false,next:0}),b=w.add('red',{automatic:false,x:10});assert(w.fire(a,b,0));for(let i=0;i<60;i++)w.update(1/60);assert(a.x<wall-.5,'Azure crossed wall at '+wall);assert([a.x,a.z,a.hp].every(Number.isFinite));}
const report={date:'2026-10-17',scope:'Main season 7, 15 characters, level 6, ultimate enabled from zero charge; comparison only',baseline:'91fc77c',repetitions,gamesPerPair:600,distances:[10,13,16],aimErrors:[.035,.1],seed:20260919,bothOrders:true,timeoutRule:'45s: compare remaining health ratios; timeout is reported separately, not a knockout',cycleNote:'Main has no Lavender; remove Lavender from the design cycle to test Azure -> Crimson. This is a proposed main-only adjacency, not a changed combat rule.',wallProbes:5,targets,averages,affected,results};
writeFileSync('specs/main-balance-regression.json',JSON.stringify(report,null,2)+'\n');
console.table(targets);console.table(averages.filter(r=>['azure','crimson'].includes(r.id)));
