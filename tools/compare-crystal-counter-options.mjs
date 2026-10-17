import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {CHARACTERS} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance,beta6Ultimate} from '../src/config/beta6-balance.js';
import {atCharacterLevel} from './simulate-beta6-balance.mjs';
import {createBeta6Combat as createRuntimeCombat} from '../src/combat/beta6-combat.js';
const baselineRef='bdfe903';
const source=execFileSync('git',['show',baselineRef+':src/main.js'],{encoding:'utf8'}).replace(/\r\n/g,'\n'),start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');
const ctx=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),ctx);
const base=JSON.parse(JSON.stringify(ctx.CHARACTERS));
const engine=execFileSync('git',['show',baselineRef+':src/combat/beta6-combat.js'],{encoding:'utf8'}).replace(/^import .*;\r?$/m,'').replace('export function createBeta6Combat','function createBeta6Combat')
 .replace("{ kind: 'crystal', stage: 1, token: { hits: new Set() } }","{ kind: 'crystal', stage: 1, token: { hits: new Set() }, radius: d.crystalRadius ?? .2, homingTarget: target }")
 .replace('if (p.returning) p.yaw =',`if (p.kind==='crystal' && p.stage===1 && d.crystalHomingTurnRate && alive(p.homingTarget)) { const wanted=Math.atan2(p.homingTarget.z-p.z,p.homingTarget.x-p.x),diff=Math.atan2(Math.sin(wanted-p.yaw),Math.cos(wanted-p.yaw));p.yaw+=clamp(diff,-d.crystalHomingTurnRate*dt,d.crystalHomingTurnRate*dt); }
      if (p.returning) p.yaw =`);
assert(engine.includes('radius: d.crystalRadius'));assert(engine.includes('const wanted='));
const createCombat=new Function('beta6Ultimate',engine+'\nreturn createBeta6Combat;')(beta6Ultimate);
const options=[{id:'baseline',patch:{}},
 {id:'ai-speed-1',method:'ai',patch:{crimson:{projectileDodgeSpeedMultiplier:1}}},
 {id:'ai-duration-0.1',method:'ai',patch:{crimson:{projectileDodgeDuration:.1}}},
 {id:'ai-cooldown-0.9',method:'ai',patch:{crimson:{projectileDodgeCooldown:.9}}},
 {id:'ai-no-dodge',method:'ai',patch:{crimson:{projectileDodgeDuration:0}}},
 ...[.35,.5,.75,1,1.25,1.3,1.35,1.4,1.45,1.5,2].map(radius=>({id:'radius-'+radius,method:'radius',patch:{crystal:{crystalRadius:radius}}})),
 ...[.8,1.6,1.8,2,2.2,2.4,2.6,2.8,3,3.2,6.4].map(turn=>({id:'homing-'+turn,method:'homing',patch:{crystal:{crystalHomingTurnRate:turn}}}))];
function config(option){const c=structuredClone(base);for(const[id,stats]of Object.entries(option.patch))Object.assign(c[id],stats);return atCharacterLevel(c,6);}
function pair(defs,a,b,factory=createCombat){let wins=0,losses=0,draws=0,timeouts=0;
 for(let s=0;s<6;s++)for(let n=0;n<50;n++)for(const order of [1,-1]){
  const world=factory(defs,{seed:20260919+s*10000+n,aimError:[.035,.1][s%2],bounds:40,suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25}});
  const distance=[10,13,16][Math.floor(s/2)],left=world.add(order===1?a:b,{x:-order*distance/2}),right=world.add(order===1?b:a,{x:order*distance/2});
  for(let f=0;f<2700&&left.hp>0&&right.hp>0;f++)world.update(1/60);
  assert([left.hp,right.hp,left.x,right.x].every(Number.isFinite));
  const outcome=(left.hp<=0?-1:right.hp<=0?1:Math.sign(left.hp/left.d.maxHealth-right.hp/right.d.maxHealth))*order;
  wins+=outcome>0;losses+=outcome<0;draws+=outcome===0;timeouts+=left.hp>0&&right.hp>0;
 }
 return {wins,losses,draws,timeouts,games:600,winRate:100*(wins+draws/2)/600};
}
if(process.argv.includes('--verify-runtime')){
 const audit=JSON.parse(readFileSync('specs/crystal-counter-option-audit.json','utf8')),selected=audit.reports.find(r=>r.id===audit.recommended);
 const actualSource=readFileSync('src/main.js','utf8').replace(/\r\n/g,'\n'),actualContext=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
 const i=actualSource.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');vm.runInContext(actualSource.slice(i,actualSource.indexOf('\nconst ALPHA_SEASONS',i)),actualContext);
 const actual=JSON.parse(JSON.stringify(actualContext.CHARACTERS)),ids=Object.keys(actual),matrix={};
 assert.equal(selected.method,'homing');assert.equal(actual.crystal.crystalHomingTurnRate,selected.patch.crystal.crystalHomingTurnRate);
 for(const id of ids)if(id!=='crystal')assert.deepEqual(actual[id],base[id],'other character changed: '+id);
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)if([ids[i],ids[j]].includes('crystal')){const key=ids[i]+':'+ids[j];matrix[key]=pair(atCharacterLevel(actual,6),ids[i],ids[j],createRuntimeCombat);assert.deepEqual(matrix[key],selected.matrix[key],key);}
 writeFileSync('specs/crystal-counter-runtime-verification.json',JSON.stringify({selected:selected.id,games:8400,allCandidateResultsMatch:true,otherCharactersUnchanged:true,matrix},null,2)+'\n');console.log('PASS actual runtime: all 14 Crystal pairings (8400 games) exactly match selected candidate, other definitions unchanged');
}else if(!process.argv.includes('--audit')){
 const rows=[];for(const option of options){const r=pair(config(option),'crimson','crystal');rows.push({...option,crystalWinRate:100-r.winRate,crystalWins:r.losses});console.log(option.id,100-r.winRate);}
 writeFileSync('specs/crystal-counter-option-screen.json',JSON.stringify({scope:'Main 6-level Crystal -> Crimson, 600 games per option; candidate-only in-memory engine changes',rows},null,2)+'\n');
}else{
 const screen=JSON.parse(readFileSync('specs/crystal-counter-option-screen.json','utf8'));
 const chosen=['ai','radius','homing'].map(method=>screen.rows.find(r=>r.method===method&&r.crystalWinRate===100)).filter(Boolean);
 const historical=JSON.parse(readFileSync('specs/main-balance-regression.json','utf8')),baseline=structuredClone(historical.results.after),ids=Object.keys(base);
 const makeKey=(a,b)=>ids.indexOf(a)<ids.indexOf(b)?a+':'+b:b+':'+a;
 for(const b of ids.filter(b=>b!=='crystal')){const key=makeKey('crystal',b),[a,c]=key.split(':');baseline[key]=pair(config(options[0]),a,c);}
 const goals=historical.targets.filter(t=>!(t.id==='crimson'&&t.target==='crystal')&&t.id!=='crystal').map(t=>[t.id,t.target]);goals.push(['crystal','crimson'],['crimson','purple']);
 const rate=(matrix,a,b)=>{const key=makeKey(a,b);return key.startsWith(a+':')?matrix[key].winRate:100-matrix[key].winRate;};
 const reports=[];
 for(const option of chosen){const matrix=structuredClone(baseline),changed=Object.keys(option.patch);
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)if(changed.includes(ids[i])||changed.includes(ids[j]))matrix[ids[i]+':'+ids[j]]=pair(config(option),ids[i],ids[j]);
  const goalRows=goals.map(([a,b])=>({id:a,target:b,before:rate(baseline,a,b),after:rate(matrix,a,b)}));
  const differences=Object.keys(matrix).map(key=>({pair:key,before:baseline[key].winRate,after:matrix[key].winRate})).filter(r=>r.before!==r.after);
  const broken=goalRows.filter(r=>r.before===100&&r.after<100),totalShift=differences.reduce((s,r)=>s+Math.abs(r.after-r.before),0);
  reports.push({...option,goalRows,broken,totalShift,differences,matrix});console.log('AUDIT',option.id,'broken',broken.length,'shift',totalShift);console.table(goalRows);
 }
 reports.sort((a,b)=>a.broken.length-b.broken.length||a.totalShift-b.totalShift);
 writeFileSync('specs/crystal-counter-option-audit.json',JSON.stringify({scope:'Main 15-character matrix; current pre-existing goal failures remain visible; candidate changes only',gamesPerPair:600,goals,baseline,reports,recommended:reports.find(r=>r.broken.length===0)?.id??null},null,2)+'\n');
}
