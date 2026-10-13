import {writeFileSync,readFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {BETA7_COUNTER_CYCLE} from '../src/config/beta7-counter-targets.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const previous=process.argv.some(a=>['--refine','--finish'].includes(a))?JSON.parse(readFileSync(new URL('../specs/beta7-cycle-repair-options.json',import.meta.url),'utf8')):null;
const baseline=previous?.baseline??applyBeta7Balance(BETA_CHARACTERS),config=structuredClone(previous?.config??baseline),ids=Object.keys(config);
const scenarios=[10,13,16].flatMap(distance=>[.035,.1].map(aimError=>({distance,aimError,bounds:40,level:6})));
function apply(c,patch){for(const[id,stats]of Object.entries(patch)){for(const[k,v]of Object.entries(stats)){if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(c[id][k],v);else c[id][k]=v;}}}
function score(c,first,second,reps){
 const [a,b]=ids.indexOf(first)<ids.indexOf(second)?[first,second]:[second,first];let wins=0,draws=0,games=0;
 for(let s=0;s<6;s++)for(let n=0;n<reps;n++)for(const mirror of [1,-1]){
  const r=beta6Duel(c,mirror===1?a:b,mirror===1?b:a,scenarios[s],20260919+s*10000+n,mirror);
  const outcome=r.outcome*mirror*(a===first?1:-1);wins+=outcome>0;draws+=outcome===0;games++;
 }return {wins,draws,losses:games-wins-draws,games,score:(wins+.5*draws)/games};
}
function cost(patch,c){let value=0;for(const[id,stats]of Object.entries(patch)){
 const walk=(p,b)=>{for(const[k,v]of Object.entries(p)){if(Array.isArray(v))value+=v.reduce((sum,n,i)=>sum+Math.abs(n/b[k][i]-1),0)/v.length;else if(typeof v==='object')walk(v,b[k]);else value+=Math.abs(v/b[k]-1);}};walk(stats,c[id]);
}return value;}
const combine=(aId,a,bId,b)=>a.flatMap(x=>b.map(y=>({[aId]:x,[bId]:y})));
let groups=[
 {name:'mint-cyan',edges:[['orange','mint'],['mint','cyan'],['cyan','pink']],patches:combine('mint',[
 {},{iceBulletDamage:750},{iceBulletDamage:800},{iceBulletSpeed:24},{iceBulletDamage:800,iceBulletSpeed:24}], 'cyan',[
 {},{spreadLineDamage:675},{spreadLineDamage:700},{spreadLineSpeed:22},{spreadLineRange:9}])},
 {name:'purple-chartreuse',edges:[['pink','purple'],['purple','chartreuse'],['chartreuse','yellow']],patches:combine('purple',[
 {},{needleDamage:1200},{poisonDPS:900,vialDamage:3200},{needleRange:14,vialRange:12},{ultimate:{chargeRequired:6}}], 'chartreuse',[
 {},{chartreuseDamage:1450,chartreuseEnhancedDamage:2900},{chartreuseDamage:1600,chartreuseEnhancedDamage:3200},
 {chartreuseRange:10.5,chartreuseSpeed:28},{chartreuseRange:12,chartreuseSpeed:28},{maxHealth:7400},{ultimate:{chargeRequired:3}}])},
 {name:'yellow',edges:[['chartreuse','yellow'],['yellow','ivory']],patches:[{},
 ...[18,20,24,28].map(electricSpeed=>({yellow:{electricSpeed}})),
 ...[2400,2600].map(electricDamage=>({yellow:{electricDamage}})),{yellow:{electricRange:13,electricSpeed:24}}]},
 {name:'crimson-crystal',edges:[['lavender','crimson'],['crimson','crystal'],['crystal','red']],patches:combine('crimson',[
 {},{ultimateChargeRequired:6},{ultimateDamage:6000},{ultimateLength:7},{attackDamages:[1467,1467,1466]},{attackCooldown:.68}], 'crystal',[
 {},{crystalDamage:2100},{crystalSpeed:22},{crystalRange:12},{ultimate:{chargeRequired:5}},{crystalDamage:2200,crystalSpeed:24}])},
];
if(previous)groups=[
 {name:'mint-refine',edges:[['orange','mint'],['mint','cyan'],['cyan','pink']],patches:[{},
 ...[850,900,1000].map(iceBulletDamage=>({mint:{iceBulletDamage}})),
 ...[6,5].map(chargeRequired=>({mint:{special:{chargeRequired}}})),
 {mint:{iceBulletDamage:850,special:{chargeRequired:6}}}]},
 {name:'purple-chartreuse-yellow-refine',edges:[['pink','purple'],['purple','chartreuse'],['chartreuse','yellow'],['yellow','ivory']],patches:[{},
 ...[{}, {chartreuse:{ultimate:{chargeRequired:2}}}, {chartreuse:{ultimate:{chargeRequired:3}}},
 {chartreuse:{chartreuseDamage:1450,chartreuseEnhancedDamage:2900}},
 {chartreuse:{maxHealth:8200}},
 {chartreuse:{maxHealth:8200,ultimate:{chargeRequired:2},chartreuseDamage:1450,chartreuseEnhancedDamage:2900}}]
 .flatMap(p=>[{}, {purple:{needleSpeed:22,vialSpeed:22}}].flatMap(q=>[{}, {yellow:{electricSpeed:18}}].map(r=>({...p,...q,...r}))))]},
 {name:'crimson-crystal-refine',edges:[['lavender','crimson'],['crimson','crystal'],['crystal','red']],patches:combine('crimson',[
 {},{attackCooldown:.68},...[6,5,4,3].map(ultimateChargeRequired=>({ultimateChargeRequired}))], 'crystal',[
 {},{ultimate:{chargeRequired:5}},{ultimate:{chargeRequired:4}},{crystalRange:13},{crystalSpeed:22}])},
];
if(process.argv.includes('--finish'))groups=[
 {name:'chartreuse-yellow-finish',edges:[['purple','chartreuse'],['chartreuse','yellow'],['yellow','ivory']],patches:combine('chartreuse',[
 {},{moveSpeedMultiplier:1.1},{moveSpeedMultiplier:1.2},{reloadDuration:.9},{maxAmmo:4},
 {chartreuseSpeed:32},{chartreuseRange:10.5},{chartreuseRange:12},{chartreuseDamage:1600,chartreuseEnhancedDamage:3200},
 {moveSpeedMultiplier:1.1,chartreuseSpeed:28},{moveSpeedMultiplier:1.2,chartreuseRange:10.5},
 {chartreuseRange:12,chartreuseSpeed:32}], 'yellow',[
 {},{electricSpeed:18},{electricSpeed:18,shockSlowPercent:.2}])},
 {name:'crystal-red-finish',edges:[['crimson','crystal'],['crystal','red']],patches:[{},
 ...[6400,6600,7000,7400].map(maxHealth=>({crystal:{maxHealth}})),
 ...[5,4,3].map(chargeRequired=>({crystal:{ultimate:{chargeRequired}}})),
 {crystal:{crystalRange:13}},{crystal:{crystalRange:14}},
 {crystal:{ultimate:{chargeRequired:4},maxHealth:6600}},
 {crystal:{ultimate:{chargeRequired:5},maxHealth:7000}},
 {crystal:{crystalSpeed:24}},{crystal:{fragmentDamage:1100,shardDamage:550}},
 {crystal:{crystalDamage:2200}},{crystal:{maxAmmo:4}}]},
];
const report=previous?.report??[],selected=previous?.selected??{};
for(const group of groups){
 const before=group.edges.map(([a,b])=>score(config,a,b,30));
 const quick=group.patches.map(patch=>{const c=structuredClone(config);apply(c,patch);const scores=group.edges.map(([a,b])=>score(c,a,b,3));
  return {patch,scores,min:Math.min(...scores.map(s=>s.score)),sum:scores.reduce((n,s)=>n+s.score,0),cost:cost(patch,config)};
 }).sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);
 const shortlist=[quick.find(r=>r.cost===0),...quick.slice(0,previous?14:7)].filter((r,i,rows)=>r&&rows.indexOf(r)===i);
 const verified=[];
 for(const candidate of shortlist){const c=structuredClone(config);apply(c,candidate.patch);const scores=group.edges.map(([a,b])=>score(c,a,b,30));
  const row={...candidate,scores,min:Math.min(...scores.map(s=>s.score)),sum:scores.reduce((n,s)=>n+s.score,0),nonRegression:scores.every((s,i)=>s.score>=before[i].score)};
  verified.push(row);
 }
 const eligible=verified.filter(r=>r.nonRegression).sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);
 const best=eligible[0];apply(config,best.patch);
 for(const[id,stats]of Object.entries(best.patch))if(Object.keys(stats).length)selected[id]={...selected[id],...stats};
 report.push({name:group.name,edges:group.edges,before,quick,verified,selected:best});
 console.log(JSON.stringify({group:group.name,patch:best.patch,before:before.map(s=>100*s.score),after:best.scores.map(s=>100*s.score)}));
}
const verification=BETA7_COUNTER_CYCLE.map((a,i)=>({a,b:BETA7_COUNTER_CYCLE[(i+1)%16],...score(config,a,BETA7_COUNTER_CYCLE[(i+1)%16],30)}));
console.table(verification.map(({a,b,score})=>({a,b,winRate:100*score})));
writeFileSync(new URL('../specs/beta7-cycle-repair-options.json',import.meta.url),JSON.stringify({applied:false,level:6,repetitions:30,baseline,selected,config,report,verification},null,2)+'\n');
