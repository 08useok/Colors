import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {characterDisplayName as name} from '../src/LANGS/character-names.js';
const data=JSON.parse(readFileSync('specs/main-balance-regression.json','utf8'));
const ids=data.averages.map(r=>r.id),n=ids.length,start=ids.indexOf('red'),full=(1<<n)-1;
const rate=(a,b)=>data.results.after[a+':'+b]?.winRate??100-data.results.after[b+':'+a].winRate;
const edges=ids.map((a,i)=>ids.map((b,j)=>i===j?0:rate(a,b)));
const old=new Set(data.targets.map(t=>t.id+'>'+t.target));
const allowed=(i,j)=>!(ids[i]==='crimson'&&ids[j]==='crystal')
 && (ids[i]!=='crystal'||ids[j]==='crimson') && (ids[j]!=='crimson'||ids[i]==='crystal');
// First find the greatest possible minimum edge in a single all-character cycle.
const bottleneck=new Float64Array((full+1)*n).fill(-1);bottleneck[(1<<start)*n+start]=100;
for(let mask=0;mask<=full;mask++)if(mask&(1<<start))for(let last=0;last<n;last++){
 const value=bottleneck[mask*n+last];if(value<0)continue;
 for(let next=0;next<n;next++)if(!(mask&(1<<next))&&allowed(last,next)){const key=(mask|(1<<next))*n+next;bottleneck[key]=Math.max(bottleneck[key],Math.min(value,edges[last][next]));}
}
let minimum=-1;for(let last=0;last<n;last++)if(last!==start&&allowed(last,start))minimum=Math.max(minimum,Math.min(bottleneck[full*n+last],edges[last][start]));
// Within that threshold, prefer perfect edges, then existing edges, then score.
const score=new Float64Array((full+1)*n).fill(-Infinity),parent=new Int8Array(score.length).fill(-1);
const weight=(i,j)=>(edges[i][j]===100?100000:0)+(old.has(ids[i]+'>'+ids[j])?100:0)+edges[i][j]/100;
score[(1<<start)*n+start]=0;
for(let mask=0;mask<=full;mask++)if(mask&(1<<start))for(let last=0;last<n;last++){
 const value=score[mask*n+last];if(!Number.isFinite(value))continue;
 for(let next=0;next<n;next++)if(!(mask&(1<<next))&&allowed(last,next)&&edges[last][next]>=minimum){const key=(mask|(1<<next))*n+next,candidate=value+weight(last,next);if(candidate>score[key]){score[key]=candidate;parent[key]=last;}}
}
let last=-1,best=-Infinity;for(let i=0;i<n;i++)if(i!==start&&allowed(i,start)&&edges[i][start]>=minimum&&score[full*n+i]+weight(i,start)>best){last=i;best=score[full*n+i]+weight(i,start);}
const path=[];let mask=full;while(last>=0){path.push(last);const previous=parent[mask*n+last];mask^=1<<last;last=previous;}path.reverse();
const cycle=path.map(i=>ids[i]);assert.equal(cycle.length,n);assert.equal(new Set(cycle).size,n);
const targets=cycle.map((id,i)=>({id,targetWin:cycle[(i+1)%n],targetLoss:cycle[(i+n-1)%n],winRate:rate(id,cycle[(i+1)%n]),lossRate:rate(id,cycle[(i+n-1)%n])}));
const report={scope:'Main 15 characters only; design targets, no stat or combat changes',source:'main-balance-regression.json',confirmedSegment:['crystal','crimson','purple'],retiredEdge:['crimson','crystal'],fullCycleAdopted:false,constraints:['Crystal -> Crimson is required','Crimson -> Crystal is forbidden'],objective:'Maximize minimum win rate, then number of 100% edges, then preserved edges, then total score',gamesPerPair:data.gamesPerPair,minimum,cycle,targets};
writeFileSync('specs/main-counter-cycle-results.json',JSON.stringify(report,null,2)+'\n');
const lines=['# 메인 꼬리잡기 설계 변경','',
 '## 변경한 연결','',
 '**크리스탈 → 크림슨 → 퍼플**로 지정 상성의 설계 방향을 바꿉니다. 기존 **크림슨 → 크리스탈** 승리 목표는 폐기합니다. 메인 15종 기준이며 베타 시즌의 16종 순환과 전투 수치는 바꾸지 않습니다.','',
 '| 공격자 | 새 목표 상대 | 현재 승률 | 목표 충족 |','|---|---|---:|---|',
 `| 크리스탈 | 크림슨 | ${rate('crystal','crimson').toFixed(1)}% | 100% 미달 |`,
 `| 크림슨 | 퍼플 | ${rate('crimson','purple').toFixed(1)}% | **100%** |`,'',
 '크리스탈의 수정 분석은 적중 즉시 처치하지 않습니다. 분석 중 두 캐릭터의 이동·공격을 막고, 대상이 생존하면 8초 뒤 처형합니다. 크림슨의 지속 공격은 분석 중 중단되므로 크림슨에게 크리스탈 100% 승리를 요구하던 방향을 뒤집었습니다. 다만 스킬 설명만으로 승률을 확정하지 않으며 현재 관측값은 73.8%입니다.','',
 '## 전체 순환은 아직 미확정','',
 `시안의 최고 상대별 승률이 ${Math.max(...ids.filter(id=>id!=='cyan').map(id=>rate('cyan',id))).toFixed(1)}%라서 순서 변경만으로 전원 100% 승리 대상을 지정할 수 없습니다. 새 연결을 포함하는 완전한 순환의 탐색 결과도 가장 약한 연결이 ${minimum.toFixed(1)}%입니다. 아래는 비교 후보이며 확정된 꼬리잡기 순서가 아닙니다.`, '',
 cycle.map(id=>name(id)).join(' → ')+' → '+name(cycle[0]),'',
 '| 캐릭터 | 후보 승리 상대 | 현재 승률 |','|---|---|---:|',
 ...targets.map(t=>`| ${name(t.id)} | ${name(t.targetWin)} | ${t.winRate===100?'**100.0%**':t.winRate.toFixed(1)+'%'} |`),'',
 '현재 승률이 50% 아래인 연결까지 있으므로 이 후보를 완성된 상성표로 적용하지 않습니다. 능력치 조정 또는 일부 캐릭터의 순환 제외 없이는 전체 목표를 달성할 수 없습니다.','',
 '## 검증 근거','',
 '- 메인 15종, 6레벨, 궁극기 포함(충전 0 시작), 대진당 600회 결과를 재사용했습니다. 이번 작업에서 수치나 전투 결과를 바꾸지 않았습니다.',
 '- 한 캐릭터가 한 번씩 들어가는 순환 전체를 동적 계획법으로 탐색했습니다. 크리스탈→크림슨은 필수이고, 크림슨→크리스탈은 금지했습니다.',
 '- 승률은 지정한 시뮬레이션 조건의 관측값이며, 실제 플레이 전체의 보장값이 아닙니다.','',
 '[전체 승률 원본](main-balance-regression.json) · [후보 탐색 결과](main-counter-cycle-results.json)',''];
writeFileSync('specs/main-counter-cycle-revision.md',lines.join('\n'));
console.log(cycle.map(id=>name(id)).join(' → ')+' → '+name(cycle[0]));console.log('Minimum:',minimum);console.table(targets);
