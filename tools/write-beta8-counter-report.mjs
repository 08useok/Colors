import {readFileSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const root=new URL('../',import.meta.url);
const names={red:'레드',blue:'블루',orange:'오렌지',mint:'민트',cyan:'시안',pink:'핑크',purple:'퍼플',chartreuse:'샤르트뢰즈',yellow:'옐로',ivory:'아이보리',salmon:'살몬',gold:'골드',green:'그린',azure:'애저',lavender:'라벤더',crimson:'크림슨',crystal:'크리스탈'};
export function writeCounterReport(r){
 const advantaged=r.audit.filter(row=>row.targetWinResult.score>.5).length;
 const perPair=r.games/r.pairs;
 const distanceTable=Object.entries(r.matrix.blue.orange.byDistance??{}).map(([d,v])=>`| ${d} | ${v.wins}/${v.losses}/${v.draws} |`).join('\n');
 const table=r.audit.map(row=>{const v=row.targetWinResult;return`| ${names[row.id]} → ${names[row.targetWin]} | ${v.wins}/${v.losses}/${v.draws} | ${(v.score*100).toFixed(1)}% | ${row.edgePerfect?'전승':v.score>.5?'우세':v.score<.5?'열세':'동률'} |`;}).join('\n');
 const text=`# Beta8 counter verification - 0.8.65 - ${new Date().toISOString().slice(0,10)}

**${r.perfectEdges}/${r.cycle.length} specified target edges are undefeated in the standard sampled conditions. Cycle complete: ${r.cyclePerfect}. Unique one-win/one-loss counter relation: ${r.uniqueCounterPerfect}.**

Latest modules include Red speed1.15 and control-path planning, Chartreuse release tracking/control-path planning, Mint parallel-volley path planning, Cyan1.5charge/5tile tank response and Crystal intercept aiming. Earlier Salmon/Yellow/Gold/Azure/Purple/Blue/Orange fixes remain included. No opponent-ID damage bonuses or forced outcomes. See [remaining-edge changes](beta8-remaining-edges.md). This measures specified target edges; it does not guarantee all maps/seeds or a unique counter for every character.

## 조건

- ${r.cycle.length}명 전체 ${r.pairs}쌍 × ${perPair}회 = ${r.games.toLocaleString('en-US')}경기.
- 확대 시뮬레이션 ${r.profile?.mapSide??100}×${r.profile?.mapSide??100}타일, 이동 경계±${r.profile?.bounds??49}. 실제 쇼다운은100×100타일로 유지. 장애물과 다인전 스폰은 재현하지 않는 열린 공간이다.
- 레벨6, 거리${r.distances.join('/')}, 조준오차 .035/.1, 조건당10시드, 생성 순서 반전, 궁 충전0.
- 최대45초, 30초부터 구역 축소. 시간 초과는 남은 체력 비율, 무승부는 .5점.
- 골드 체력7380(기존8200), 나머지 캐릭터 기존 체력 유지. 살몬 피해3000+착지600, 공중1.2초/높이4.5, 궁 착지 후 대기0초 포함.
- 관련 소스의 해시를 전후 비교하고 기록했다.
- ${r.targetReaudit?'이번 변경은 목표 연결만 수정했다. 전투 소스 해시가 모두 동일해32,640경기 행렬을 재사용하고 새 목표408사례를 다시 실행했다.':'이 보고서의 전체 행렬은 현재 전투 모듈을 실행해 생성했다.'}

## 결과

| 목표 연결 | 승/패/무 | 점수율 | 판정 |
|---|---|---:|---|
${table}

우세는 점수율50% 초과, 전승은${perPair}승/0패/0무를 뜻한다. 살몬→골드의 이번 결과는 위 표의 실제 승패를 따른다.

## 블루→오렌지 시작 거리별 결과

| 거리 | 승/패/무 |
|---|---|
${distanceTable}

예전80×80·거리6/10/14 결과와 새로운 거리 구성의 종합 승률을 직접 개선치로 비교하지 않는다. 구역은 이전 합성 조건을 유지하며 실제 쇼다운 전체 환경을 재현한 것은 아니다.

## 한계와 브라우저 확인

- 실제 이용자·모든 맵·팀전의 승률을 보장하지 않는다.
- 각자 정확히 한 명에게만 전승/전패하는 엄격한 조건은 미달이다. 전체 상대별 행렬을 JSON으로 보관했다.
- 앞선 기능 검증 기록: [시안 동작](cyan-defense-browser.json), [블루 보호막·충전](beta8-blue-shield-browser.json). 이번 전체 상성 재검증과는 별도 실행이다.
- Ego에서17개 목표 연결의 첫 시드·${r.distances.length*2}조건·양쪽 순서${r.browserCases.length}경기를 브라우저 안 별도 전투 월드로 교차 검증한다. 최신 일치 여부와 잔여 체력 차이는 [교차 검증 JSON](beta8-counter-cycle-browser.json)에 별도 기록한다.
- 렌더링 전체나 직접 수동 경기 완주 검증과는 구분한다.

재실행: node tools/verify-beta8-counter-cycle.mjs. 전체 행렬/해시: [JSON](beta8-counter-cycle-verification.json).
`;
 writeFileSync(new URL('specs/beta8-counter-cycle-verification.md',root),text);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)writeCounterReport(JSON.parse(readFileSync(new URL('specs/beta8-counter-cycle-verification.json',root),'utf8')));
