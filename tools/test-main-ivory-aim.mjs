import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createMainSeasonCombat} from '../src/combat/main-season-combat.js';
const defs=applyBeta7Balance(BETA_CHARACTERS),close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const fighter=(id,x=0,z=0)=>({characterType:id,isPlayer:true,team:id,health:1e8,maxHealth:1e8,ammo:3,yaw:0,mesh:{position:{x,y:1.85,z}},shadow:{position:{set(){}}}});
function setup(point,hasEnemy=true){
 const a=fighter('ivory'),b=fighter('red',1,1),fighters=hasEnemy?[a,b]:[a];let time=0;
 const bridge=createMainSeasonCombat(defs,{fighters:()=>fighters,time:()=>time,blocked:()=>false,damage(){},aim:()=>point});
 return {a,bridge,step(seconds){for(let i=0;i<seconds*60;i++){time+=1/60;bridge.update(1/60);}}};
}
for(const point of [{x:3,z:4},{x:-3,z:4},{x:-3,z:-4},{x:30,z:0},{x:0,z:0}]){
 const q=setup(point);assert(q.bridge.fire(q.a));q.step(1.5);
 const zone=q.bridge.world.zones[0],factor=Math.min(1,defs.ivory.iceCreamRange/(Math.hypot(point.x,point.z)||1));
 close(zone.x,point.x*factor);close(zone.z,point.z*factor);
}
for(const hasEnemy of [true,false]){
 const point={x:-4,z:3},q=setup(point,hasEnemy);q.bridge.actor(q.a).charge=defs.ivory.ultimate.chargeRequired;
 assert(q.bridge.cast(q.a));q.step(1.5);
 const zones=q.bridge.world.zones;assert.equal(zones.length,5);
 const offset=defs.ivory.ultimate.patternRadius/Math.sqrt(2);
 for(const[dx,dz]of [[0,0],[-offset,-offset],[-offset,offset],[offset,-offset],[offset,offset]])assert(zones.some(z=>Math.hypot(z.x-point.x-dx,z.z-point.z-dz)<1e-8));
}
// Mobile/tap auto aim without a pointer uses the enemy position, not stale yaw.
{const q=setup(null);q.bridge.fire(q.a);q.step(1.5);const z=q.bridge.world.zones[0];close(z.x,1);close(z.z,1);}
console.log('PASS main Ivory: off-axis/behind/near/max-range landing, five ultimate landings, empty ground cast, mobile target');
