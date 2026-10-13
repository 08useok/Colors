import { writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { beta6Duel } from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS);
const only=process.argv.find(arg=>arg.startsWith('--group='))?.slice(8);
const report=[];
function score(config,a,b,repetitions=3){
 let wins=0,draws=0,games=0;
 for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<repetitions;seed++)for(const reverse of [false,true]){
  const r=beta6Duel(config,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
  const outcome=r.outcome*(reverse?-1:1);wins+=outcome>0?1:0;draws+=outcome===0?1:0;games++;
 }
 return (wins+draws/2)/games;
}
function cost(patch){return Object.entries(patch).reduce((sum,[id,stats])=>sum+Object.entries(stats).reduce((n,[key,value])=>n+Math.abs(value/base[id][key]-1),0),0);}
function search(name,candidates,edges){
 if(only&&only!==name)return null;
 const rows=[];
 for(const patch of candidates){
  const config=structuredClone(base);for(const [id,stats]of Object.entries(patch))Object.assign(config[id],stats);
  const scores=edges.map(([a,b])=>score(config,a,b));
  rows.push({patch,scores,min:Math.min(...scores),sum:scores.reduce((a,b)=>a+b,0),cost:cost(patch)});
 }
 rows.sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);
 report.push({name,edges,candidates:rows});
 console.log(name);console.table(rows.slice(0,8).map(r=>({patch:JSON.stringify(r.patch),scores:r.scores.join('/'),cost:r.cost})));
 return rows[0];
}
const golds=[{},...[8.5,9,10].map(stage1Range=>({stage1Range})),...[715,800,900,1000,1200].map(projectileDamageReduction=>({projectileDamageReduction}))];
const cyans=[{},...[750,800,850,900].map(spreadLineDamage=>({spreadLineDamage})),...[9,10].map(spreadLineRange=>({spreadLineRange})),{maxAmmo:4},{reloadDuration:.6}];
const goldCyan=search('gold-cyan',golds.flatMap(gold=>cyans.map(cyan=>({gold,cyan}))),[['ivory','gold'],['gold','cyan'],['cyan','green']]);
const yellows=[{},...[28,40,60].flatMap(electricSpeed=>[2800,3000,3300].map(electricDamage=>({electricSpeed,electricDamage}))),...[13,14,15].flatMap(electricRange=>[28,40,60].map(electricSpeed=>({electricRange,electricSpeed}))),{electricRange:14,electricSpeed:40,shockSlowPercent:.4}];
const mints=[{iceBulletDamage:1000,iceBulletSpeed:28,reloadDuration:.7},{iceBulletDamage:1000,iceBulletSpeed:28,freezeDuration:3}];
const yellowMint=search('yellow-mint',yellows.flatMap(yellow=>mints.map(mint=>({yellow,mint}))),[['crimson','yellow'],['yellow','mint'],['mint','pink']]);
const oranges=[{},...[10,11,12,13].map(bombRange=>({bombRange})),...[4500,5000].map(maxHealth=>({maxHealth})),{bombRange:11,bombSplashDamage:1000},{bombRange:11,bombSpeed:28},{bombRange:12,bombSplashDamage:1000},{bombRange:12,maxHealth:4500}];
const purples=[{},...[24,28,35].map(needleSpeed=>({needleSpeed})),...[24,28,35].map(vialSpeed=>({vialSpeed})),{needleSpeed:28,vialSpeed:28},{needleRange:15,vialRange:13},{needleSpeed:28,vialSpeed:28,needleRange:15,vialRange:13}];
const orangePurple=search('orange-purple',oranges.flatMap(orange=>purples.map(purple=>({orange,purple}))),[['pink','purple'],['purple','orange'],['orange','crystal']]);
writeFileSync(new URL(only?`../specs/beta7-${only}-candidates.json`:'../specs/beta7-counter-repair-candidates.json',import.meta.url),JSON.stringify({level:6,initialCharge:0,repetitions:3,report,best:[goldCyan,yellowMint,orangePurple].filter(Boolean)},null,2)+'\n');
