import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';import {atCharacterLevel} from './simulate-beta6-balance.mjs';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior),run=(w,s)=>{for(let i=0;i<Math.ceil(s*60);i++)w.update(1/60);};
assert.equal(prior.purple.ultimate.chargeRequired,8);assert.equal(defs.purple.ultimate.chargeRequired,2);assert.equal(defs.purple.basicUltimateChargeMultiplier,1);assert.equal(prior.crystal.ultimate.executionFixedAmount,undefined);
{
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('purple',{automatic:false,next:0}),b=w.add('red',{x:5,automatic:false,hp:100000});assert(w.fire(a,b,0));run(w,.6);assert.equal(a.charge,1);assert(!w.cast(a,b));b.x=defs.purple.vialRange;assert(w.fire(a,b,0));run(w,1);assert.equal(a.charge,2);assert(w.cast(a,b));w.clear();
}
for(const level of [1,6])for(const hp of [20000,50000]){
 const w=createBeta6Combat(atCharacterLevel(defs,level),{aimError:0}),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:2,automatic:false,hp});b.guardUntil=100;a.charge=a.u.chargeRequired;assert(w.cast(a,b));run(w,10);assert.equal(b.hp,Math.max(0,hp-28000));assert.equal(a.analysisTarget,null);assert(!b.analysisOwner);w.clear();
}
{
 const w=createBeta6Combat(prior),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:2,automatic:false,hp:50000});a.charge=a.u.chargeRequired;assert(w.cast(a,b));run(w,10);assert.equal(b.hp,0,'prior season execution unchanged');w.clear();
}
{
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('purple',{automatic:false}),b=w.add('red',{x:2,automatic:false,hp:1e9});a.u={...a.u,chargeRequired:100};a.charge=100;assert(w.cast(a,b,{angle:0}));run(w,3);assert.equal(a.charge,4*defs.purple.ultimate.rechargePerHit,'uncapped central and first-thorn awards remain separate');w.clear();
}
console.log('PASS Purple two-hit charge and separate ultimate recharge; fixed analysis 28000 across levels, shield bypass, survival/release and prior-season execution.');

// Execute the actual training damage bridge with rendering helpers stubbed.
{
 const source=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8'),start=source.indexOf('function damageTarget('),end=source.indexOf('function getActiveRedThemeSkin()',start);
 const noop=()=>{},damage=runInNewContext(source.slice(start,end)+';damageTarget',{clock:{elapsedTime:1},createDamagePopup:noop,createHitImpact:noop,createRedThemeHitEffect:noop,flashTarget:noop});
 for(const bypass of [false,true]){const target={visible:true,position:{},userData:{health:50000,maxHealth:50000,redGuardUntil:100,redGuardReduction:.7}};damage(target,28000,false,bypass);assert.equal(target.userData.health,bypass?22000:41600);}
}
console.log('PASS actual training damage bridge: fixed analysis bypasses guard; ordinary damage still respects it.');

{
 const w=createBeta6Combat(defs,{aimError:0}),a=w.add('crystal',{next:100}),b=w.add('red',{x:5,hp:50000,next:100,automatic:false});a.charge=a.u.chargeRequired;run(w,1.6);assert.equal(a.analysisTarget,b);b.automatic=true;const positions=[a.x,a.z,b.x,b.z];run(w,2);assert.deepEqual([a.x,a.z,b.x,b.z],positions,'both actors remain stationary during analysis');run(w,7);assert(!a.analysisTarget&&!b.analysisOwner);assert([a.x,a.z,b.x,b.z].some((v,i)=>Math.abs(v-positions[i])>1e-6),'movement resumes after surviving analysis');w.clear();
}
assert.equal(defs.chartreuse.poisonDPS,prior.purple.poisonDPS,'random CC poison is not buffed with Purple');
assert.equal(defs.purple.poisonDPS,1250);assert.equal(defs.purple.poisonDuration,5);assert.equal(defs.purple.needleSpeed,36);
console.log('PASS bound movement lock/release, sustained poison and independent random CC poison.');
