import {beta6Duel} from './simulate-beta6-balance.mjs';
import {BETA8_SIMULATION_PROFILE as profile} from './beta8-simulation-profile.mjs';
export function evaluateTarget(config,left,right,seedBase=20261025){
 const result={left,right,seedBase,wins:0,losses:0,draws:0,failures:[],byDistance:{}};
 for(const distance of profile.distances)for(const aimError of profile.aimErrors)for(let n=0;n<profile.seedsPerScenario;n++)for(const reverse of [false,true]){
  const m=reverse?-1:1,seed=seedBase+n+distance*(seedBase===20261025?1000:1009)+(aimError===.1?10000:0);
  const r=beta6Duel(config,reverse?right:left,reverse?left:right,{distance,aimError,bounds:profile.bounds,level:6},seed,m),v=r.outcome*m;
  const row=result.byDistance[distance]??={wins:0,losses:0,draws:0};for(const obj of [result,row]){obj.wins+=+(v>0);obj.losses+=+(v<0);obj.draws+=+(v===0);}
  if(v<=0)result.failures.push({distance,aimError,n,reverse,seed,...r});
 }return result;
}
