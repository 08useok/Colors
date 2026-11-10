import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),c=applyBeta8Balance(prior);
assert.equal(c.gold.projectileDamageReduction,1650);assert.equal(c.gold.maxHealth,7380);
for(const [k,v]of Object.entries({stage1Damage:1300,stage2Damage:600,stage3Damage:300}))assert.equal(c.gold[k],v);
for(const k of ['attackPerceptionMinRange','attackPerceptionRange','pursuesWhileLowHealth','botAimWindupLeadFactor'])assert.equal(c.gold[k],prior.gold[k]);
assert.notEqual(prior.gold.projectileDamageReduction,1650);
function damage(defense){const d=structuredClone(c);d.gold.projectileDamageReduction=defense;const w=createBeta6Combat(d,{seed:7,aimError:0}),a=w.add('green',{automatic:false,next:0}),b=w.add('gold',{x:2,automatic:false});w.fire(a,b);for(let f=0;f<100;f++)w.update(1/60);const loss=b.d.maxHealth-b.hp;w.clear();return loss;}
assert(damage(1650)<damage(1200),'same incoming projectile uses updated defense');
{const w=createBeta6Combat(c,{seed:7,aimError:0}),a=w.add('gold',{automatic:false,next:0}),b=w.add('gold',{x:2,automatic:false});w.fire(a,b);for(let f=0;f<100;f++)w.update(1/60);assert(b.hp<b.d.maxHealth,'Gold mirror: own projectiles ignore the flat reduction');w.clear();}
{ // Season 9 rework (11.10): dealer Gold, defense 900, split ore skips targets the same attack already hit.
  const {season9CycleConfig}=await import('./beta9-cycle-definitions.mjs');const g=season9CycleConfig();
  assert.equal(g.gold.projectileDamageReduction,900);assert.deepEqual([g.gold.stage1Damage,g.gold.stage2Damage,g.gold.stage3Damage],[3400,1700,850]);assert.equal(g.gold.goldSplitsSkipHitTargets,true);
  const w=createBeta6Combat(g,{seed:7,aimError:0}),a=w.add('gold',{automatic:false,next:0}),b=w.add('red',{x:2,automatic:false});w.fire(a,b);for(let f=0;f<120;f++)w.update(1/60);
  assert(Math.abs((b.d.maxHealth-b.hp)-3400)<1e-6,'point-blank: only the big ore hits, split ore passes through');w.clear();
  const v=createBeta6Combat(g,{seed:7,aimError:0}),s=v.add('blue',{automatic:false,next:0}),t=v.add('gold',{x:2,automatic:false});v.fire(s,t);for(let f=0;f<100;f++)v.update(1/60);assert(t.hp<t.d.maxHealth,'Blue can damage Gold now');v.clear();
}
console.log('PASS Gold defense, unchanged HP/basic damage/AI, prior season and actual incoming projectile reduction.');
