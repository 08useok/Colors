import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../../src/config/beta-characters.js';
import {applyBeta7Balance} from '../../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../../src/config/beta8-balance.js';
import {beta6Duel} from '../simulate-beta6-balance.mjs';
const base=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),results=[];
for(const [name,change]of Object.entries({current:{},range14:{attackPerceptionMinRange:14},range16:{attackPerceptionMinRange:16},range18:{attackPerceptionMinRange:18},noRetreat:{pursuesWhileLowHealth:true},range14NoRetreat:{attackPerceptionMinRange:14,pursuesWhileLowHealth:true},range16NoRetreat:{attackPerceptionMinRange:16,pursuesWhileLowHealth:true},range18NoRetreat:{attackPerceptionMinRange:18,pursuesWhileLowHealth:true},guardEarlier:{attackPerceptionMinRange:14,pursuesWhileLowHealth:true,ultimateUseHealthMin:0,ultimateUseHealthMax:.75},longerDodge:{attackPerceptionMinRange:14,pursuesWhileLowHealth:true,projectileDodgeDuration:.5},shorterDodge:{attackPerceptionMinRange:14,pursuesWhileLowHealth:true,projectileDodgeDuration:.18}})){
 const config=structuredClone(base);Object.assign(config.blue,change);let wins=0,losses=0,draws=0;const failed=[];
 for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let n=0;n<10;n++)for(const reverse of [false,true]){
 const scenario={distance,aimError,bounds:40,level:6},seed=20261025+n+distance*1000+(aimError===.1?10000:0),mirror=reverse?-1:1;
 const r=beta6Duel(config,reverse?'orange':'blue',reverse?'blue':'orange',scenario,seed,mirror),outcome=r.outcome*mirror;
 wins+=+(outcome>0);losses+=+(outcome<0);draws+=+(outcome===0);if(outcome<0&&failed.length<3)failed.push({scenario,seed,reverse,hp:r.hp});
 }
 const row={name,change,wins,losses,draws,failed};results.push(row);console.log(JSON.stringify(row));
}
writeFileSync(new URL('../../specs/beta8-blue-spacing-candidates.json',import.meta.url),JSON.stringify(results,null,2));
