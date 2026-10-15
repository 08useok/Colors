import assert from 'node:assert/strict';
import {applyBeta7Balance}from'../src/config/beta7-balance.js';
import {BETA_CHARACTERS}from'../src/config/beta-characters.js';
import {createMainSeasonCombat}from'../src/combat/main-season-combat.js';
const config=applyBeta7Balance(BETA_CHARACTERS);
const vector=(x=0,z=0)=>({x,z,set(x,y,z){this.x=x;this.z=z;}});
function fighter(id,x,team=null,level=1){return{characterType:id,id:id+':'+x,isPlayer:true,team,levelMult:level,health:Math.round(config[id].maxHealth*level),maxHealth:Math.round(config[id].maxHealth*level),ammo:3,yaw:Math.PI/2,mesh:{position:vector(x)},shadow:{position:vector(x)}};}
function testWorld(fighters){let t=0;const hits=[];const bridge=createMainSeasonCombat(config,{fighters:()=>fighters,time:()=>t,blocked:()=>false,damage:(f,amount,source)=>{hits.push({id:f.id,amount,source:source?.id});f.health=Math.max(0,f.health-amount);f.dead=f.health<=0;},heal:(f,hp)=>{f.health=hp;f.dead=false;}});return {bridge,hits,step(seconds){for(let frame=0;frame<seconds*60;frame++){t+=1/60;bridge.update(1/60);}}};}
// Main input yaw is sin/cos; engine yaw is cos/sin. Player levels scale once.
{const a=fighter('crystal',0,null,1.1),b=fighter('red',6);const {bridge,hits,step}=testWorld([a,b]);assert(bridge.fire(a));step(.8);assert.equal(hits.reduce((s,h)=>s+h.amount,0),3850);assert.equal(b.health,b.maxHealth-3850);assert.equal(a.seasonUltimateCharge,3);}
// Both participants are locked, the analyzed target dies, cleanup removes state.
{const a=fighter('crystal',0),b=fighter('red',8);const {bridge,step}=testWorld([a,b]);bridge.actor(a).charge=6;assert(bridge.cast(a));assert(a.seasonActionLocked&&b.seasonActionLocked);assert(!bridge.fire(a));step(8.1);assert(b.dead);assert(!a.seasonActionLocked);bridge.clear();assert.equal(bridge.world.actors.length,0);assert.equal(bridge.world.projectiles.length,0);assert.equal(bridge.world.zones.length,0);}
// Follow the real player position rather than a stationary practice center.
{const a=fighter('lavender',0),b=fighter('red',20);const{bridge,step}=testWorld([a,b]);bridge.actor(a).charge=2;assert(bridge.cast(a));assert.equal(a.seasonUltimateCharge,0);a.mesh.position.x=20;step(1.1);assert(b.health<b.maxHealth);assert.equal(bridge.world.zones.find(z=>z.kind==='fragrance').x,20);}
// Same-team targets cannot be attacked; a respawn clears old binding/status.
{const a=fighter('crystal',0,'a'),b=fighter('red',6,'a');const{bridge,hits,step}=testWorld([a,b]);bridge.fire(a);step(1);assert.equal(hits.length,0);b.dead=true;b.health=0;step(.1);b.dead=false;b.health=b.maxHealth;step(.1);assert.equal(bridge.actor(b).hp,b.maxHealth);assert.equal(bridge.actor(b).analysisOwner,undefined);}
for(const id of Object.keys(config)){const a=fighter(id,0),b=fighter('red',8);const{bridge,step}=testWorld([a,b]);assert(bridge.fire(a),id);step(.3);assert([a.health,b.health,a.mesh.position.x,a.mesh.position.z].every(Number.isFinite));bridge.clear();}
{const a=fighter('crystal',0),b=fighter('red',10);const{bridge,step}=testWorld([a,b]);step(.1);b.mesh.position.z=1;bridge.fire(a);step(1/60);assert(Math.abs(bridge.actor(b).vz)>50,'manual target velocity survives input firing synchronization');}
for(const id of ['gold','mint','ivory','green']) {
  const a=fighter(id,0),b=fighter('red',2);b.health=b.maxHealth=1e8;
  const {bridge,step}=testWorld([a,b]);
  const actor=bridge.actor(a);actor.charge=actor.u.chargeRequired;
  assert(bridge.cast(a),id+' main cast');
  assert(a.seasonUltimateFieldActive,id+' main active HUD state');
  actor.charge=actor.u.chargeRequired;
  assert.equal(bridge.cast(a),false,id+' main recast blocked');
  assert.equal(a.seasonUltimateCharge,actor.u.chargeRequired,id+' main rejected cast preserves charge');
  step(16);
  assert.equal(a.seasonUltimateFieldActive,false,id+' main expiry clears HUD state');
  actor.charge=actor.u.chargeRequired;
  assert(bridge.cast(a),id+' main can recast after expiry');
  bridge.clear();
}
console.log('PASS: 16 main attacks, level scaling once, axis conversion, charge reset, following field, analysis locks, teams, respawn, cleanup and ultimate field recast locks');
