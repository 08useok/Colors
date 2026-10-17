import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {ultimateGuide} from '../src/config/aim-guides.js';
function setup(width,x=8,z=.9){const config=applyBeta7Balance(BETA_CHARACTERS);if(width!==undefined)config.crystal.ultimate.width=width;const world=createBeta6Combat(config);const a=world.add('crystal',{automatic:false,charge:6});const b=world.add('crimson',{automatic:false,x,z});return {world,a,b,guide:ultimateGuide('crystal',config.crystal)};}
{const t=setup(1.1);assert(!t.world.cast(t.a,t.b,{angle:0}));assert.equal(t.a.charge,6);}
{const t=setup(2.2);assert.equal(t.guide[0].width,2.2);assert(t.world.cast(t.a,t.b,{angle:0}));assert.equal(t.a.charge,0);assert.equal(t.a.analysisTarget,t.b);for(let i=0;i<490;i++)t.world.update(1/60);assert(t.b.hp<=0);assert(!t.a.analysisTarget);}
for(const [x,z]of [[8,1.11],[-1,0],[18.1,0]]){const t=setup(2.2,x,z);assert(!t.world.cast(t.a,t.b,{angle:0}));assert.equal(t.a.charge,6);}
{const t=setup(2.2),first=t.world.add('red',{automatic:false,x:5,z:1.05});assert(t.world.cast(t.a,t.b,{angle:0}));assert.equal(t.a.analysisTarget,first);}
{const t=setup(undefined,8,4);assert.equal(t.guide[0].width,1.1);assert(t.world.cast(t.a,t.b,{angle:0}),'legacy beta targeting stays unchanged without width');}
console.log('PASS main Crystal ultimate: 2.2-tile guide and hit width, near-edge catch, outside/behind/range misses preserve charge, first target, execution/release, beta legacy preserved');
