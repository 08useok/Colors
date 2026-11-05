import {readFileSync,writeFileSync} from 'node:fs';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta8Balance} from '../src/config/beta8-balance.js';
import {BETA8_COUNTER_TARGETS} from '../src/config/beta8-counter-targets.js';
import {beta6Duel} from './simulate-beta6-balance.mjs';
const config=applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)),original=structuredClone(config),changes={},logs=[];
if(process.argv.includes('--resume'))for(const[id,p]of Object.entries(JSON.parse(readFileSync(new URL('../specs/beta8-counter-tuning-candidates.json',import.meta.url),'utf8')).patches)){apply(config[id],p);changes[id]=structuredClone(config[id]);}
function score(defs,a,b,n=1){let wins=0,games=0;for(const distance of [6,10,14])for(const aimError of [.035,.1])for(let i=0;i<n;i++)for(const reverse of [false,true]){const r=beta6Duel(defs,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20261025+i+distance*1000+(aimError===.1?10000:0),reverse?-1:1);games++;wins+=r.outcome*(reverse?-1:1)>0?1:0;}return wins/games;}
function patches(id){const d=config[id],out=[{}];
 const fields={blue:{bulletDamage:[1200,1400,1600,1800],maxHealth:[4000,4500,5000]},orange:{maxHealth:[4200,4500,5000,5500],bombSplashDamage:[1250,1400,1600],bombSpeed:[24,28,35]},cyan:{spreadLineDamage:[850,1000,1200,1400,1800,2200],maxHealth:[7600,9000,11000]},gold:{projectileDamageReduction:[800,1000,1200,1400,1700,2000],stage1Damage:[1400,1700,2000]},lavender:{maxHealth:[7000,8500,10000,12000,15000],moveSpeedMultiplier:[1.1,1.2,1.3,1.5],sprayDamage:[1300,1500,1800]},crystal:{maxHealth:[7000,8500,10000,12000],crystalDamage:[2400,2800,3200]},purple:{needleDamage:[1200,1400,1600],vialDamage:[3200,3600,4000],maxHealth:[7000,8000]},chartreuse:{chartreuseDamage:[1500,1700,2000],maxHealth:[9000,10000,12000]},yellow:{electricDamage:[2800,3200,3600,4200],electricSpeed:[35,45,60],maxHealth:[6500,7500,9000]},crimson:{maxHealth:[11500,12500,14000],attackDamage:[2200,2500,2800]}}[id]||{};
 for(const[k,values]of Object.entries(fields))for(const value of values)out.push({[k]:value});
 if(id==='cyan')for(const spreadLineDamage of [1000,1400,1800])for(const maxHealth of [6200,7600,9000])out.push({spreadLineDamage,maxHealth});
 if(id==='cyan')for(const chargeRequired of [1,2,3,4,5])for(const botKnockbackUltimateTankRange of [3,4,4.5,5])out.push({ultimate:{chargeRequired},botKnockbackUltimateTankRange});
 if(id==='blue')for(const bulletDamage of [1080,1400,1800,2400,3000])for(const bulletSpeed of [68.75,90,120])out.push({bulletDamage,bulletSpeed});
 if(id==='orange')for(const maxHealth of [2000,2500,3000,3500,4000])for(const bombSpeed of [20,28,40,60])out.push({maxHealth,bombSpeed});
 if(id==='lavender')for(const chargeRequired of [1,1.5,2])for(const maxHealth of [7000,8500,10000,12000])out.push({maxHealth,special:{chargeRequired}});
 if(id==='lavender')for(const chargeRequired of [.5,1])for(const maxHealth of [6000,7000,8000,9000])for(const moveSpeedMultiplier of [1,1.2,1.4])out.push({maxHealth,moveSpeedMultiplier,special:{chargeRequired}});
 if(id==='crystal')for(const chargeRequired of [1,2,3,4,5])for(const maxHealth of [6000,7000,8500,10000])out.push({maxHealth,ultimate:{chargeRequired}});
 if(id==='crystal')for(const chargeRequired of [.5,1,1.5,2,2.5,3,3.5])for(const maxHealth of [6000,7000,8000,9000])out.push({maxHealth,ultimate:{chargeRequired}});
 if(id==='mint')for(const iceBulletDamage of [1100,1300,1500,1700])out.push({iceBulletDamage});
 if(id==='azure')for(const surfDamage of [1800,2200,2600,3000])out.push({surfDamage});
 if(id==='purple')for(const needleSpeed of [28,40,60])for(const vialSpeed of [24,35,50])out.push({needleSpeed,vialSpeed});
 if(id==='yellow')for(const electricDamage of [3000,3500,4000])for(const maxHealth of [6500,7500,8500])out.push({electricDamage,maxHealth});
 if(id==='chartreuse')for(const chartreuseDamage of [1500,1800,2100])for(const maxHealth of [8200,9000,10000])out.push({chartreuseDamage,maxHealth});
 const primary={blue:'bulletDamage',orange:'bombSplashDamage',cyan:'spreadLineDamage',gold:'stage1Damage',lavender:'sprayDamage',crystal:'crystalDamage',mint:'iceBulletDamage',purple:'needleDamage',chartreuse:'chartreuseDamage',yellow:'electricDamage',azure:'surfDamage',crimson:'attackDamage'}[id];
 if(primary&&Number.isFinite(d[primary]))for(const hp of [.8,1,1.1,1.2,1.4])for(const damage of [.9,1,1.1,1.25,1.5]){
  const maxHealth=Math.round(d.maxHealth*hp),value=Math.round(d[primary]*damage);if(maxHealth<=original[id].maxHealth*2&&value<=original[id][primary]*2)out.push({maxHealth,[primary]:value});
 }
 for(const ratio of [.8,.9,1.1,1.2])out.push({moveSpeedMultiplier:Math.min(original[id].moveSpeedMultiplier*1.5,d.moveSpeedMultiplier*ratio)});
 return out;
}
function apply(d,p){const{ultimate,special,...stats}=p;Object.assign(d,stats);if(ultimate)Object.assign(d.ultimate,ultimate);if(special)Object.assign(d.special,special);}
function cost(id,p){let total=0;function walk(p,b){for(const[k,v]of Object.entries(p)){if(typeof v==='number')total+=Math.abs(v/(b[k]||1)-1);else walk(v,b[k]);}}walk(p,original[id]);return total;}
for(let pass=0;pass<6;pass++){
 let modified=false;
 for(const id of ['cyan','gold','lavender','crystal','blue','orange','mint','purple','chartreuse','yellow','azure','crimson']){
  const target=BETA8_COUNTER_TARGETS.find(t=>t.id===id),edges=[[target.targetLoss,id],[id,target.targetWin]],prior=structuredClone(config[id]);
  const baseline=edges.map(([a,b])=>score(config,a,b,3));if(baseline.every(s=>s===1))continue;
  const rows=[];
  for(const patch of patches(id)){config[id]=structuredClone(prior);apply(config[id],patch);const scores=edges.map(([a,b])=>score(config,a,b));rows.push({patch,scores,min:Math.min(...scores),sum:scores[0]+scores[1],cost:cost(id,patch)});}
  rows.sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);
  const finalists=rows.slice(0,8);for(const row of finalists){config[id]=structuredClone(prior);apply(config[id],row.patch);row.scores=edges.map(([a,b])=>score(config,a,b,3));row.min=Math.min(...row.scores);row.sum=row.scores[0]+row.scores[1];}
  finalists.sort((a,b)=>b.min-a.min||b.sum-a.sum||a.cost-b.cost);const best=finalists[0];config[id]=prior;
  const oldMin=Math.min(...baseline),oldSum=baseline[0]+baseline[1];
  if(best.min>oldMin||best.min===oldMin&&best.sum>oldSum){apply(config[id],best.patch);changes[id]=structuredClone(config[id]);modified=true;}
  logs.push({pass,id,baseline,best,candidates:rows.slice(0,4)});console.log(JSON.stringify({pass,id,baseline,best}));
 }
 if(!modified)break;
}
const audit=BETA8_COUNTER_TARGETS.map(t=>({...t,score:score(config,t.id,t.targetWin,10)}));
const patchesOut={};for(const[id]of Object.entries(changes)){patchesOut[id]={};for(const[k,v]of Object.entries(config[id]))if(JSON.stringify(v)!==JSON.stringify(original[id][k]))patchesOut[id][k]=v;}
writeFileSync(new URL('../specs/beta8-counter-tuning-candidates.json',import.meta.url),JSON.stringify({scope:'candidate configurations, not yet applied',patches:patchesOut,logs,audit,perfect:audit.filter(r=>r.score===1).length},null,2)+'\n');console.log(JSON.stringify({patches:patchesOut,audit,perfect:audit.filter(r=>r.score===1).length}));
