import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
function setup(homing=true,blocked=()=>false){const config=applyBeta7Balance(BETA_CHARACTERS);if(homing)config.crystal.crystalHomingTurnRate=2.2;const world=createBeta6Combat(config,{blocked});const a=world.add('crystal',{automatic:false,next:0}),b=world.add('red',{automatic:false,x:8,z:2,hp:1e6});assert(world.fire(a,b,0));return {world,a,b,p:world.projectiles[0]};}
{const t=setup();t.world.update(.05);assert(t.p.yaw>0&&t.p.yaw<=2.2*.05+1e-8);assert.equal(t.p.radius,.2);assert(Math.abs(t.p.traveled-1)<1e-8);t.b.hp=0;const yaw=t.p.yaw;t.world.add('blue',{automatic:false,x:4,z:-4});t.world.update(.05);assert.equal(t.p.yaw,yaw,'dead target cannot redirect shot to another enemy');}
{const t=setup(false);t.world.update(.05);assert.equal(t.p.yaw,0,'beta shot remains straight');}
{const t=setup();let fragment;for(let i=0;i<100;i++){t.world.update(1/120);fragment=t.world.projectiles.find(p=>p.kind==='crystal'&&p.stage===2);if(fragment)break;}assert(fragment);const yaw=fragment.yaw;t.b.z+=5;t.world.update(1/120);assert.equal(fragment.yaw,yaw,'stage-two fragments never home');}
{const t=setup(true,x=>x>=2);for(let i=0;i<100;i++)t.world.update(1/60);assert(!t.world.projectiles.some(p=>p.kind==='crystal'&&p.stage===1));assert(t.p.x<2,'homing shot stops at wall');}
console.log('PASS Crystal homing: turn rate limited, speed/radius unchanged, dead target stops guidance, fragments/beta straight, walls stop shot');
