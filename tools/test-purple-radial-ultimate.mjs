import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const base=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(base),damage=defs.purple.ultimate.damage;
const run=(w,t)=>{for(let i=0;i<Math.round(t*240);i++)w.update(1/240);};
const events=[];const w=createBeta6Combat(defs,{bounds:40,onEvent:e=>events.push(e)});
const a=w.add('purple',{automatic:false,team:1,charge:8}),start=w.add('red',{automatic:false,team:2,x:1,hp:50000}),end=w.add('red',{automatic:false,team:2,x:12,hp:50000}),ally=w.add('red',{automatic:false,team:1,x:1,hp:50000});
assert(w.cast(a,end,{point:{x:12,z:0},angle:0}));
assert.equal(start.hp,50000-damage,'Central instant damage on takeoff');assert.equal(w.projectiles.length,16);
const angles=w.projectiles.map(p=>p.yaw);for(let i=1;i<angles.length;i++)assert(Math.abs(angles[i]-angles[i-1]-Math.PI/8)<1e-8);
assert(w.projectiles.every(p=>p.kind==='purpleThorn'&&p.ultimate&&p.damage===1100&&p.reach===10&&p.x===a.x&&p.z===a.z&&p.origin.x===a.x&&p.origin.z===a.z));
run(w,.4);assert.equal(start.hp,50000-damage-3300);assert.equal(ally.hp,50000);assert.equal(a.charge,1);assert(w.projectiles.length>0);
run(w,.41);assert.equal(events.filter(e=>e.type==='purpleLeap').length,2);assert.equal(events.filter(e=>e.type==='damage'&&e.target===end).length,17,'One central hit plus sixteen point-blank thorns');
run(w,.8);assert.equal(end.hp,50000-damage-16*1100);assert.equal(a.charge,2);assert.equal(w.projectiles.length,0);
// Each thorn has its own hit, separate from the central instant damage; charge is shared per phase.
const close=createBeta6Combat(defs,{bounds:40});const c=close.add('purple',{automatic:false,team:1,charge:8}),v=close.add('red',{automatic:false,team:2,x:0,hp:50000});
assert(close.cast(c,v,{point:{x:0,z:0},angle:0}));run(close,1.2);assert.equal(v.hp,50000-(damage+16*1100)*2);assert.equal(c.charge,2);
// Walls block thorns while the restored central area keeps its previous behavior.
const wall=createBeta6Combat(defs,{blocked:(x,z)=>x>.8&&x<1.3&&Math.abs(z)<5});const p=wall.add('purple',{automatic:false,team:1,charge:8}),b=wall.add('red',{automatic:false,team:2,x:2,hp:50000});
wall.cast(p,b,{point:{x:-8,z:0},angle:Math.PI});run(wall,.4);assert.equal(b.hp,50000-damage);
// Ten-tile range reaches enemies well beyond the previous 3.5-tile limit.
const far=createBeta6Combat(defs,{bounds:40});const f=far.add('purple',{automatic:false,team:1,charge:8}),remote=far.add('red',{automatic:false,team:2,x:8,hp:50000});
far.cast(f,remote,{point:{x:-12,z:0},angle:Math.PI});run(far,.7);assert.equal(remote.hp,50000-1100);
// Existing main/Season 7 definitions keep the original area-based leap.
assert.equal(base.purple.ultimate.projectileCount,undefined);
const old=createBeta6Combat(base);const o=old.add('purple',{automatic:false,charge:8}),t=old.add('red',{automatic:false,x:1,hp:50000});old.cast(o,t,{angle:0});assert.equal(t.hp,45000);assert.equal(old.projectiles.length,0);
w.clear();assert.equal(w.projectiles.length,0);
writeFileSync('specs/purple-radial-ultimate-verification.json',JSON.stringify({countPerBurst:16,totalPerLeap:32,centralDamagePerPhase:damage,thornDamage:1100,range:10,centerSpawn:true,centralInstantDamage:true,independentThornHits:true,chargePerTargetPerPhase:1,wallBlocking:true,alliesSafe:true,oldSeasonsUnchanged:true},null,2)+'\n');
console.log('PASS: 16+16 radial damaging thorns, angles, travel, separate central/1100 thorn hits, shared charge cap, allies, walls, cleanup and old-season isolation');
