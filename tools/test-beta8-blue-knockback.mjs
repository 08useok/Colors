import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const old=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(old);
assert.equal(old.blue.bulletKnockback,1.5);assert.equal(defs.blue.bulletKnockback,0);
for(const ultimate of [false,true]){
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('blue',{automatic:false,next:0,team:'a'}),b=w.add('red',{x:3,automatic:false,team:'b',hp:100000});
 if(ultimate){a.charge=a.u.chargeRequired;assert(w.cast(a,b,{angle:0}));}else assert(w.fire(a,b,0));
 for(let i=0;i<60;i++)w.update(1/60);
 assert(b.hp<100000,'damage still applies');
 assert(Math.abs(b.x-(ultimate?3.65:3))<1e-7,ultimate?'ultimate knockback retained':'basic attack no longer pushes');w.clear();
}
assert(!defs.blue.basicAttack.description.includes('넉백'));
console.log('PASS Beta8 Blue: basic damage without knockback, ultimate knockback retained, prior season unchanged.');
