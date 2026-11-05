import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);
assert.equal(defs.crimson.projectileDodgeSpeedMultiplier,1.5);assert.equal(defs.crimson.projectileDodgeCooldown,.9);
assert.equal(prior.crimson.projectileDodgeSpeedMultiplier,5);
let evaded=0;
for(let seed=1;seed<=400;seed++){
 const w=createBeta6Combat(defs,{seed,aimError:0}),a=w.add('blue',{next:0,automatic:false}),b=w.add('green',{x:6});
 w.fire(a,b,0);w.update(.07);evaded+=+(b.dodgeUntil>w.time);w.clear();
}
assert(evaded>160&&evaded<240,`seeded 50% reactions: ${evaded}/400`);
// A failed roll cannot reroll every pellet of a multi-shot volley.
for(const chance of [0,1]){
 const config=structuredClone(defs);config.green.projectileDodgeChance=chance;
 const w=createBeta6Combat(config,{aimError:0}),a=w.add('cyan',{automatic:false,next:0}),b=w.add('green',{x:6});
 w.fire(a,b,0);w.update(.12);assert.equal(b.dodgeUntil>0,chance===1);assert(b.dodgeNext>w.time);w.clear();
}
// Range-band movement at low health: re-enter range, hold distance, back off.
for(const [x,direction]of [[25,1],[17,0],[8,-1]]){
 const w=createBeta6Combat(defs,{bounds:40}),a=w.add('blue',{hp:100,next:100}),b=w.add('red',{x,automatic:false});
 w.update(1/60);assert.equal(Math.sign(a.x),direction);w.clear();
}
assert.equal(defs.blue.maxHealth,prior.blue.maxHealth);assert.equal(defs.blue.bulletDamage,prior.blue.bulletDamage);
for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let n=0;n<10;n++)for(const reverse of [false,true]){
 const mirror=reverse?-1:1,seed=20261025+n+distance*1000+(aimError===.1?10000:0);
 const r=beta6Duel(defs,reverse?'gold':'salmon',reverse?'salmon':'gold',{distance,aimError,bounds:40,level:6},seed,mirror);
 assert(r.outcome*mirror>0,'preserve Salmon→Gold 120-case regression condition');
}
console.log(`PASS common 50% dodge (${evaded}/400 seeded opportunities), volley failure cooldown, Crimson smooth dodge, Blue low-health range re-entry with unchanged HP/damage.`);
