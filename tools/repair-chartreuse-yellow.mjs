import {writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const baseline=applyBeta7Balance(BETA_CHARACTERS),ids=Object.keys(baseline);
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
function pair(config,first,second,reps=30) {
 const [a,b]=ids.indexOf(first)<ids.indexOf(second)?[first,second]:[second,first];
 const r={wins:0,losses:0,draws:0,games:0};
 for(let s=0;s<6;s++)for(let n=0;n<reps;n++)for(const m of [1,-1]) {
  const duel=beta6Duel(config,m===1?a:b,m===1?b:a,scenarios[s],20260919+s*10000+n,m);
  const outcome=duel.outcome*m*(a===first?1:-1);
  r.wins+=outcome>0;r.losses+=outcome<0;r.draws+=outcome===0;r.games++;
 }
 r.score=(r.wins+r.draws*.5)/r.games;return r;
}
const patches=process.argv.includes('--straight')?[{},
 ...[.12,.18].flatMap(projectileDodgeDuration=>[2,3,4].map(projectileDodgeSpeedMultiplier=>({projectileDodgeDuration,projectileDodgeSpeedMultiplier,projectileDodgeDetectionRange:20,projectileDodgeKinds:['bullet','electric','enhanced','cc','plague']}))),
]:process.argv.includes('--dodge')?[{},
 ...[.12,.18,.25,.35].flatMap(projectileDodgeDuration=>[1.5,2,3,4].map(projectileDodgeSpeedMultiplier=>({projectileDodgeDuration,projectileDodgeSpeedMultiplier,projectileDodgeDetectionRange:20}))),
]:process.argv.includes('--refine')?[{},
 ...[8200,9000,9800,10500,11000].map(maxHealth=>({maxHealth,pursuesWhileLowHealth:true})),
 ...[4,5,6].flatMap(maxAmmo=>[8200,9000,9800].map(maxHealth=>({maxAmmo,maxHealth}))),
 ...[4,5].flatMap(maxAmmo=>[8200,9000,9800].map(maxHealth=>({maxAmmo,maxHealth,pursuesWhileLowHealth:true}))),
 ...[.9,.7,.5].flatMap(reloadDuration=>[9000,9800].map(maxHealth=>({reloadDuration,maxHealth,pursuesWhileLowHealth:true}))),
 ...[10.5,12,13].flatMap(chartreuseRange=>[9000,9800].map(maxHealth=>({chartreuseRange,maxHealth,pursuesWhileLowHealth:true}))),
]:[{},...[1,.9,.8,.7,.6].map(reloadDuration=>({reloadDuration})),
 ...[.45,.4,.35].map(attackCooldown=>({attackCooldown})),
 ...[10.5,11.5,12,12.5,13].map(chartreuseRange=>({chartreuseRange})),
 ...[26,30,36].map(chartreuseSpeed=>({chartreuseSpeed})),
 ...[9000,9800,11000].map(maxHealth=>({maxHealth})),
 ...[1450,1600,1800].map(chartreuseDamage=>({chartreuseDamage,chartreuseEnhancedDamage:chartreuseDamage*2})),
 ...[.9,.7].flatMap(reloadDuration=>[10.5,12,13].map(chartreuseRange=>({reloadDuration,chartreuseRange}))),
 ...[.45,.35].flatMap(attackCooldown=>[26,32].map(chartreuseSpeed=>({attackCooldown,chartreuseSpeed}))),
 ...[.9,.7].flatMap(reloadDuration=>[1450,1600].map(chartreuseDamage=>({reloadDuration,chartreuseDamage,chartreuseEnhancedDamage:chartreuseDamage*2})))];
const evaluate=(patch,reps)=>{
 const c=structuredClone(baseline);Object.assign(c.chartreuse,patch);
 const win=pair(c,'chartreuse','yellow',reps),loss=pair(c,'purple','chartreuse',reps);
 const cost=Object.entries(patch).reduce((sum,[k,v])=>sum+(Array.isArray(v)?.1:typeof v==='boolean'?.25:baseline.chartreuse[k]===undefined?v/10:Math.abs(v/baseline.chartreuse[k]-1)),0);
 return {patch,win,loss,cost};
};
const quick=patches.map(p=>evaluate(p,3)).sort((a,b)=>b.loss.score-a.loss.score||b.win.score-a.win.score||a.cost-b.cost);
const shortlist=process.argv.includes('--dodge')||process.argv.includes('--straight')?quick:[quick.find(r=>r.cost===0),...quick.filter(r=>r.loss.score===1).slice(0,12)].filter((r,i,a)=>a.indexOf(r)===i);
const verified=[];
for(const r of shortlist){const v=evaluate(r.patch,30);verified.push(v);console.log(JSON.stringify(v));}
const selected=verified.filter(r=>r.loss.wins===360).sort((a,b)=>b.win.score-a.win.score||a.cost-b.cost)[0];
writeFileSync(new URL(process.argv.includes('--straight')?'../specs/chartreuse-yellow-straight-options.json':process.argv.includes('--dodge')?'../specs/chartreuse-yellow-dodge-options.json':process.argv.includes('--refine')?'../specs/chartreuse-yellow-refined-options.json':'../specs/chartreuse-yellow-repair-options.json',import.meta.url),JSON.stringify({applied:false,baseline,quick,verified,selected,level:6,repetitions:30},null,2)+'\n');
console.log('SELECTED',JSON.stringify(selected));
