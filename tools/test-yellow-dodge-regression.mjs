import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {atCharacterLevel,beta6Duel} from './simulate-beta6-balance.mjs';
const baseline=JSON.parse(readFileSync(new URL('../specs/yellow-ivory-dodge-loss-trace.json',import.meta.url),'utf8'));
const before=baseline.representative.find(r=>r.seed===20310946&&r.mirror===1);
assert(before&&before.outcome===-1,'recorded failing case exists');
const config=applyBeta7Balance(BETA_CHARACTERS),damages=[];
const world=createBeta6Combat(atCharacterLevel(config,6),{seed:before.seed,aimError:.1,bounds:40,
 suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25},
 onEvent:e=>{if(e.type==='damage')damages.push({time:e.time,owner:e.owner.id,target:e.target.id,amount:e.amount});}});
const yellow=world.add('yellow',{x:-8,charge:0}),ivory=world.add('ivory',{x:8,charge:0});
for(let n=0;n<2700&&yellow.hp>0&&ivory.hp>0;n++)world.update(1/60);
assert(yellow.hp>0&&ivory.hp<=0,'old loss becomes a win');
assert.equal(damages.filter(e=>e.owner==='ivory').length,0,'no impact or zone hit during the old oscillation case');
const after={time:world.time,hp:[yellow.hp,ivory.hp],casts:[yellow.castCount,ivory.castCount],attacks:[yellow.attackCount,ivory.attackCount],damages};
let wins=0,losses=0,draws=0;
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
for(let s=0;s<6;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]) {
 const r=beta6Duel(config,mirror===1?'yellow':'ivory',mirror===1?'ivory':'yellow',scenarios[s],20260919+s*10000+n,mirror);
 const outcome=r.outcome*mirror;wins+=outcome>0;losses+=outcome<0;draws+=outcome===0;
}
console.log(JSON.stringify({after,matchup:{wins,losses,draws}},null,2));
assert.equal(wins,360,'all original matchup seeds remain wins');
writeFileSync(new URL('../specs/yellow-dodge-fix-verification.json',import.meta.url),JSON.stringify({seed:before.seed,scenario:before.scenario,mirror:before.mirror,before:{time:before.time,hp:before.hp,outcome:before.outcome},after,matchup:{wins,losses,draws,games:360}},null,2)+'\n');
console.log('PASS: recorded dodge reversal loss repaired and 360/360 matchup wins');
