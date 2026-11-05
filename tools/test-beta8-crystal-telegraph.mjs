import assert from 'node:assert/strict';import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const defs=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),run=(w,s)=>{for(let i=0;i<Math.ceil(s*60);i++)w.update(1/60);};
{
 const events=[],w=createBeta6Combat(defs,{onEvent:e=>events.push(e)}),a=w.add('crystal',{automatic:false,team:'a'}),b=w.add('red',{x:5,automatic:false,team:'b'});a.charge=a.u.chargeRequired;assert(w.cast(a,b));assert.equal(a.ultimateTelegraph.endsAt,1.5);assert.equal(a.ultimateTelegraph.targetKey,b.key);b.z=5;run(w,1.6);assert(!b.analysisOwner);assert(events.some(e=>e.type==='ultimateMiss'));assert.equal(a.charge,0);assert.equal(a.ultimateTelegraph,null);assert.equal(a.x,5);w.clear();
}
{
 const events=[],w=createBeta6Combat(defs,{onEvent:e=>events.push(e)}),a=w.add('crystal',{automatic:false,team:'a'}),b=w.add('purple',{x:5,team:'b',next:100}),ally=w.add('green',{x:5,z:.2,team:'a',next:100});a.charge=a.u.chargeRequired;w.cast(a,b);run(w,1.6);assert(events.some(e=>e.type==='ultimateEvade'&&e.owner===b));assert(!events.some(e=>e.type==='ultimateEvade'&&e.owner===ally));assert(!b.analysisOwner);assert(Math.hypot(b.x-5,b.z)>2);w.clear();
}
{
 const w=createBeta6Combat(defs),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:5,automatic:false});a.charge=a.u.chargeRequired;w.cast(a,b);a.hp=0;run(w,1.6);assert(!b.analysisOwner);assert.equal(a.ultimateTelegraph,null);w.clear();
}
console.log('PASS visible telegraph state, fixed path misses escaping targets, spent charge, generic bot reaction, allies ignored and canceled warning cleanup.');
