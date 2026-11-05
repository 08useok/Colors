import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {SALMON_CHARACTER} from '../src/config/salmon.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),c=applyBeta8Balance(prior);
for(const key of ['maxHealth','directDamage','splashDamage','landingDamage','attackRange','impactRadius','attackCooldown','maxAmmo'])assert.equal(c.salmon[key],SALMON_CHARACTER[key]);
assert.equal(c.salmon.botAimLeadFactor,.6);assert.equal(c.salmon.attackPerceptionMinRange,7);assert.equal(c.salmon.attackPerceptionRange,8.5);assert.equal(SALMON_CHARACTER.botAimLeadFactor,undefined);
c.testTarget={...c.gold};
for(const [gap,direction]of [[6,-1],[8,0],[10,1]]){const w=createBeta6Combat(c),a=w.add('salmon',{next:100});w.add('testTarget',{x:gap,automatic:false});w.update(1/60);assert.equal(Math.sign(a.x),direction,'spacing independent of enemy ID');w.clear();}
for(const automatic of [false,true]){const w=createBeta6Combat(c),a=w.add('salmon',{automatic,next:0}),b=w.add('testTarget',{x:6,vz:2,automatic:false});assert(w.fire(a,b));const f=w.salmon.flights[0];assert(Math.abs(f.z-(automatic?2*(a.d.throwWindup+6/a.d.throwSpeed)*.6:0))<1e-9,'manual aim exact, bot aim predicts movement');assert.equal(a.ammo,4);w.clear();}
{const w=createBeta6Combat(c,{destination:()=>({x:20,z:0})}),a=w.add('salmon',{next:100});w.add('testTarget',{x:6,automatic:false});w.update(1/60);assert(a.x>0,'objective navigation retained');w.clear();}
console.log('PASS Salmon spacing by geometry, manual vs bot throw, unchanged combat stats, source isolation and objective navigation.');
