import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {CHARACTERS as baseline} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');
const context=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(baseline),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),context);
const main=context.CHARACTERS,beta=applyBeta7Balance(BETA_CHARACTERS);
assert.equal(main.crimson.moveSpeedMultiplier,beta.crimson.moveSpeedMultiplier);
assert.equal(main.crimson.attackDamage,beta.crimson.attackDamage);
function setup(config){const world=createBeta6Combat(config,{aimError:0,seed:7});const shooter=world.add('blue',{automatic:false,x:0,z:0,next:0,hp:1e6});const bot=world.add('crimson',{x:8,z:0,hp:1e6});return {world,shooter,bot,fire(yaw){shooter.next=0;shooter.ammo=3;assert(world.fire(shooter,bot,yaw));}};}
for(const yaw of [Math.PI,Math.PI/2]){const t=setup(main);t.fire(yaw);assert.equal(t.bot.dodgeUntil,0,'ignore outgoing and sideways projectiles');}
{const t=setup(main);t.fire(0);assert(t.bot.dodgeUntil>0);const until=t.bot.dodgeUntil,yaw=t.bot.dodgeYaw;
 for(let i=0;i<6;i++){t.world.update(.01);t.fire(0);assert.equal(t.bot.dodgeUntil,until,'volley must not prolong dodge');assert.equal(t.bot.dodgeYaw,yaw,'volley must not reroll direction');assert(Math.hypot(t.bot.vx,t.bot.vz)<=8*1.4*1.35+1e-8);}
 for(let i=0;i<40;i++)t.world.update(.01);t.bot.x=8;t.bot.z=0;t.fire(0);assert(t.bot.dodgeUntil>until,'dodge available again after cooldown');}
{const t=setup(beta);t.fire(Math.PI);assert(t.bot.dodgeUntil>0,'beta behavior preserved');assert.equal(t.bot.d.projectileDodgeSpeedMultiplier,5);}
console.log('PASS main Crimson AI: incoming threats only, stable volley dodge, 0.45s cooldown, speed <=15.12 tiles/s; base stats and beta preserved');
