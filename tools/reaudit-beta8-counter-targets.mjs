import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {BETA8_COUNTER_CYCLE,BETA8_COUNTER_TARGETS} from '../src/config/beta8-counter-targets.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';import {writeCounterReport} from './write-beta8-counter-report.mjs';
const root=new URL('../',import.meta.url),file=new URL('specs/beta8-counter-cycle-verification.json',root),r=JSON.parse(readFileSync(file,'utf8'));
const hash=p=>createHash('sha256').update(readFileSync(new URL(p,root),'utf8').replaceAll('\r\n','\n')).digest('hex');
const targetPath='src/config/beta8-counter-targets.js';
for(const [p,h]of Object.entries(r.sourceHashes))if(p!==targetPath)assert.equal(hash(p),h,'Combat source changed; rerun full verification: '+p);
const config=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));assert.deepEqual([...BETA8_COUNTER_CYCLE].sort(),Object.keys(config).sort());
r.audit=BETA8_COUNTER_TARGETS.map(t=>{const win=r.matrix[t.id][t.targetWin],loss=r.matrix[t.id][t.targetLoss],entries=Object.entries(r.matrix[t.id]);return {...t,targetWinResult:win,targetLossResult:loss,edgePerfect:win.wins===win.games,winAndLossPerfect:win.wins===win.games&&loss.losses===loss.games,perfectWins:entries.filter(([,v])=>v.wins===v.games).map(([id])=>id),perfectLosses:entries.filter(([,v])=>v.losses===v.games).map(([id])=>id)};});
r.cycle=BETA8_COUNTER_CYCLE;r.perfectEdges=r.audit.filter(t=>t.edgePerfect).length;r.cyclePerfect=r.audit.every(t=>t.edgePerfect);r.uniqueCounterPerfect=r.audit.every(t=>t.winAndLossPerfect&&t.perfectWins.length===1&&t.perfectLosses.length===1);
r.browserCases=[];const ids=Object.keys(config),by=Object.fromEntries(BETA8_COUNTER_TARGETS.map(t=>[t.id,t]));
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const left=ids[i],right=ids[j];if(by[left].targetWin!==right&&by[right].targetWin!==left)continue;
 for(const distance of r.distances)for(const aimError of r.aimErrors)for(const reverse of [false,true]){const scenario={distance,aimError,bounds:r.profile.bounds,level:r.level},seed=20261025+distance*1000+(aimError===.1?10000:0),first=reverse?right:left,second=reverse?left:right,mirror=reverse?-1:1,result=beta6Duel(config,first,second,scenario,seed,mirror);r.browserCases.push({first,second,scenario,seed,mirror,outcome:result.outcome,hp:result.hp});}}
r.sourceHashes[targetPath]=hash(targetPath);r.targetReaudit={scope:'Target changes only; all combat/config hashes unchanged, full matrix reused, target-edge first seeds re-executed',checkedCases:r.browserCases.length};
writeFileSync(file,JSON.stringify(r,null,2)+'\n');writeCounterReport(r);console.table(r.audit.map(t=>({id:t.id,target:t.targetWin,wins:t.targetWinResult.wins,losses:t.targetWinResult.losses,draws:t.targetWinResult.draws})));console.log({perfectEdges:r.perfectEdges,cases:r.browserCases.length,combatUnchanged:true});
