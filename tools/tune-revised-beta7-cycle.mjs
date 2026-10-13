import { writeFileSync } from 'node:fs';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const config=applyBeta7Balance(BETA_CHARACTERS),baseline=structuredClone(config),report=[];
const cycle=['red','blue','orange','mint','cyan','pink','purple','chartreuse','yellow','ivory','gold','green','azure','lavender','crimson','crystal'];
function score(c,a,b,reps){let wins=0,draws=0,games=0;
 for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<reps;seed++)for(const reverse of [false,true]){
  const r=beta6Duel(c,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
  const outcome=r.outcome*(reverse?-1:1);wins+=outcome>0?1:0;draws+=outcome===0?1:0;games++;
 }return {wins,draws,games,score:(wins+draws/2)/games};}
const groups=[
 {id:'ivory',patches:[{},...[29,30,32,35].map(iceCreamSpeed=>({iceCreamSpeed})),{iceCreamDamage:2400}],edges:[['yellow','ivory'],['ivory','gold']]},
 {id:'gold',patches:[{},...[665,680,700,715].map(projectileDamageReduction=>({projectileDamageReduction})),...[1000,1050,1100].map(stage1Damage=>({stage1Damage})),{maxHealth:8500}],edges:[['ivory','gold'],['gold','green']]},
 {id:'cyan',patches:[{},...[20,22,24,28].map(spreadLineSpeed=>({spreadLineSpeed})),...[700,750,800].map(spreadLineDamage=>({spreadLineDamage})),{maxAmmo:4},{reloadDuration:.7}],edges:[['mint','cyan'],['cyan','pink']]},
 {id:'chartreuse',patches:[{},...[24,28,32].map(chartreuseSpeed=>({chartreuseSpeed})),...[10,10.5,11].map(chartreuseRange=>({chartreuseRange})),{reloadDuration:.9},{maxHealth:7200},{ultimate:{chargeRequired:3}},{ultimate:{chargeRequired:2}}],edges:[['purple','chartreuse'],['chartreuse','yellow']]},
 {id:'crystal',patches:[{},...[5,4,3].map(chargeRequired=>({ultimate:{chargeRequired}})),{crystalSpeed:24},{maxHealth:6500}],edges:[['crimson','crystal'],['crystal','red']]},
];
function apply(c,id,patch){const{ultimate,...stats}=patch;Object.assign(c[id],stats);if(ultimate)Object.assign(c[id].ultimate,ultimate);}
for(const group of groups){
 const candidates=[];
 for(const patch of group.patches){const c=structuredClone(config);apply(c,group.id,patch);
  const scores=group.edges.map(([a,b])=>score(c,a,b,30));
  const cost=Object.entries(patch).reduce((n,[k,v])=>n+(k==='ultimate'?Math.abs(v.chargeRequired/config[group.id].ultimate.chargeRequired-1):Math.abs(v/config[group.id][k]-1)),0);
  candidates.push({patch,scores,min:Math.min(...scores.map(r=>r.score)),sum:scores.reduce((n,r)=>n+r.score,0),cost});
 }
 candidates.sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);
 const best=candidates[0];apply(config,group.id,best.patch);report.push({id:group.id,edges:group.edges,candidates,selected:best});
 console.log(JSON.stringify({id:group.id,patch:best.patch,scores:best.scores.map(r=>r.score)}));
}
const verification=cycle.map((a,i)=>({a,b:cycle[(i+1)%16],...score(config,a,cycle[(i+1)%16],30)}));
console.table(verification.map(({a,b,score})=>({a,b,winRate:score*100})));
writeFileSync(new URL('../specs/beta7-revised-cycle-candidates.json',import.meta.url),JSON.stringify({applied:false,scope:'Candidate comparison only; no live balance changes',level:6,initialCharge:0,repetitions:30,baseline,cycle,report,config,verification,allTargetEdgesAchieved:verification.every(r=>r.score===1)},null,2)+'\n');
