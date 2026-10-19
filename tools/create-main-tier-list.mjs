import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {CHARACTERS} from '../src/config/characters.js';
import {BETA_CHARACTERS} from '../src/config/beta-characters.js';
import {applyBeta7Balance} from '../src/config/beta7-balance.js';
import {applyBeta6Balance} from '../src/config/beta6-balance.js';
import {createBeta6Combat} from '../src/combat/beta6-combat.js';
import {atCharacterLevel} from './simulate-beta6-balance.mjs';
import {characterDisplayName as name} from '../src/LANGS/character-names.js';
const source=readFileSync('src/main.js','utf8').replace(/\r\n/g,'\n'),start=source.indexOf('if (["beta6", "beta7"].includes(CURRENT_SEASON)) {');
const ctx=vm.createContext({CURRENT_SEASON:'beta7',CHARACTERS:structuredClone(CHARACTERS),BETA_CHARACTERS,applyBeta7Balance,applyBeta6Balance});
vm.runInContext(source.slice(start,source.indexOf('\nconst ALPHA_SEASONS',start)),ctx);
const definitions=JSON.parse(JSON.stringify(ctx.CHARACTERS)),config=atCharacterLevel(definitions,6),ids=Object.keys(config);
const audit=JSON.parse(readFileSync('specs/crystal-counter-option-audit.json','utf8')),goals=new Map(audit.goals);
const matrix=Object.fromEntries(ids.map(id=>[id,{}]));let pairCount=0,totalTimeouts=0;
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
 const a=ids[i],b=ids[j];let wins=0,losses=0,draws=0,timeouts=0;
 for(let s=0;s<6;s++)for(let n=0;n<50;n++)for(const order of [1,-1]){
  const world=createBeta6Combat(config,{seed:20260919+s*10000+n,aimError:[.035,.1][s%2],bounds:40,suddenDeath:{start:30,end:45,startRadius:40,endRadius:8,damagePerSecond:.25}});
  const distance=[10,13,16][Math.floor(s/2)],left=world.add(order===1?a:b,{x:-order*distance/2}),right=world.add(order===1?b:a,{x:order*distance/2});
  for(let frame=0;frame<2700&&left.hp>0&&right.hp>0;frame++)world.update(1/60);
  assert([left.hp,right.hp,left.x,left.z,right.x,right.z].every(Number.isFinite));
  const remaining=left.hp/left.d.maxHealth-right.hp/right.d.maxHealth;
  const outcome=(left.hp<=0&&right.hp<=0?Math.sign(remaining):left.hp<=0?-1:right.hp<=0?1:Math.sign(remaining))*order;
  wins+=outcome>0;losses+=outcome<0;draws+=outcome===0;timeouts+=left.hp>0&&right.hp>0;
 }
 const games=600;assert.equal(wins+losses+draws,games);
 matrix[a][b]={wins,losses,draws,games,timeouts,score:(wins+draws/2)/games};matrix[b][a]={wins:losses,losses:wins,draws,games,timeouts,score:(losses+draws/2)/games};
 totalTimeouts+=timeouts;pairCount++;if(pairCount%15===0)console.log('Completed pairs:',pairCount,'/ 105');
}
const tier=average=>average>=70?'S':average>=60?'A':average>=45?'B':average>=30?'C':'D';
const rows=ids.map(id=>{const opponents=Object.entries(matrix[id]),perfect=opponents.filter(([,r])=>r.wins===r.games).map(([id])=>id),zero=opponents.filter(([,r])=>r.losses===r.games).map(([id])=>id),extra=perfect.filter(target=>target!==goals.get(id)),average=100*opponents.reduce((s,[,r])=>s+r.score,0)/(ids.length-1);return{id,average,tier:tier(average),perfect,extra,zero,flag:extra.length>=5?'priority':extra.length>=3?'many':'normal',target:goals.get(id),targetRate:100*matrix[id][goals.get(id)].score};}).sort((a,b)=>b.average-a.average);
const hashes=Object.fromEntries(['src/main.js','src/combat/beta6-combat.js','src/config/beta-characters.js','src/config/beta6-balance.js','src/config/beta7-balance.js'].map(p=>[p,createHash('sha256').update(readFileSync(p,'utf8').replace(/\r\n/g,'\n')).digest('hex')]));
const report={date:'2026-10-19',scope:'Main season 7, 15 characters, level 6, bot 1v1, ultimates enabled from zero charge',games:pairCount*600,gamesPerPair:600,distances:[10,13,16],aimErrors:[.035,.1],seed:20260919,bothOrders:true,drawScore:.5,totalTimeouts,timeoutRule:'After 45s compare remaining health ratios; 30s zone starts shrinking',criteria:{manyExtraPerfectOpponents:3,priorityExtraPerfectOpponents:5,tiers:{S:70,A:60,B:45,C:30,D:'below 30'},designRule:'Only designated 100% wins are required; extra perfect wins are a balance indicator, not a failed design constraint'},hashes,goals:[...goals],rows,matrix};
writeFileSync('specs/main-tier-list.json',JSON.stringify(report,null,2)+'\n');
const pct=v=>v.toFixed(1)+'%',cell=(a,b)=>{if(a===b)return '×';const r=matrix[a][b],text=pct(r.score*100);if(r.wins===r.games)return goals.get(a)===b?'**'+text+'**':'*'+text+'*';if(r.losses===r.games)return goals.get(b)===a?'**'+text+'**':'*'+text+'*';return text;};
const lines=['# 메인 1대1 봇 티어와 100% 과다 기준','',report.date,'',
 '## 기준','',
 '- **지정 상대 외 100% 승리 상대가 3명 이상이면 과다**, **5명 이상이면 우선 조정 검토**로 분류합니다. 메인 상대 14명 중 약 21% / 36%에 해당합니다. 이번 프로젝트의 분석 기준이며 보편적인 게임 등급 기준은 아닙니다.',
 '- 지정 꼬리잡기 상대 1명은 과다 집계에서 제외합니다. 다른 상대에게 100%인 것 자체를 목표 실패로 보지는 않습니다.',
 '- 티어는 평균 승률로 분류합니다: S ≥70%, A ≥60%, B ≥45%, C ≥30%, D <30%. 100% 상대 수와 티어를 따로 표시해 일방적인 일부 대진과 전체 강함을 구분합니다.',
 '- 평균 승률은 모든 상대를 같은 비중으로 평균한 승리+무승부 0.5점 비율입니다. 실력·픽률·팀 조합을 반영한 실제 유저 승률이 아닙니다.','',
 '## 최신 검증','',
 `메인 15종·6레벨·궁극기 충전 0 시작으로 105개 대진을 각 600회, 총 ${report.games.toLocaleString('en-US')}회 새로 실행했습니다. 거리 10/13/16타일, 조준 오차 0.035/0.1라디안, 시드 50개와 양쪽 순서를 교환했습니다.`,
 `전장은 반경 40타일이고 30초부터 자기장이 줄어듭니다. 45초까지 둘 다 생존한 ${totalTimeouts}경기는 남은 체력 비율로 판정했습니다. 이는 처치 승리와 구분해 원본의 timeouts에 기록했습니다.`,
 '이 티어는 해당 조건의 봇 1대1 기준이며 모드·맵·수동 조작 전체를 대표하지 않습니다. 브라우저 게임 수치와 베타는 이번 작업에서 변경하지 않았습니다.','',
 '## 티어리스트','',
 '| 티어 | 캐릭터 | 평균 승률 | 100% 상대 | 지정 외 100% | 0% 상대 | 분류 |','|---|---|---:|---:|---:|---:|---|',
 ...rows.map(r=>`| ${r.tier} | ${name(r.id)} | ${pct(r.average)} | ${r.perfect.length} | ${r.extra.length} | ${r.zero.length} | ${{priority:'우선 검토',many:'과다',normal:'기준 미만'}[r.flag]} |`),'',
 '## 패치 대상으로 볼 캐릭터','',
 `- 과다 대진 우선 확인: ${rows.filter(r=>r.flag==='priority').sort((a,b)=>b.extra.length-a.extra.length).map(r=>name(r.id)+'(지정 외 '+r.extra.length+'명)').join(', ')}.`,
 `- 평균 승률 30% 미만의 버프 검토: ${rows.filter(r=>r.average<30).map(r=>name(r.id)+' '+pct(r.average)).join(', ')}.`,
 '- 크리스탈은 추적·다단 중첩·적중당 궁 충전의 결합을 먼저 조정 후보로 봅니다. 지정 상대 크림슨 100%를 유지하는지와 다른 상대의 승률이 함께 내려가는지를 비교해야 합니다.',
 '- 평균 승률이 중간이면서 100%가 많은 캐릭터는 전체 수치 일괄 너프보다 일방적 대진의 원인을 먼저 검사합니다. 아직 후보 수치나 실제 패치는 적용하지 않았습니다.','',
 '## 100% 상대 목록','',
 '| 캐릭터 | 지정 상대 | 100% 승리 상대 |','|---|---|---|',
 ...rows.map(r=>`| ${name(r.id)} | ${name(r.target)} (${pct(r.targetRate)}) | ${r.perfect.map(id=>name(id)).join(', ')||'없음'} |`),'',
 '## 전체 상성표','',
 '행 캐릭터의 승률입니다. 지정한 연결의 100%/0%는 **굵게**, 다른 상대의 100%/0%는 *이탤릭체*입니다. 이탤릭체는 관찰 표시이며 목표 실패를 뜻하지 않습니다.','',
 '| 카운터 / 카운팅 | '+ids.map(id=>name(id)).join(' | ')+' |','|---|'+ids.map(()=>'---:|').join(''),
 ...ids.map(a=>'| '+name(a)+' | '+ids.map(b=>cell(a,b)).join(' | ')+' |'),'','[전체 원본과 코드 지문](main-tier-list.json)',''];
writeFileSync('specs/main-tier-list.md',lines.join('\n'));console.table(rows.map(r=>({id:r.id,tier:r.tier,average:r.average.toFixed(1),perfect:r.perfect.length,extra:r.extra.length,zero:r.zero.length,flag:r.flag})));
