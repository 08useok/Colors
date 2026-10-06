import assert from 'node:assert/strict';
import {EVENT_MAPS,eventMap,mapBlocked,navigateEventMap,bounceMapBall} from '../src/config/event-maps.js';
for(const [mode,maps] of Object.entries(EVENT_MAPS)){
 assert.equal(maps.length,3);
 const w=mode==='chopWood'?15:mode==='takedown'?52:20,d=mode==='chopWood'?30:mode==='takedown'?52:20;
 const reserved=mode==='chopWood'?[[0,-25,4],[0,25,4]]:[[0,0,3],[0,-15,2],[0,15,2]];
 const layouts=maps.map((_,i)=>eventMap(mode,i,w,d,reserved));
 const area=rs=>rs.reduce((n,r)=>n+r.width*r.depth,0);
 assert.ok(area(layouts[1].walls)>area(layouts[2].walls),mode+' wall density');
 assert.ok(area(layouts[2].bushes)>area(layouts[1].bushes),mode+' bush density');
 for(const l of layouts){
  for(const [x,z]of reserved)assert.equal(mapBlocked(l,x,z),false,mode+' objective');
  const actor={x:0,z:-d+2},target={x:0,z:d-2};
  for(let i=0;i<2000 && Math.hypot(actor.x-target.x,actor.z-target.z)>1;i++){
   const next=navigateEventMap(l,actor,target),dist=Math.hypot(next.x-actor.x,next.z-actor.z),step=Math.min(.25,dist);
   if(dist){actor.x+=(next.x-actor.x)*step/dist;actor.z+=(next.z-actor.z)*step/dist;}
   assert.equal(mapBlocked(l,actor.x,actor.z),false,mode+' route collision');
  }
  assert.ok(Math.hypot(actor.x-target.x,actor.z-target.z)<=1,mode+' objective route');
  // Cross a side cover, not only the open central lane.
  const a={x:-w+2,z:0},t={x:w-2,z:0};
  for(let i=0;i<2000 && Math.hypot(a.x-t.x,a.z-t.z)>1;i++){
   const n=navigateEventMap(l,a,t),dist=Math.hypot(n.x-a.x,n.z-a.z),step=Math.min(.25,dist);
   if(dist){a.x+=(n.x-a.x)*step/dist;a.z+=(n.z-a.z)*step/dist;}
   assert.equal(mapBlocked(l,a.x,a.z),false,mode+' side collision');
  }
  assert.ok(Math.hypot(a.x-t.x,a.z-t.z)<=1,mode+' cover detour');
 }
}
const wall={x:0,z:0,width:2,depth:6},p={x:-1.4,z:0},v={x:4,z:0};bounceMapBall(p,v,[wall]);assert.ok(v.x<0);assert.ok(p.x<=-1.55);
console.log('21 maps: terrain density, spawn/objective clearance, navigation and soccer wall bounce passed');


const fastBall={x:4,z:0},fastVelocity={x:100,z:0};bounceMapBall(fastBall,fastVelocity,[wall],.55,{x:-4,z:0});assert.ok(fastVelocity.x<0);assert.ok(fastBall.x<-1.5);
const {createBeta6Combat}=await import('../src/combat/beta6-combat.js');
const {BETA_CHARACTERS}=await import('../src/config/beta-characters.js');
const world=createBeta6Combat(BETA_CHARACTERS,{bushAt:(x)=>x>5});
const viewer=world.add('red',{x:0,z:0}),concealed=world.add('blue',{x:8,z:0});
assert.ok(world.hidden(concealed,viewer));viewer.x=6;assert.equal(world.hidden(concealed,viewer),false);viewer.x=0;world.hit(viewer,concealed,1);assert.equal(world.hidden(concealed,viewer),false);
console.log('Fast ball sweep and bush concealment / close detection / damage reveal passed');
