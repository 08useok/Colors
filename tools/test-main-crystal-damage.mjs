import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {CHARACTERS} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {atCharacterLevel,beta6Duel} from './simulate-beta6-balance.mjs';
const source=readFileSync('src/main.js','utf8').replace(/\r\n/g,'\n'),start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');
const c=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),c);
const after=JSON.parse(JSON.stringify(c.CHARACTERS)),before=structuredClone(after),fragmentComparison=process.argv.includes('--fragments'),shardComparison=process.argv.includes('--shards');
const pieceDamageComparison=process.argv.includes('--piece-damage');
if(pieceDamageComparison){before.crystal.fragmentDamage=1000;before.crystal.shardDamage=500;}else if(shardComparison)before.crystal.shardHitLimit=1;else if(fragmentComparison)before.crystal.fragmentHitLimit=1;else before.crystal.crystalDamage=2000;
const beta=applyBeta7Balance(BETA_CHARACTERS);
assert.equal(beta.crystal.crystalDamage,2000);assert.equal(after.crystal.crystalDamage,2200);
assert.equal(after.crystal.fragmentHitLimit,3);assert.equal(beta.crystal.fragmentHitLimit,undefined);
assert.equal(after.crystal.shardHitLimit,4);assert.equal(beta.crystal.shardHitLimit,undefined);
assert.equal(after.crystal.fragmentDamage,1100);assert.equal(after.crystal.shardDamage,550);
assert.equal(beta.crystal.fragmentDamage,1000);assert.equal(beta.crystal.shardDamage,500);
const {width,...ultimate}=after.crystal.ultimate;assert.equal(width,2.2);
assert.deepEqual(ultimate,JSON.parse(JSON.stringify(beta.crystal.ultimate)));
for(const level of [1,6]){
 const config=atCharacterLevel(after,level),hits=[],world=createBeta6Combat(config,{onEvent:e=>{if(e.type==='damage')hits.push(e.amount);}});
 const a=world.add('crystal',{automatic:false,next:0}),b=world.add('red',{automatic:false,x:6,hp:1e6});
 assert(world.fire(a,b,0));for(let i=0;i<60;i++)world.update(1/60);
 assert.deepEqual(hits.toSorted((a,b)=>b-a),level===1?[2200,1100,1100,1100,550,550,550,550]:[2420,1210,1210,1210,605,605,605,605]);
 assert.equal(a.charge,a.u.chargeRequired,'eight hits fill charge but cannot overflow');
}
console.log('PASS main Crystal: stage damage 2200/1100/550, hit limits 1/3/4, 7700 base / 8470 level-6 total, charge capped at 6, beta preserved');
if(process.argv.includes('--simulate')||fragmentComparison||shardComparison||pieceDamageComparison){
 const report={scope:'Main Crystal -> Crimson, level 6, ultimates enabled from zero charge; same 600 seeded matchups before/after',before:{},after:{}};
 for(const [name,config]of Object.entries({before,after})){
  let wins=0,losses=0,draws=0,timeouts=0;
  for(let s=0;s<6;s++)for(let n=0;n<50;n++)for(const order of [1,-1]){
   const r=beta6Duel(config,order===1?'crimson':'crystal',order===1?'crystal':'crimson',{distance:[10,13,16][Math.floor(s/2)],aimError:[.035,.1][s%2],bounds:40,level:6},20260919+s*10000+n,order);
   const outcome=-r.outcome*order;wins+=outcome>0;losses+=outcome<0;draws+=outcome===0;timeouts+=r.hp.every(h=>h>0);
  }
  report[name]={wins,losses,draws,timeouts,games:600,winRate:100*(wins+draws/2)/600};
 }
 report.change=pieceDamageComparison?'stage-two damage 1000 -> 1100, stage-three damage 500 -> 550':shardComparison?'stage-three same-target limit 1 -> 4':fragmentComparison?'stage-two same-target limit 1 -> 3':'first projectile 2000 -> 2200';
 writeFileSync(pieceDamageComparison?'specs/main-crystal-piece-damage-verification.json':shardComparison?'specs/main-crystal-shard-verification.json':fragmentComparison?'specs/main-crystal-fragment-verification.json':'specs/main-crystal-damage-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
