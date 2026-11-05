import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {BETA_ULTIMATE_MOTIONS,betaUltimatePose} from '../src/config/beta-ultimate-motion.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {RASPBERRY_CHARACTER} from '../src/config/raspberry.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),snapshot=structuredClone(prior),defs=applyBeta8Balance(prior);
assert.deepEqual(prior,snapshot);
// Raspberry (Season 9 beta) is added by the beta page with its motion release as the windup.
defs.raspberry=structuredClone(RASPBERRY_CHARACTER);defs.raspberry.ultimate.motionWindup=BETA_ULTIMATE_MOTIONS.raspberry.release;
for(const[id,p]of Object.entries(BETA_ULTIMATE_MOTIONS)){
 for(const t of [0,p.release*.6,p.release,p.duration]){const pose=betaUltimatePose(id,t);assert([...pose.arm,...pose.forearm,...pose.leftArm,...pose.leftForearm,pose.strength].every(Number.isFinite));assert(pose.strength>=0&&pose.strength<=1);}
 if(id==='salmon')continue;
 const events=[],w=createBeta6Combat(defs,{aimError:0,onEvent:e=>events.push(e)}),a=w.add(id,{automatic:false,team:1}),b=w.add('red',{automatic:false,team:2,x:2,hp:1e8});w.add('red',{automatic:false,team:1,x:1});
 a.charge=a.u.chargeRequired;assert(w.cast(a,b,{angle:0}),id);assert.equal(a.charge,0);assert.equal(a.castCount,1);assert(!w.cast(a,b));assert(!w.fire(a,b));
 assert(events.some(e=>e.type==='ultimatePrepare'));assert(!events.some(e=>e.type==='ultimate'));
 for(let t=0;t<p.release-.0100001;){const dt=Math.min(.01,p.release-.01-t);w.update(dt);t+=dt;}assert(!events.some(e=>e.type==='ultimate'),id+' early');w.update(.02);assert(events.some(e=>e.type==='ultimate'),id+' release');assert.equal(a.castCount,1);
 const deadEvents=[],d=createBeta6Combat(defs,{onEvent:e=>deadEvents.push(e)}),c=d.add(id,{automatic:false,team:1}),enemy=d.add('red',{automatic:false,team:2,x:2});d.add('red',{automatic:false,team:1,x:1});c.charge=c.u.chargeRequired;assert(d.cast(c,enemy));c.hp=0;for(let i=0;i<Math.ceil((c.u.motionWindup??0)*60)+2;i++)d.update(1/60);assert(!deadEvents.some(e=>e.type==='ultimate'));assert.equal(c.ultimatePreparing,false);
 const removedEvents=[],r=createBeta6Combat(defs,{onEvent:e=>removedEvents.push(e)}),q=r.add(id,{automatic:false,team:1}),e=r.add('red',{automatic:false,team:2,x:2});r.add('red',{automatic:false,team:1,x:1});q.charge=q.u.chargeRequired;assert(r.cast(q,e));r.remove(q);for(let i=0;i<Math.ceil((q.u.motionWindup??0)*60)+2;i++)r.update(1/60);assert(!removedEvents.some(e=>e.type==='ultimate'));
}
console.log('PASS: 17 finite ultimate poses; 16 shared casts release after preparation, spend once, block repeated/basic input, cancel on death/removal; prior definitions unchanged. Salmon timing verified separately.');
