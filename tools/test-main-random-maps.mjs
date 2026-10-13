import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {eventMap,MAIN_DENSE_WALLS,mapBlocked,navigateEventMap} from '../src/config/event-maps.js';
const source=await readFile(new URL('../src/main.js',import.meta.url),'utf8');
const functions=source.slice(source.indexOf('function mainEventMapIndex()'),source.indexOf('function addMainEventTerrain('));
const context={state:{},mpConfig:null,Math:Object.create(Math),eventMap,MAIN_DENSE_WALLS};
vm.createContext(context);vm.runInContext(functions,context);
for (const [index,roll] of [0,.34,.99].entries()) {
 context.Math.random=()=>roll;
 vm.runInContext('selectMainEventMap()',context);
 assert.equal(vm.runInContext('mainEventMapIndex()',context),index);
 context.Math.random=()=>{throw new Error('Map must not reroll during construction');};
 assert.equal(vm.runInContext('mainEventLayout("soccer",30,40).index',context),index);
}
context.mpConfig={mapId:2};
vm.runInContext('selectMainEventMap()',context);
assert.equal(context.state.currentMapId,2);
for (const name of ['resetGame','startTakeDown','startChopWood'])
 assert.match(source,new RegExp(`function ${name}\\([^)]*\\) \\{\\s*selectMainEventMap\\(\\);`));

const soccerSpawns=[[-9,-22],[0,-16],[9,-22],[-9,22],[0,16],[9,22]];
for (const [mode,w,d,reserved] of [
 ['soccer',30,40,[...soccerSpawns,[0,0,4]]],
 ['showdown',40,40,[[-30,-37],[0,-37],[30,-37],[37,0],[30,37],[0,37],[-30,37],[-37,0],[-8,0],[8,0],[0,0,3]]],
 ['goldRush',40,40,[[0,0,3]]],
 ['chopWood',15,30,[[-8,-28],[0,-28],[8,-28],[-8,28],[0,28],[8,28],[0,-25,4],[0,25,4]]],
]) {
 const old=eventMap(mode,1,w,d,reserved);
 const layout=eventMap(mode,1,w,d,reserved,MAIN_DENSE_WALLS);
 const area=rs=>rs.reduce((s,r)=>s+r.width*r.depth,0);
 assert.ok(area(layout.walls)/(4*w*d)>.2,mode+' at least 20% interior wall coverage');
 assert.ok(area(layout.walls)>area(old.walls)*3,mode+' walls meaningfully increased');
 for (const [x,z] of reserved) assert.equal(mapBlocked(layout,x,z),false,mode+' clear spawn/objective');
 for (const start of mode==='soccer'?soccerSpawns:[[-w+2,0],[0,-d+2]]) {
  const actor={x:start[0],z:start[1]},target={x:0,z:d-2};
  for(let i=0;i<3000&&Math.hypot(actor.x-target.x,actor.z-target.z)>1;i++) {
   const next=navigateEventMap(layout,actor,target),distance=Math.hypot(next.x-actor.x,next.z-actor.z);
   if(distance){const f=Math.min(.25,distance)/distance;actor.x+=(next.x-actor.x)*f;actor.z+=(next.z-actor.z)*f;}
   assert.equal(mapBlocked(layout,actor.x,actor.z),false,mode+' route collision');
  }
  assert.ok(Math.hypot(actor.x-target.x,actor.z-target.z)<=1,mode+' reachable goal');
 }
 console.log(`${mode}: ${layout.walls.length} walls, ${(100*area(layout.walls)/(4*w*d)).toFixed(1)}% coverage, clear routes`);
}
console.log('Main random selection and dense wall layouts passed');
