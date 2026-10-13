import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS); delete base.crystal.botAimLeadFactor;
function pair(config,first,second){let wins=0,losses=0,draws=0;const ids=Object.keys(config),ordered=ids.indexOf(first)<ids.indexOf(second)?[first,second]:[second,first];const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError})));for(let s=0;s<6;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]){const order=mirror===1?ordered:[...ordered].reverse();const r=beta6Duel(config,...order,scenarios[s],20260919+s*10000+n,mirror);const score=r.outcome*(order[0]===first?1:-1);if(score>0)wins++;else if(score<0)losses++;else draws++;}return {wins,losses,draws};}
const candidates=[{},...[0,.2,.4,.5,.6,.7,.8,.9,1].map(botAimLeadFactor=>({botAimLeadFactor}))];
const rows=[];for(const patch of candidates){const config=structuredClone(base);Object.assign(config.crystal,patch);const row={patch,crystalRed:pair(config,'crystal','red'),crimsonCrystal:pair(config,'crimson','crystal')};rows.push(row);console.log(JSON.stringify(row));}
writeFileSync('specs/crystal-red-aim-options.json',JSON.stringify({applied:false,baseline:base.crystal,rows},null,2)+'\n');
