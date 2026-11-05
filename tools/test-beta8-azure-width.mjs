import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {attackGuide,ultimateGuide} from '../src/config/aim-guides.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),c=applyBeta8Balance(prior);
assert.equal(prior.azure.surfWidth,2);assert.equal(c.azure.surfWidth,3);
for(const k of ['maxHealth','surfDamage','surfLength','surfSpeed','surfDashDistance','botIdealDistance','botFireRangeFactor','botApproachMin'])assert.equal(c.azure[k],prior.azure[k]);
assert.equal(c.azure.ultimate.width,prior.azure.ultimate.width);assert.equal(c.azure.ultimate.damage,6000);
assert.equal(attackGuide('azure',c.azure)[0].width,3);assert.equal(ultimateGuide('azure',c.azure)[0].width,4);
function damage(width,z){const d=structuredClone(c);d.azure.surfWidth=width;const w=createBeta6Combat(d,{aimError:0}),a=w.add('azure',{automatic:false,next:0}),b=w.add('red',{x:2,z,hp:100000,automatic:false});assert(w.fire(a,b,0));for(let f=0;f<50;f++)w.update(1/60);const loss=100000-b.hp;w.clear();return loss;}
assert.equal(damage(2,1.25),0);assert.equal(damage(3,1.25),3000);assert.equal(damage(3,1.65),0);
const source=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8');const start=source.indexOf('function startAzureWave('),end=source.indexOf('function updateAzureWave(',start);assert(start>=0&&end>start);
const ctx=vm.createContext({BETA_CHARACTERS:c,azureWaveState:null,goldRushState:{dead:false},player:{rotation:{y:0},position:{clone:()=>({})}},createAzureWaveMesh:(width,ultimate)=>({width,ultimate,rotation:{},position:{copy(){}}}),scene:{add(){}}});
vm.runInContext(source.slice(start,end)+';startAzureWave(false);',ctx);assert.equal(ctx.azureWaveState.width,3);assert.equal(ctx.azureWaveState.mesh.width,3);assert.equal(ctx.azureWaveState.damage,3000);
console.log('PASS Azure width edge hits, guide and actual practice mesh/state width; unchanged HP/damage/range/AI/ultimate and prior season.');
