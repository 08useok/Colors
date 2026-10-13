import { readFileSync, writeFileSync } from 'node:fs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { BETA7_COUNTER_CYCLE } from '../src/config/beta7-counter-targets.js';
import { beta6Duel, tournament } from './simulate-beta6-balance.mjs';
const base=applyBeta7Balance(BETA_CHARACTERS);
const extended=process.argv.includes('--extended');
const baseline=extended?tournament(base,30):JSON.parse(readFileSync(new URL('../specs/beta7-matchup-results.json',import.meta.url),'utf8'));
if(extended)writeFileSync(new URL('../specs/beta7-matchup-extended-results.json',import.meta.url),JSON.stringify({scope:'beta season 7, current 16 characters',initialCharge:0,drawScore:.5,...baseline},null,2)+'\n');
const ids=Object.keys(base),start=ids.indexOf('red'),full=(1<<ids.length)-1;
const oldEdges=new Set(BETA7_COUNTER_CYCLE.map((id,i)=>id+'>'+BETA7_COUNTER_CYCLE[(i+1)%16]));
function route(matrix,threshold){
 const neighbors=ids.map((a,i)=>ids.map((b,j)=>({j,score:i===j?0:matrix[a][b].score,kept:oldEdges.has(a+'>'+b)}))
  .filter(({j,score})=>j!==i&&score>=threshold&&(a!=='azure'||ids[j]==='lavender')&&(a!=='lavender'||ids[j]==='crimson')&&(ids[j]!=='lavender'||a==='azure')&&(ids[j]!=='crimson'||a==='lavender'))
  .sort((a,b)=>Number(b.kept)-Number(a.kept)||b.score-a.score).map(({j})=>j));
 if(neighbors.some(row=>row.length===0))return null;
 const failed=new Set();
 function dfs(last,mask,path){
  if(mask===full)return neighbors[last].includes(start)?path:null;
  const key=mask*16+last;if(failed.has(key))return null;
  for(const next of neighbors[last])if(!(mask&(1<<next))){const found=dfs(next,mask|(1<<next),[...path,next]);if(found)return found;}
  failed.add(key);return null;
 }
 return dfs(start,1<<start,[start])?.map(i=>ids[i])??null;
}
function bestRoute(matrix){
 const levels=[...new Set(Object.values(matrix).flatMap(row=>Object.values(row).map(v=>v.score)))].sort((a,b)=>b-a);
 for(const threshold of levels){const path=route(matrix,threshold);if(path)return{threshold,path,weak:path.map((a,i)=>({a,b:path[(i+1)%16],score:matrix[a][path[(i+1)%16]].score})).filter(e=>e.score!==1)};}
 throw new Error('No cycle');
}
const variants=[{name:'unchanged',patch:{}},
 {name:'small-speed-range',patch:{gold:{stage1Speed:20},cyan:{spreadLineRange:10},yellow:{electricSpeed:20}}},
 {name:'faster-projectiles',patch:{gold:{stage1Speed:24},cyan:{spreadLineRange:10},yellow:{electricSpeed:28}}},
 {name:'range',patch:{gold:{stage1Range:8.5},cyan:{spreadLineRange:10},yellow:{electricRange:13,electricSpeed:20}}},
 {name:'gold-shield',patch:{gold:{projectileDamageReduction:715},cyan:{spreadLineRange:10},yellow:{electricSpeed:28}}},
];
const results=[];
for(const variant of variants){
 if(extended&&variant.name!=='unchanged')continue;
 const config=structuredClone(base),matrix=structuredClone(baseline.matrix),changed=Object.keys(variant.patch);
 for(const [id,stats]of Object.entries(variant.patch))Object.assign(config[id],stats);
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const a=ids[i],b=ids[j];if(!changed.includes(a)&&!changed.includes(b))continue;
  let wins=0,losses=0,draws=0,games=0;
  for(const distance of [10,13,16])for(const aimError of [.035,.1])for(let seed=0;seed<3;seed++)for(const reverse of [false,true]){
   const duel=beta6Duel(config,reverse?b:a,reverse?a:b,{distance,aimError,bounds:40,level:6},20260919+[10,13,16].indexOf(distance)*20000+[.035,.1].indexOf(aimError)*10000+seed,reverse?-1:1);
   const outcome=duel.outcome*(reverse?-1:1);wins+=outcome>0?1:0;losses+=outcome<0?1:0;draws+=outcome===0?1:0;games++;
  }
  const score=(wins+draws/2)/games;matrix[a][b]={wins,losses,draws,games,score};matrix[b][a]={wins:losses,losses:wins,draws,games,score:1-score};
 }
 const result={...variant,...bestRoute(matrix),matrix};results.push(result);
 console.log(JSON.stringify({name:result.name,minimum:result.threshold,route:result.path,weak:result.weak}));
}
writeFileSync(new URL(extended?'../specs/beta7-cycle-extended-options.json':'../specs/beta7-cycle-options.json',import.meta.url),JSON.stringify({level:6,initialCharge:0,repetitions:extended?30:3,preserved:['azure>lavender','lavender>crimson'],results},null,2)+'\n');
