import assert from 'node:assert/strict';
import {createKnockoutMatch,advanceKnockout,knockoutSafeHalf} from '../src/config/knockout.js';
import {EVENT_MAPS,eventMap,mapBlocked} from '../src/config/event-maps.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
const fighters=()=>['a','a','a','b','b','b'].map(team=>({team,health:100,maxHealth:100,dead:false}));
let m=createKnockoutMatch(),f=fighters();
assert.equal(advanceKnockout(m,f,2),null);assert.equal(advanceKnockout(m,f,3),'start');
f.filter(a=>a.team==='b').forEach(a=>a.dead=true);
assert.equal(advanceKnockout(m,f,4),'round-end');assert.equal(m.wins.a,1);
assert.equal(advanceKnockout(m,f,5),null);assert.equal(advanceKnockout(m,f,7),'next-round');
f=fighters();assert.equal(advanceKnockout(m,f,10),'start');f.filter(a=>a.team==='b').forEach(a=>a.health=0);
assert.equal(advanceKnockout(m,f,11),'match-end');assert.equal(m.winner,'a');assert.equal(m.wins.a,2);assert.equal(advanceKnockout(m,f,12),null);
m=createKnockoutMatch();f=fighters();advanceKnockout(m,f,3);f.forEach(a=>a.dead=true);assert.equal(advanceKnockout(m,f,4),'round-end');assert.equal(m.lastWinner,null);assert.deepEqual(m.wins,{a:0,b:0});
m=createKnockoutMatch();f=fighters();advanceKnockout(m,f,3);f[5].health=0;advanceKnockout(m,f,93);assert.equal(m.lastWinner,'a');
m=createKnockoutMatch();f=fighters();advanceKnockout(m,f,3);f[5].health=50;advanceKnockout(m,f,93);assert.equal(m.lastWinner,'a');
assert.equal(knockoutSafeHalf(0),19.5);assert.equal(knockoutSafeHalf(45),19.5);assert.equal(knockoutSafeHalf(85),0);
const defs=applyBeta7Balance(BETA_CHARACTERS);
for(const allowRevives of [true,false]) {
 const events=[],w=createBeta6Combat(defs,{allowRevives,onEvent:e=>events.push(e)}),pink=w.add('pink',{team:'a',automatic:false}),ally=w.add('red',{team:'a',automatic:false}),enemy=w.add('red',{team:'b',automatic:false});
 pink.charge=pink.u.chargeRequired;ally.hp=0;
 assert.equal(w.cast(pink,enemy),allowRevives);assert.equal(ally.hp>0,allowRevives);
 ally.hp=1;ally.invulnerableUntil=0;ally.encoreUntil=100;ally.encoreOwner=pink;
 w.hit(enemy,ally,100000);assert.equal(ally.hp>0,allowRevives);
 const hp=pink.hp;w.hit(ally,pink,100);assert.equal(pink.hp,hp,'friendly fire');
}
for(let i=0;i<3;i++) {const l=eventMap('knockout',i,20,20,[[0,-15,2],[-6,-15,2],[6,-15,2],[-6,15,2],[0,15,2],[6,15,2]]);for(const x of [-6,0,6])for(const z of [-15,15])assert(!mapBlocked(l,x,z));}
assert.equal(EVENT_MAPS.knockout.length,3);
console.log('PASS: best of 3, countdown/intermission, simultaneous draw, timeout, poison bounds, no revival, default revival preserved, friendly fire, 3 maps and 6 spawns');
