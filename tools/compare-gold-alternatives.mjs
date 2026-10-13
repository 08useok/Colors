import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS);
base.gold.ultimate.delay=.35; // Keep the pre-alternative baseline reproducible.
const candidates=[
 {name:'baseline',patch:{}},
 ...[.25,.2,.15,.1,0].map(delay=>({name:`delay-${delay}`,patch:{ultimate:{delay}}})),
 ...[6.5,7].map(radius=>({name:`radius-${radius}`,patch:{ultimate:{radius}}})),
 ...[18,20].map(stage1Speed=>({name:`ore-speed-${stage1Speed}`,patch:{stage1Speed}})),
 {name:'ore-damage-1390',patch:{stage1Damage:1390}},
 {name:'delay-.2-radius-6.5',patch:{ultimate:{delay:.2,radius:6.5}}},
];
const ids=Object.keys(base),rows=[];
function pair(config,first,second){
 const [a,b]=ids.indexOf(first)<ids.indexOf(second)?[first,second]:[second,first];
 let wins=0,losses=0,draws=0;
 const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
 for(let s=0;s<scenarios.length;s++)for(let n=0;n<30;n++)for(const mirror of [1,-1]){
  const r=beta6Duel(config,mirror===1?a:b,mirror===1?b:a,scenarios[s],20260919+s*10000+n,mirror);
  const outcome=r.outcome*mirror*(a===first?1:-1);
  if(outcome>0)wins++;else if(outcome<0)losses++;else draws++;
 }
 return {wins,losses,draws,games:360,score:(wins+draws*.5)/360};
}
for(const candidate of candidates){
 const config=structuredClone(base),{ultimate,...stats}=candidate.patch;
 Object.assign(config.gold,stats);if(ultimate)Object.assign(config.gold.ultimate,ultimate);
 const green=pair(config,'gold','green'),ivory=pair(config,'ivory','gold');
 const historical=beta6Duel(config,'gold','green',{distance:10,aimError:.1,bounds:40,level:6},20270939,-1);
 rows.push({...candidate,goldGreen:green,ivoryGold:ivory,historical});
 console.log(candidate.name,`Gold→Green ${(green.score*100).toFixed(2)}% / Ivory→Gold ${(ivory.score*100).toFixed(2)}% / old loss ${historical.outcome}`);
}
writeFileSync(new URL('../specs/gold-alternative-candidates.json',import.meta.url),JSON.stringify({kind:'candidate-comparison',level:6,repetitions:30,liveUltimateDelay:applyBeta7Balance(BETA_CHARACTERS).gold.ultimate.delay,rows},null,2)+'\n');
