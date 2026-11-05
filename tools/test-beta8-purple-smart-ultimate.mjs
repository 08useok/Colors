import assert from 'node:assert/strict';import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);assert.equal(prior.purple.botSmartUltimate,undefined);assert.equal(defs.purple.maxHealth,prior.purple.maxHealth);
function setup(options={}){const w=createBeta6Combat(defs),a=w.add('purple',{team:'a',charge:2,...options.a}),b=w.add('crystal',{x:options.x??10,automatic:false,team:'b',hp:options.hp??6600});return{w,a,b};}
{const{w,a,b}=setup({hp:176,a:{ammo:0}});assert(!w.cast(a,b));assert.equal(a.charge,2);w.clear();}
{const{w,a,b}=setup({hp:2178,a:{hp:1000}});b.poisonOwner=a;b.poisonUntil=5;b.poisonNext=1;assert(!w.cast(a,b));assert.equal(a.charge,2);w.clear();}
{const{w,a,b}=setup({x:13});b.vx=10;assert(!w.cast(a,b));w.clear();}
{const{w,a,b}=setup({x:4});assert(w.cast(a,b));w.clear();}
{const{w,a,b}=setup({hp:176,a:{automatic:false}});assert(w.cast(a,b),'manual casts remain available');w.clear();}
console.log('PASS Purple health/poison/landing checks, reload instead of wasteful finisher dive, normal close ultimate, manual control and unchanged HP.');
