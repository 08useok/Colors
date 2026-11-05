import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);
assert.equal(prior.orange.botTrackTargetDuringWindup,undefined);assert.equal(defs.orange.botAimLeadFactor,1);
for(const k of ['maxHealth','bombDamage','bombSplashDamage','bombSpeed','bombRange','maxAmmo','attackCooldown','moveSpeedMultiplier'])assert.equal(defs.orange[k],prior.orange[k]);
assert.equal(defs.orange.projectileDodgeChance,.5);
function yaw(automatic,enabled=true,manualAngle,hide=false){const c=structuredClone(defs);c.orange.botTrackTargetDuringWindup=enabled;const w=createBeta6Combat(c,{aimError:0}),a=w.add('orange',{automatic,next:0}),b=w.add('red',{x:6,automatic:false});assert(w.fire(a,b,manualAngle));b.z=3;if(hide)b.hiddenUntil=100;for(let f=0;f<10;f++)w.update(1/60);const p=w.projectiles.find(p=>p.kind==='bomb');assert(p);assert.equal(a.ammo,2);assert.equal(a.attackCount,1);const result=p.yaw;w.clear();return result;}
assert(yaw(true)>.2,'tracks changed target at release');assert.equal(yaw(true,false),0);assert.equal(yaw(false),0,'manual aim remains locked');assert.equal(yaw(true,true,.2),.2,'explicit angle preserved');assert.equal(yaw(true,true,undefined,true),0,'hidden target not tracked');
function move(enabled,mode='normal'){const c=structuredClone(defs);c.orange.botAvoidControlProjectiles=enabled;const w=createBeta6Combat(c,{seed:17,aimError:0,bounds:20,blocked:mode==='wall'?x=>x>2.5&&x<3.5:undefined});const b=w.add('mint',{next:0,automatic:false}),a=w.add('orange',{x:6,next:100,automatic:mode!=='manual'});assert(w.fire(b,a));if(mode==='renamed')b.id='testController';let last={x:a.x,z:a.z};for(let f=0;f<20;f++){w.update(1/60);assert(Math.hypot(a.x-last.x,a.z-last.z)<=8/60+1e-8);last={x:a.x,z:a.z};}const result={x:a.x,z:a.z};w.clear();return result;}
assert.notDeepEqual(move(true),move(false));assert.deepEqual(move(true,'renamed'),move(true),'control metadata independent of actor ID');for(const mode of ['manual','wall'])assert.deepEqual(move(true,mode),move(false,mode));
console.log('PASS Orange release tracking/manual angle/hidden target/ammo, control-path movement without actor-ID bonus, walls/manual exclusions, speed cap and unchanged combat stats/50-percent dodge.');
