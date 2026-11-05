import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';import {atCharacterLevel} from './simulate-beta6-balance.mjs';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);assert.equal(prior.crystal.shardDamage,500);assert.equal(prior.crystal.shardUltimateCharge,undefined);
for(const level of [1,6])for(const stage of [2,3]){
 const c=atCharacterLevel(defs,level);assert.equal(c.crystal.shardDamage,Math.round(500*(1+(level-1)*.02)));const w=createBeta6Combat(c),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:.7,automatic:false,hp:100000});
 w.projectiles.push({key:999,owner:a,x:0,z:0,origin:{x:0,z:0},yaw:0,speed:18,reach:4,traveled:0,damage:stage===2?c.crystal.fragmentDamage:c.crystal.shardDamage,radius:.18,hits:new Set(),start:0,ultimate:false,kind:'crystal',stage,token:{hits:new Set()}});
 w.update(1/60);assert.equal(100000-b.hp,stage===2?c.crystal.fragmentDamage:c.crystal.shardDamage);assert.equal(a.charge,.5);w.clear();
}
console.log('PASS Crystal stage3 damage restored to500 across levels, restored stage3 .5 charge, stage2 .5 charge and prior-season unchanged.');
