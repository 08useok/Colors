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
console.log('PASS Gold defense, unchanged HP/basic damage/AI, prior season and actual incoming projectile reduction.');
