import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runInNewContext} from 'node:vm';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';import {applyBeta7Balance} from '../src/config/beta7-balance.js';import {applyBeta8Balance} from '../src/config/beta8-balance.js';import {BETA_ULTIMATE_MOTIONS} from '../src/config/beta-ultimate-motion.js';import {createBeta6Combat} from '../src/combat/beta6-combat.js';
const prior=applyBeta7Balance(BETA_CHARACTERS),defs=applyBeta8Balance(prior);assert.equal(defs.crystal.ultimate.motionWindup,1.5);assert.equal(prior.crystal.ultimate.motionWindup,undefined);
{
 const events=[],w=createBeta6Combat(defs,{onEvent:e=>events.push(e)}),a=w.add('crystal',{automatic:false}),b=w.add('red',{x:5,automatic:false,hp:50000});a.charge=a.u.chargeRequired;assert(w.cast(a,b));assert(!w.cast(a,b));for(let i=0;i<149;i++)w.update(.01);assert.equal(a.x,0);assert(!b.analysisOwner);assert(a.ultimatePreparing);w.update(.02);assert.equal(b.analysisOwner,a);assert(Math.abs(a.x)>0);assert(Math.abs(b.analysisExpires-events.find(e=>e.type==='analysis').time-8)<1e-7);w.clear();
}
{
 let timer,delay,calls=0;const noop=()=>{},source=readFileSync(new URL('../src/beta-season.js',import.meta.url),'utf8'),start=source.indexOf('function performCharacterUltimate()'),end=source.indexOf('function performCharacterUltimateCore()',start);
 const context={player:{position:{x:0,z:0},rotation:{y:0}},clock:{elapsedTime:1},BETA_CHARACTERS:defs,IS_BETA8_TEST:true,beta6Combat:null,betaState:{selectedCharacter:'crystal'},betaPracticeUltimatePending:null,modelLoading:{blocking:false},goldRushState:{dead:false},beta6PlayerAttackBlocked:()=>false,betaUltimateFieldActive:()=>false,updateCrimsonUltimateGauge:noop,BETA_ULTIMATE_MOTIONS,ultimateButton:{getAttribute:()=>1.5},betaAttackGeneration:1,startModelAttackMotion:noop,setTimeout:(fn,ms)=>{timer=fn;delay=ms;},performCharacterUltimateCore:()=>calls++,playPlayerSkinEffect:noop};
 runInNewContext(source.slice(start,end)+';performCharacterUltimate()',context);assert.equal(delay,1500);assert.equal(calls,0);timer();assert.equal(calls,1);
}
console.log('PASS Crystal: no dash/bind before 1.5s, release after 1.5s, eight-second analysis begins on bind, repeated casts blocked, actual practice timer1500ms and prior season unchanged.');
