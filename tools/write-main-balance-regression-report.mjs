import {readFileSync,writeFileSync} from 'node:fs';
import {characterDisplayName as name} from '../src/LANGS/character-names.js';
const r=JSON.parse(readFileSync('specs/main-balance-regression.json','utf8'));
const ids=r.averages.map(x=>x.id),rate=v=>v.toFixed(1)+'%';
const newlyBroken=r.targets.filter(t=>t.before===100&&t.after<100),alreadyBroken=r.targets.filter(t=>t.before<100);
function matchup(a,b){const direct=r.results.after[a+':'+b];return direct?.winRate??100-r.results.after[b+':'+a].winRate;}
const cycle=r.targets.map(t=>t.id);
function cell(a,b){if(a===b)return '×';const value=matchup(a,b),win=r.targets.find(t=>t.id===a).target,loss=cycle[(cycle.indexOf(a)+cycle.length-1)%cycle.length];const text=rate(value);return value===100||value===0?((value===100&&b===win)||(value===0&&b===loss)?'**'+text+'**':'*'+text+'*'):text;}
const lines=['# 메인 애저·크림슨 변경 회귀 비교','',r.date,'',
 '## 검사 조건','',
 '- 메인 15종·6레벨·궁극기 포함(충전 0으로 시작). 각 대진 600회: 거리 10/13/16타일, 조준 오차 2종, 시드 50개, 양쪽 순서 교환.',
 '- 변경 전은 `91fc77c`의 메인 정의, 애저만 변경한 정의, 현재 메인 정의를 같은 전투 엔진과 시드로 비교했습니다. 다른 캐릭터끼리의 동일한 대진은 재사용했습니다.',
 '- 전장은 반경 40타일, 30초부터 자기장이 줄어듭니다. 45초까지 둘 다 생존하면 남은 체력 비율로 판정하며, 이 경우는 아래 원본 데이터의 `timeouts`로 별도 기록합니다.',
 '- 메인에는 라벤더가 없어 기존 설계 순환에서 라벤더를 빼고 애저→크림슨을 임시 비교했습니다. 확정된 신규 상성 목표나 실제 게임 규칙 변경은 아닙니다.',
 '- 수치 비교 시뮬레이션이며 실제 브라우저·온라인 대전 검증은 포함하지 않습니다. 게임 수치는 추가 변경하지 않았습니다.','',
 '## 목표 대진 변화','',
 '| 공격자 | 100% 목표 상대 | 변경 전 | 애저만 버프 | 현재 |','|---|---|---:|---:|---:|',
 ...r.targets.map(t=>`| ${name(t.id)} | ${name(t.target)} | ${rate(t.before)} | ${rate(t.azureOnly)} | ${rate(t.after)} |`),'',
 `기존 100%에서 새로 깨진 목표: ${newlyBroken.map(t=>name(t.id)+'→'+name(t.target)).join(', ')||'없음'}. 변경 전부터 미달이던 목표는 ${alreadyBroken.length}개입니다.`, '',
 '## 애저·크림슨 상대별 승률','',
 '| 캐릭터 | 상대 | 변경 전 | 애저만 버프 | 현재 |','|---|---|---:|---:|---:|',
 ...r.affected.map(t=>`| ${name(t.id)} | ${name(t.target)} | ${rate(t.before)} | ${rate(t.azureOnly)} | ${rate(t.after)} |`),'',
 '## 평균 승률','',
 '| 캐릭터 | 변경 전 | 애저만 버프 | 현재 |','|---|---:|---:|---:|',
 ...r.averages.map(t=>`| ${name(t.id)} | ${rate(t.before)} | ${rate(t.azureOnly)} | ${rate(t.after)} |`),'',
 '## 현재 전체 상성표','',
 '행 캐릭터의 승률입니다. 설계 상대에 대한 100%·0%는 **굵게**, 다른 상대의 100%·0%는 *이탤릭체*입니다.','',
 '| 카운터 ↓ / 상대 → | '+ids.map(id=>name(id)).join(' | ')+' |','|---|'+ids.map(()=>'---:|').join(''),
 ...ids.map(a=>'| '+name(a)+' | '+ids.map(b=>cell(a,b)).join(' | ')+' |'),'','## 기술 검사','',
 '- 모든 비교 전투에서 체력과 좌표가 유한한지 확인했습니다. 애저의 고속 이동은 벽 위치 5종에서 관통하지 않았습니다.',
 '- 애저 이동 거리·시간 검사, 크림슨 회피 재반응·속도 검사와 기존 맵 회귀 검사가 통과했습니다.','',
 '[원본 결과](main-balance-regression.json)',''];
writeFileSync('specs/main-balance-regression.md',lines.join('\n'));
console.log('Newly broken:',newlyBroken);console.log('Previously unmet:',alreadyBroken.length);
