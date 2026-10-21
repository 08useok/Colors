import assert from 'node:assert/strict';
import { betaShowdownProfile, safeShowdownSpawn } from '../src/config/beta-showdown.js';
import { eventMap, mapBlocked, navigateEventMap } from '../src/config/event-maps.js';
const p=betaShowdownProfile(true),old=betaShowdownProfile(false);
assert.equal(p.halfSize*2,100);assert.equal(p.halfSize/old.halfSize,2.5);assert.equal((p.halfSize/old.halfSize)**2,6.25);assert.equal(p.actorLimit,49);assert.equal(old.actorLimit,19);
for(const mode of ['showdown','showdownPlus'])for(let i=0;i<3;i++){
 const layout=eventMap(mode,i,p.halfSize,p.halfSize);layout.navigationStep=p.navigationStep;
 const requested=[{x:0,z:p.playerSpawnZ},...Array.from({length:9},(_,n)=>({x:Math.sin(n*Math.PI*2/9)*p.botSpawnRadius,z:Math.cos(n*Math.PI*2/9)*p.botSpawnRadius}))];
 for(const point of requested){const spawn=safeShowdownSpawn(layout,point);assert(!mapBlocked(layout,spawn.x,spawn.z,.7));}
 const a=safeShowdownSpawn(layout,{x:-40,z:30}),b=safeShowdownSpawn(layout,{x:40,z:-30});const next=navigateEventMap(layout,a,b);assert(next);assert(!mapBlocked(layout,next.x,next.z,.65));
}
const blocked=eventMap('showdown',1,50,50);const wall=blocked.walls[0];const spawn=safeShowdownSpawn(blocked,{x:wall.x,z:wall.z});assert(!mapBlocked(blocked,spawn.x,spawn.z,.7));
console.log('PASS: 100x100 / 2.5 per axis, six layouts, safe spawns, enlarged navigation and legacy size');
