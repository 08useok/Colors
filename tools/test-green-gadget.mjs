import assert from 'node:assert/strict';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {GADGETS} from '../src/config/gadgets.js';
const defs=structuredClone(BETA_CHARACTERS);
Object.assign(defs.green,{attackWindup:0,boomerangAngles:[0,0,0,0],boomerangDamage:100,boomerangFarThreshold:100,boomerangReturnDamageMultiplier:1});
function setup(enabled=true){const events=[],w=createBeta6Combat(defs,{gadgets:enabled,aimError:0,onEvent:e=>events.push(e)}),a=w.add('green',{automatic:false,next:0,team:'a'}),b=w.add('red',{automatic:false,x:2,hp:100000,team:'b'});return {w,a,b,events};}
function step(w,s){for(let i=0;i<Math.ceil(s*600);i++)w.update(1/600);}
function volley(gadget){const c=setup();c.a.t={chargeMultiplier:1.5};if(gadget)assert(c.w.gadget(c.a));assert(c.w.fire(c.a,c.b,0));step(c.w,.5);return c;}
const plain=volley(false),enhanced=volley(true);
assert.equal(plain.b.hp-enhanced.b.hp,700,'one bonus, not four');
assert.equal(plain.a.charge,enhanced.a.charge,'bonus does not charge ultimate');
assert.equal(plain.a.transformCharge,enhanced.a.transformCharge,'bonus does not charge a future transformation');
assert.equal(enhanced.events.filter(e=>e.type==='gadgetBoomerang').length,1);
assert(enhanced.events.some(e=>e.type==='gadgetMark'));
for(const e of enhanced.events.filter(e=>e.type==='gadgetMark'))assert(Math.abs(e.until-e.time-3)<1e-8,'three-second mark');
for(const e of enhanced.events.filter(e=>e.type==='gadgetBoomerang'))assert(Math.abs(e.until-e.time-1.5)<1e-8,'1.5-second slow');
assert.equal(enhanced.b.slow,.3);assert(enhanced.b.slowUntil>enhanced.w.time);
assert.equal(enhanced.a.empoweredAttack,null);
assert.equal(enhanced.a.gadgetReadyAt,12);assert(!enhanced.w.gadget(enhanced.a));
step(enhanced.w,1.6);assert(enhanced.b.slowUntil<enhanced.w.time);
{
 const {w,a,b,events}=setup();w.gadget(a);w.fire(a,b,0);
 const p=w.projectiles[0];p.returning=true;p.x=2;p.z=0;p.speed=0;
 for(const other of w.projectiles.slice(1))other.x=15;
 step(w,.002);assert(!events.some(e=>e.type==='gadgetBoomerang'),'return hit without outbound mark');
}
{
 const {w,a,b,events}=setup();w.gadget(a);w.fire(a,b,0);
 const p=w.projectiles[0],token=p.greenTrick;
 token.marks.set(b.key,w.time+.01);(b.greenGadgetMarks??=new Map()).set(token,w.time+.01);
 for(const shot of w.projectiles){shot.x=15;shot.speed=0;shot.reach=100;}
 step(w,.02);assert.equal(b.greenGadgetMarks.size,0,'expired visual removed');
 p.returning=true;p.x=2;p.hits.clear();step(w,.002);
 assert(!events.some(e=>e.type==='gadgetBoomerang'),'expired mark cannot proc');
}
{
 const {w,a,b,events}=setup(),ally=w.add('red',{automatic:false,x:2,team:'a'}),c=w.add('red',{automatic:false,x:3,team:'b',hp:100000});
 w.gadget(a);w.fire(a,b,0);const token=w.projectiles[0].greenTrick;
 for(const p of w.projectiles){p.returning=true;p.speed=0;p.reach=100;p.x=15;}
 for(const [index,target]of [b,c].entries()){
  token.marks.set(target.key,w.time+3);
  const p=w.projectiles[index];p.x=target.x;p.hits.clear();step(w,.002);p.x=15;
 }
 assert.equal(events.filter(e=>e.type==='gadgetBoomerang').length,2,'one proc per distinct enemy');
 assert.equal(ally.hp,ally.d.maxHealth,'no allied damage');
}
{
 const {w,a}=setup(false);assert.equal(a.g,null);assert.equal(w.gadget(a),false,'gadget disabled editions unchanged');
}
assert.equal(GADGETS.green.name,'비열한 부메랑');
console.log('PASS Green: whole-volley cap, 700 bonus/no charge, 30%/1.5s slow, 12s cooldown, arming, outbound requirement, expiry, per-enemy effects, allies and gadget-off isolation.');
