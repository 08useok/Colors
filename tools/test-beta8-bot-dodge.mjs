import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);
for(const d of Object.values(defs))if(d.projectileDodgeChance!=null)d.projectileDodgeChance=1;
assert.equal(prior.blue.bulletRange,16);assert.equal(defs.blue.bulletRange,20);
for(const id of ['crimson','chartreuse'])assert.equal(defs[id].projectileDodgeDuration,prior[id].projectileDodgeDuration);
const run=(w,s)=>{for(let t=0;t<s;t+=1/60)w.update(1/60);};
// Shots now reach a target outside the old range.
{
 const w=createBeta6Combat(defs,{bounds:40,aimError:0}),a=w.add('blue',{automatic:false,next:0}),b=w.add('red',{automatic:false,x:19,hp:100000});
 assert(w.fire(a,b,0));run(w,1);assert(b.hp<100000);w.clear();
}
// At 19 tiles a bot recognizes its target and fires.
{
 const w=createBeta6Combat(defs,{bounds:40,aimError:0}),a=w.add('blue',{next:0}),b=w.add('red',{automatic:false,x:19});
 run(w,.25);assert(a.attackCount>0);w.clear();
}
for(const [automatic,angle,team,expected] of [[true,0,'b',true],[true,Math.PI/2,'b',false],[false,0,'b',false],[true,0,'a',false]]){
 const w=createBeta6Combat(defs,{bounds:40,aimError:0}),a=w.add('blue',{automatic:false,next:0,team:'a'}),b=w.add('green',{automatic,x:6,team,next:0});
 assert(w.fire(a,b,angle));run(w,.1);assert.equal(b.dodgeUntil>0,expected,'dodge only threatening enemy shots for bots');
 if(expected){assert(b.attackCount>0,'dodge does not stop attacks');const until=b.dodgeUntil;a.next=0;w.fire(a,b,0);assert.equal(b.dodgeUntil,until,'cooldown prevents repeated restarts');}
 w.clear();
}
console.log('PASS Blue range/recognition 20, bot threat-only dodge, manual/allied exclusion, cooldown, attacks during evasion and prior specialist settings.');
