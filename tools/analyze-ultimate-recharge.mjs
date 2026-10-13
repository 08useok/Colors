import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { beta6Ultimate } from '../src/config/beta6-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { tournament, beta6Duel, SIMULATION_LEVEL } from './simulate-beta6-balance.mjs';

const baseline=applyBeta7Balance(BETA_CHARACTERS);
// Keep Blue's user-selected 0.33 unchanged. Only reduce excessive repeated-hit recharge.
const proposals=Object.fromEntries(['orange','lavender','ivory','mint'].map(id=>[id,(baseline[id].special??baseline[id].ultimate).rechargePerHit]));
const before=structuredClone(baseline);
for(const id of Object.keys(proposals))(before[id].special??before[id].ultimate).rechargePerHit=1;
const after=structuredClone(baseline);

function singleCast(config,id,count){
 const world=createBeta6Combat(config,{bounds:40,aimError:0,seed:123});
 const u=beta6Ultimate(config[id],id),owner=world.add(id,{automatic:false,team:1,charge:u?.chargeRequired??0});
 for(let i=0;i<count;i++)world.add('red',{automatic:false,team:2,x:2,z:(i-(count-1)/2)*.15,hp:1e7});
 if(id==='pink')world.add('red',{automatic:false,team:1,hp:0,x:1});
 const target=world.actors.find(a=>a.team===2);
 const cast=world.cast(owner,target,{angle:0});
 let fullAt=null;
 for(let i=0;i<12*60;i++){
  world.update(1/60);
  if(u && owner.charge>=u.chargeRequired && fullAt===null)fullAt=world.time;
 }
 return {cast,charge:owner.charge,required:u?.chargeRequired??null,ratio:u?owner.charge/u.chargeRequired:0,fullAt};
}
const probes=Object.fromEntries(Object.keys(before).map(id=>[id,Object.fromEntries([1,3,6].map(count=>[count,{before:singleCast(before,id,count),after:singleCast(after,id,count)}]))]));
console.table(Object.keys(before).map(id=>({id,oneBefore:probes[id][1].before.charge,oneAfter:probes[id][1].after.charge,threeBefore:probes[id][3].before.charge,threeAfter:probes[id][3].after.charge,sixBefore:probes[id][6].before.charge,sixAfter:probes[id][6].after.charge})));
const oldTournament=tournament(before,3),newTournament=tournament(after,3);
const duels=Object.fromEntries(Object.keys(before).map(id=>[id,{beforeWinRate:oldTournament.averages[id],afterWinRate:newTournament.averages[id],beforeCasts:oldTournament.casts[id],afterCasts:newTournament.casts[id]}]));
console.table(duels);
function chargedTournament(config){
 const ids=Object.keys(config),stats=Object.fromEntries(ids.map(id=>[id,{games:0,wins:0,casts:0}]));
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)for(const distance of [4,10,16])for(let seed=0;seed<3;seed++)for(const reverse of [false,true]){
  const a=reverse?ids[j]:ids[i],b=reverse?ids[i]:ids[j];
  const result=beta6Duel(config,a,b,{distance,aimError:.05,bounds:40,level:SIMULATION_LEVEL},20261006+seed,1,100);
  stats[a].games++;stats[b].games++;stats[a].casts+=result.casts[0];stats[b].casts+=result.casts[1];
  stats[a].wins+=result.outcome>0?1:result.outcome===0?.5:0;
  stats[b].wins+=result.outcome<0?1:result.outcome===0?.5:0;
 }
 return Object.fromEntries(ids.map(id=>[id,{winRate:100*stats[id].wins/stats[id].games,casts:stats[id].casts,games:stats[id].games}]));
}
const chargedBefore=chargedTournament(before),chargedAfter=chargedTournament(after);
const chargedDuels=Object.fromEntries(Object.keys(before).map(id=>[id,{beforeWinRate:chargedBefore[id].winRate,afterWinRate:chargedAfter[id].winRate,beforeCasts:chargedBefore[id].casts,afterCasts:chargedAfter[id].casts,games:chargedBefore[id].games}]));
console.table(chargedDuels);
const report={scope:'beta-season-7, 16 characters',level:6,proposals,probe:'One ultimate only; no basic attacks or incoming damage; stationary high-HP targets at 2 tiles; 12 seconds; 1/3/6 targets. Mint slides targets out of range. Yellow requires circuit activation and Red needs incoming hits, so zero probe recharge is not a reason to buff.',duelGamesPerVersion:oldTournament.games,duelInitialCharge:0,duelScenarios:oldTournament.scenarios,probes,duels,chargedDuels,chargedDuelDescription:'Both sides start full; distances 4/10/16 tiles, aim error 0.05, seeds 20261006-20261008, both side orders; 2160 matches per version. Wins include half a point per draw.'};
writeFileSync(new URL('../specs/ultimate-recharge-results.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
