import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const old=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(old);
assert.equal(defs.cyan.ultimate.damage,5200);assert.equal(old.cyan.botKnockbackUltimateTankRange,undefined);
for(const id of Object.keys(old))assert.equal(defs[id].maxHealth,id==='gold'?Math.round(old[id].maxHealth*.9):old[id].maxHealth,id+' health matches intentional beta changes');
assert.equal(defs.cyan.ultimate.chargeRequired,1.5);assert.equal(defs.lavender.special.chargeRequired,1);assert.equal(defs.crystal.ultimate.chargeRequired,1.5);assert.equal(defs.gold.projectileDamageReduction,1650);
for(const id of ['cyan','azure','crimson']){
 function scenario(targetId,distance,manual=false,team='b'){
  const w=createBeta6Combat(defs,{aimError:0}),a=w.add(id,{automatic:!manual,team:'a'}),b=w.add(targetId,{x:distance,automatic:false,team,hp:100000});a.charge=a.u.chargeRequired;return{w,a,b};
 }
 for(const tank of ['red','pink']){
  const reach=defs[id].botKnockbackUltimateTankRange;
  let {w,a,b}=scenario(tank,reach);assert(w.cast(a,b),id+' uses push ult against close '+tank);assert.equal(a.castCount,1);assert.equal(a.charge,0);w.clear();
  ({w,a,b}=scenario(tank,reach+.1));assert(!w.cast(a,b),id+' holds against distant tank');assert.equal(a.charge,a.u.chargeRequired);w.clear();
 }
 for(const [target,distance,team] of [['green',2,'b'],['red',2,'a']]){
  const {w,a,b}=scenario(target,distance,false,team);assert(!w.cast(a,b),id+' does not trigger on non-tank/allied tank');assert.equal(a.charge,a.u.chargeRequired);w.clear();
 }
 {const {w,a,b}=scenario('green',2,true);assert(w.cast(a,b),id+' manual cast unrestricted');w.clear();}
 {const {w,a,b}=scenario('green',1);w.add('red',{x:0,z:2,team:'b',automatic:false});assert(w.cast(a,b),id+' prioritizes nearby tank over selected non-tank');assert(Math.abs(a.angle-Math.PI/2)<1e-9);w.clear();}
 {const {w,a,b}=scenario('red',2);b.hp=0;assert(!w.cast(a,b),id+' ignores dead tank');w.clear();}
 {const {w,a,b}=scenario('red',2);b.hiddenUntil=100;b.revealedUntil=0;assert(!w.cast(a,b),id+' ignores hidden tank');w.clear();}
}
for(const angle of [0,Math.PI/2,.7]){
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('cyan',{automatic:false,next:0}),b=w.add('red',{x:7,automatic:false,hp:100000});
 assert(w.fire(a,b,angle));for(let i=0;i<30&&!w.projectiles.length;i++)w.update(1/60);assert.equal(w.projectiles.length,6);
 for(const p of w.projectiles)assert.equal(p.yaw,angle);
 for(let i=1;i<6;i++)assert(Math.abs(Math.hypot(w.projectiles[i].x-w.projectiles[i-1].x,w.projectiles[i].z-w.projectiles[i-1].z)-.75)<1e-9);
 w.clear();
}
console.log('PASS Beta8 Cyan 5200 ultimate, parallel six-shot geometry, three defensive-ultimate bots, close/far/ally/dead/hidden tanks, retargeting and unrestricted manual casts.');
for(const id of ['cyan','azure']){
 const w=createBeta6Combat(defs,{bounds:40,aimError:0}),a=w.add(id,{automatic:false,team:'a'}),b=w.add('red',{x:2,automatic:false,team:'b',hp:100000});a.charge=a.u.chargeRequired;assert(w.cast(a,b,{angle:0}));for(let i=0;i<60;i++)w.update(1/60);
 assert(Math.abs(b.x-(2+a.u.knockback))<1e-6,id+' applies full authored knockback once');w.clear();
}
{
 const w=createBeta6Combat(defs),a=w.add('crystal',{automatic:false,team:'a'}),b=w.add('red',{x:2,automatic:false,team:'b',hp:100000});b.guardUntil=100;a.charge=a.u.chargeRequired;assert(w.cast(a,b));for(let i=0;i<600;i++)w.update(1/60);assert.equal(b.hp,72000,'analysis deals fixed 28000 bypassing damage-reduction guard');w.clear();
 assert.equal(old.crystal.ultimate.executeBypassesGuard,undefined,'prior season execution rules unchanged');
}
console.log('PASS Beta8 full Cyan/Azure push distance and Crystal guard-piercing execution.');
