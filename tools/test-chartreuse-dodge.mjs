import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const config=applyBeta7Balance(BETA_CHARACTERS);
assert.equal(applyBeta6Balance(BETA_CHARACTERS).chartreuse.projectileDodgeDuration,undefined);
for(const id of ['yellow','blue','purple']) {
 const w=createBeta6Combat(config,{seed:1,aimError:0,bounds:40});
 const bot=w.add('chartreuse',{x:8,ammo:0,next:100});
 const shooter=w.add(id,{automatic:false,next:0});
 assert(w.fire(shooter,bot,0));
 if(id==='purple') {
  assert.equal(bot.dodgeUntil,0,'fan volley does not trigger single-bullet dodge');
  shooter.next=0;shooter.index=1;assert(w.fire(shooter,bot,0));
  assert.equal(bot.dodgeUntil,0,'thrown poison field uses its own area rules');
 } else {
  assert.equal(bot.dodgeUntil,.12,'single bullet triggers short dodge');
  const oldZ=bot.z;w.update(1/60);
  assert(Math.abs(bot.z-oldZ)>.3,'bot sidesteps during the dodge');
 }
}
const w=createBeta6Combat(config,{seed:1});
const player=w.add('chartreuse',{x:8,automatic:false}),enemy=w.add('yellow',{automatic:false,next:0});
w.fire(enemy,player,0);assert.equal(player.dodgeUntil,0,'player movement remains manual');
const scenario={distance:10,aimError:.035,bounds:40,level:6};
const before=structuredClone(config);
for(const k of ['projectileDodgeDuration','projectileDodgeSpeedMultiplier','projectileDodgeDetectionRange','projectileDodgeKinds'])delete before.chartreuse[k];
assert.equal(beta6Duel(before,'chartreuse','yellow',scenario,20260926,-1).outcome,-1,'recorded failing seed reproduced');
assert.equal(beta6Duel(config,'chartreuse','yellow',scenario,20260926,-1).outcome,1,'recorded failing seed repaired');
console.log('PASS: straight-bullet dodge, fan/field exclusions, manual control, season isolation and failing seed repaired');
