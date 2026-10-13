import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const config=applyBeta7Balance(BETA_CHARACTERS);
assert.equal(applyBeta6Balance(BETA_CHARACTERS).yellow.botAvoidLandingZones,undefined);
function trial(ultimate,enabled=true,manual=false,blocked) {
 const d=structuredClone(config);d.yellow.botAvoidLandingZones=enabled;
 const events=[];const world=createBeta6Combat(d,{bounds:40,aimError:0,blocked,onEvent:e=>events.push(e)});
 const yellow=world.add('yellow',{x:12,automatic:!manual,ammo:0,next:100});
 const ivory=world.add('ivory',{automatic:false,charge:3,next:0});
 const start=yellow.hp;
 if(ultimate)assert(world.cast(ivory,yellow,{point:{x:12,z:0},angle:0}));
 else assert(world.fire(ivory,yellow,0));
 let walkedThroughWall=false;
 for(let i=0;i<120;i++){world.update(1/60);if(blocked?.(yellow.x,yellow.z))walkedThroughWall=true;}
 return {start,yellow,events,walkedThroughWall};
}
for(const ultimate of [false,true]) {
 const enabled=trial(ultimate),disabled=trial(ultimate,false);
 console.log(ultimate?'ultimate':'normal',enabled.start-enabled.yellow.hp,disabled.start-disabled.yellow.hp);
 assert(enabled.events.some(e=>e.type==='landingDodge'&&e.ultimate===ultimate));
 assert(enabled.yellow.hp>disabled.yellow.hp,'prediction reduces received damage');
 const manual=trial(ultimate,true,true);
 assert(!manual.events.some(e=>e.type==='landingDodge'),'player movement is not automated');
}
const blocked=(x,z)=>x>13&&x<18&&Math.abs(z)<10;
const wall=trial(true,true,false,blocked);
assert.equal(wall.walkedThroughWall,false,'dodge does not cross walls');
assert(wall.events.some(e=>e.type==='landingDodge'));
console.log('PASS: normal and five-projectile ultimate landing avoidance, player control and wall collision');
