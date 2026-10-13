import assert from 'node:assert/strict';
import{GEM_GRAB_RULES,gemEscapeResult}from'../src/config/gem-grab.js';
import{eventMap,mapBlocked,navigateEventMap}from'../src/config/event-maps.js';
assert.equal(GEM_GRAB_RULES.spawnInterval,1.5);assert.equal(GEM_GRAB_RULES.maxInPlay,21);assert.equal(GEM_GRAB_RULES.respawnDelay,5);
const state={a:null,b:null};assert.equal(gemEscapeResult(state,{a:10,b:0},0),null);assert.equal(gemEscapeResult(state,{a:10,b:0},14.9),null);assert.equal(gemEscapeResult(state,{a:10,b:0},15),'a');gemEscapeResult(state,{a:9,b:10},16);assert.equal(state.a,null);assert.equal(state.b,16);assert.equal(gemEscapeResult(state,{a:10,b:10},30),null);assert.equal(gemEscapeResult(state,{a:10,b:10},31),'b');
for(let index=0;index<3;index++){const map=eventMap('gemGrab',index,20,20,[[-6,-15,2],[0,-15,2],[6,-15,2],[-6,15,2],[0,15,2],[6,15,2],[0,0,3]]);for(const x of [-6,0,6])for(const z of [-15,15]){assert(!mapBlocked(map,x,z));const step=navigateEventMap(map,{x,z},{x:0,z:0});assert(!mapBlocked(map,step.x,step.z));}}
console.log('PASS: Gem Grab timings, both team countdowns, cancellation, beta limits, three maps and spawn routes');
