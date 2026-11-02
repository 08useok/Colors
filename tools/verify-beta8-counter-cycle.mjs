import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {season9CycleConfig} from './beta9-cycle-definitions.mjs';
import {BETA8_COUNTER_CYCLE,BETA8_COUNTER_TARGETS} from '../src/config/beta8-counter-targets.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
import {writeCounterReport} from './write-beta8-counter-report.mjs';
import {BETA8_SIMULATION_PROFILE as profile} from './beta8-simulation-profile.mjs';
const root=new URL('../',import.meta.url),config=season9CycleConfig();
assert.deepEqual([...BETA8_COUNTER_CYCLE].sort(),Object.keys(config).sort());
assert.equal(new Set(BETA8_COUNTER_CYCLE).size,18);
const by=Object.fromEntries(BETA8_COUNTER_TARGETS.map(t=>[t.id,t]));
for(const t of BETA8_COUNTER_TARGETS){assert.equal(by[t.targetWin].targetLoss,t.id);assert.equal(by[t.targetLoss].targetWin,t.id);}
const sourceHashes={};
function hashFile(relative){if(sourceHashes[relative])return;const url=new URL(relative,root),source=readFileSync(url,'utf8');sourceHashes[relative]=createHash('sha256').update(source.replaceAll('\r\n','\n')).digest('hex');for(const m of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)){const dep=new URL(m[1],url);dep.search='';hashFile(decodeURIComponent(dep.href.slice(root.href.length)));}}
for(const p of ['src/config/beta-characters.js','src/config/beta7-balance.js','src/config/beta8-balance.js','src/config/beta8-counter-targets.js','src/config/raspberry.js','tools/beta9-cycle-definitions.mjs','src/combat/beta6-combat.js','tools/simulate-beta6-balance.mjs','tools/beta8-simulation-profile.mjs'])hashFile(p);
const matrix=Object.fromEntries(Object.keys(config).map(id=>[id,{}])),browserCases=[];
const ids=Object.keys(config);
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
 const left=ids[i],right=ids[j],row={wins:0,losses:0,draws:0,games:0,timeLimitDecisions:0};
 const byDistance={};
 for(const distance of profile.distances)for(const aimError of profile.aimErrors)for(let n=0;n<profile.seedsPerScenario;n++)for(const reverse of [false,true]){
  const scenario={distance,aimError,bounds:profile.bounds,level:6},seed=20261025+n+distance*1000+(aimError===.1?10000:0);
  const first=reverse?right:left,second=reverse?left:right,mirror=reverse?-1:1;
  const r=beta6Duel(config,first,second,scenario,seed,mirror),outcome=r.outcome*mirror;
  row.games++;row.wins+=Number(outcome>0);row.losses+=Number(outcome<0);row.draws+=Number(outcome===0);row.timeLimitDecisions+=Number(r.hp.every(h=>h>0));
  const band=byDistance[distance]??={wins:0,losses:0,draws:0,games:0};band.games++;band.wins+=+(outcome>0);band.losses+=+(outcome<0);band.draws+=+(outcome===0);
  if(n===0&&(by[left].targetWin===right||by[right].targetWin===left))browserCases.push({first,second,scenario,seed,mirror,outcome:r.outcome,hp:r.hp});
 }
 assert.equal(row.games,row.wins+row.losses+row.draws);row.score=(row.wins+row.draws/2)/row.games;row.byDistance=byDistance;
 matrix[left][right]=row;matrix[right][left]={...row,wins:row.losses,losses:row.wins,score:1-row.score,byDistance:Object.fromEntries(Object.entries(byDistance).map(([d,v])=>[d,{...v,wins:v.losses,losses:v.wins}]))};
}
const audit=BETA8_COUNTER_TARGETS.map(t=>{
 const win=matrix[t.id][t.targetWin],loss=matrix[t.id][t.targetLoss],entries=Object.entries(matrix[t.id]);
 return {...t,targetWinResult:win,targetLossResult:loss,edgePerfect:win.wins===win.games,winAndLossPerfect:win.wins===win.games&&loss.losses===loss.games,
  perfectWins:entries.filter(([,r])=>r.wins===r.games).map(([id])=>id),perfectLosses:entries.filter(([,r])=>r.losses===r.games).map(([id])=>id)};
});
for(const [path,hash] of Object.entries(sourceHashes))assert.equal(createHash('sha256').update(readFileSync(new URL(path,root),'utf8').replaceAll('\r\n','\n')).digest('hex'),hash,'source changed during verification');
const report={scope:'Season 9 beta, 18 characters (17 + Raspberry), deterministic bot simulations; no gameplay tuning',profile,level:6,distances:profile.distances,aimErrors:profile.aimErrors,seedsPerScenario:profile.seedsPerScenario,initialCharge:0,reverseActorOrder:true,timeLimit:45,zone:'start30/end45/radius40to8 (historical synthetic zone retained)',timeoutRule:'remaining HP percentage; draws score 0.5',pairs:153,games:153*profile.distances.length*profile.aimErrors.length*profile.seedsPerScenario*2,cycle:BETA8_COUNTER_CYCLE,
 perfectEdges:audit.filter(r=>r.edgePerfect).length,cyclePerfect:audit.every(r=>r.edgePerfect),uniqueCounterPerfect:audit.every(r=>r.winAndLossPerfect&&r.perfectWins.length===1&&r.perfectLosses.length===1),audit,matrix,browserCases,sourceHashes};
writeFileSync(new URL('specs/beta8-counter-cycle-verification.json',root),JSON.stringify(report,null,2)+'\n');
writeCounterReport(report);
console.table(audit.map(r=>({id:r.id,target:r.targetWin,wins:r.targetWinResult.wins,losses:r.targetWinResult.losses,draws:r.targetWinResult.draws,score:(r.targetWinResult.score*100).toFixed(1)+'%',perfect:r.edgePerfect,allPerfectWins:r.perfectWins.length,allPerfectLosses:r.perfectLosses.length})));
console.log(JSON.stringify({games:report.games,perfectEdges:report.perfectEdges,cyclePerfect:report.cyclePerfect,uniqueCounterPerfect:report.uniqueCounterPerfect,browserCases:browserCases.length}));
