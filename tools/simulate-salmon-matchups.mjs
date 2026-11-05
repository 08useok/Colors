import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const config=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const rows=[];
for(const opponent of Object.keys(config).filter(id=>id!=='salmon')){
  const row={opponent,wins:0,losses:0,draws:0,games:0,knockoutWins:0,knockoutLosses:0,timeLimitDecisions:0};
  for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let seed=0;seed<10;seed++)for(const reverse of [false,true]){
    const r=beta6Duel(config,reverse?opponent:'salmon',reverse?'salmon':opponent,{distance,aimError,bounds:40,level:6},20261025+seed+distance*1000+(aimError===.1?10000:0),reverse?-1:1);
    const outcome=r.outcome*(reverse?-1:1),own=r.hp[reverse?1:0],other=r.hp[reverse?0:1];
    row.games++;row.wins+=Number(outcome>0);row.losses+=Number(outcome<0);row.draws+=Number(outcome===0);
    row.knockoutWins+=Number(own>0&&other<=0);row.knockoutLosses+=Number(own<=0&&other>0);row.timeLimitDecisions+=Number(own>0&&other>0);
  }
  row.score=(row.wins+row.draws*.5)/row.games;rows.push(row);
}
rows.sort((a,b)=>b.score-a.score);
const report={scope:'Beta8 Salmon versus 16 opponents, deterministic bot duels; not a player win-rate prediction',level:6,distances:[6,10,14],aimErrors:[.035,.1],seeds:10,reverseActorOrder:true,initialCharge:0,timeLimit:45,timeoutRule:'remaining HP percentage, draws worth 0.5',zone:'30–45 seconds, shrinks from 40 to 8',games:rows.reduce((s,r)=>s+r.games,0),rows};
writeFileSync(new URL('../specs/salmon-matchups.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.table(rows.map(r=>({opponent:r.opponent,score:(r.score*100).toFixed(1),wins:r.wins,losses:r.losses,draws:r.draws,KOwins:r.knockoutWins,KOlosses:r.knockoutLosses,timeouts:r.timeLimitDecisions})));
