import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta6Balance } from '../src/config/beta6-balance.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

function probe(config) {
  const events=[];
  const world=createBeta6Combat(config,{bounds:100,onEvent:e=>{if(e.type==='damage')events.push(e);}});
  const owner=world.add('gold',{team:1,automatic:false,charge:6});
  const enemy=world.add('red',{team:2,automatic:false,x:2,hp:100000});
  const ally=world.add('red',{team:1,automatic:false,x:2,hp:100000});
  assert(world.cast(owner,enemy));
  for(let i=0;i<24;i++)world.update(1/60);
  assert.equal(events.length,config.gold.ultimate.tickDamage?1:0);
  owner.x=20; enemy.x=22; ally.x=22;
  for(let i=0;i<270;i++)world.update(1/60);
  assert.equal(ally.hp,100000,'allies take no damage');
  assert.equal(owner.charge,0,'zone damage does not refill Gold ultimate');
  assert.equal(events.length,config.gold.ultimate.tickDamage?4:0,'one initial hit and three one-second ticks');
  for(const e of events) assert.equal(e.amount,100);
  assert.equal(enemy.hp,100000-(config.gold.ultimate.tickDamage?400:0),'zone follows caster');
}
probe(applyBeta7Balance(BETA_CHARACTERS));
probe(applyBeta6Balance(BETA_CHARACTERS));

// Execute the real training-zone loop: multiple targets share one tick schedule.
const source=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8');
const start=source.indexOf('  for (let i = malfunctionZones.length - 1;');
const end=source.indexOf('  if (malfunctionZones.length === 0)',start);
assert(start>=0&&end>start);
const hits=[];
const targets=[{visible:true,position:{x:1,z:0},userData:{}},{visible:true,position:{x:2,z:0},userData:{}}];
const zone={mesh:{position:{set(){}},material:{}},x:0,z:0,radius:6,expiresAt:4,followsPlayer:true,nextDamageAt:0,tickInterval:1,tickDamage:100};
const context={malfunctionZones:[zone],testTargets:targets,player:{position:{x:0,z:0}},clock:{elapsedTime:0},
  groundHeightAt:()=>0,betaEventBushHidden:()=>false,damageTarget:(target,damage)=>hits.push({target,damage}),Math};
vm.createContext(context);
for(const t of [0,.5,1,1.5,2,2.5,3]) {context.clock.elapsedTime=t;vm.runInContext(source.slice(start,end),context);}
assert.equal(hits.length,8,'four ticks each for two training targets');
assert(hits.every(h=>h.damage===100));
console.log('PASS: Gold tick timing, caster movement, allies, charge, season isolation and training multi-target damage.');
