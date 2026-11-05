# Beta8 counter verification - 0.8.65 - 2026-11-05

**18/18 specified target edges are undefeated in the standard sampled conditions. Cycle complete: true. Unique one-win/one-loss counter relation: false.**

Latest modules include Red speed1.15 and control-path planning, Chartreuse release tracking/control-path planning, Mint parallel-volley path planning, Cyan1.5charge/5tile tank response and Crystal intercept aiming. Earlier Salmon/Yellow/Gold/Azure/Purple/Blue/Orange fixes remain included. No opponent-ID damage bonuses or forced outcomes. See [remaining-edge changes](beta8-remaining-edges.md). This measures specified target edges; it does not guarantee all maps/seeds or a unique counter for every character.

## 조건

- 18명 전체 153쌍 × 240회 = 36,720경기.
- 확대 시뮬레이션 120×120타일, 이동 경계±59. 실제 쇼다운은100×100타일로 유지. 장애물과 다인전 스폰은 재현하지 않는 열린 공간이다.
- 레벨6, 거리6/10/14/20/28/36, 조준오차 .035/.1, 조건당10시드, 생성 순서 반전, 궁 충전0.
- 최대45초, 30초부터 구역 축소. 시간 초과는 남은 체력 비율, 무승부는 .5점.
- 골드 체력7380(기존8200), 나머지 캐릭터 기존 체력 유지. 살몬 피해3000+착지600, 공중1.2초/높이4.5, 궁 착지 후 대기0초 포함.
- 관련 소스의 해시를 전후 비교하고 기록했다.
- 이 보고서의 전체 행렬은 현재 전투 모듈을 실행해 생성했다.

## 결과

| 목표 연결 | 승/패/무 | 점수율 | 판정 |
|---|---|---:|---|
| 레드 → 샤르트뢰즈 | 240/0/0 | 100.0% | 전승 |
| 샤르트뢰즈 → undefined | 240/0/0 | 100.0% | 전승 |
| undefined → 옐로 | 240/0/0 | 100.0% | 전승 |
| 옐로 → 아이보리 | 240/0/0 | 100.0% | 전승 |
| 아이보리 → 살몬 | 240/0/0 | 100.0% | 전승 |
| 살몬 → 골드 | 240/0/0 | 100.0% | 전승 |
| 골드 → 그린 | 240/0/0 | 100.0% | 전승 |
| 그린 → 애저 | 240/0/0 | 100.0% | 전승 |
| 애저 → 라벤더 | 240/0/0 | 100.0% | 전승 |
| 라벤더 → 크림슨 | 240/0/0 | 100.0% | 전승 |
| 크림슨 → 블루 | 240/0/0 | 100.0% | 전승 |
| 블루 → 오렌지 | 240/0/0 | 100.0% | 전승 |
| 오렌지 → 민트 | 240/0/0 | 100.0% | 전승 |
| 민트 → 시안 | 240/0/0 | 100.0% | 전승 |
| 시안 → 핑크 | 240/0/0 | 100.0% | 전승 |
| 핑크 → 퍼플 | 240/0/0 | 100.0% | 전승 |
| 퍼플 → 크리스탈 | 240/0/0 | 100.0% | 전승 |
| 크리스탈 → 레드 | 240/0/0 | 100.0% | 전승 |

우세는 점수율50% 초과, 전승은240승/0패/0무를 뜻한다. 살몬→골드의 이번 결과는 위 표의 실제 승패를 따른다.

## 블루→오렌지 시작 거리별 결과

| 거리 | 승/패/무 |
|---|---|
| 6 | 40/0/0 |
| 10 | 40/0/0 |
| 14 | 40/0/0 |
| 20 | 40/0/0 |
| 28 | 40/0/0 |
| 36 | 40/0/0 |

예전80×80·거리6/10/14 결과와 새로운 거리 구성의 종합 승률을 직접 개선치로 비교하지 않는다. 구역은 이전 합성 조건을 유지하며 실제 쇼다운 전체 환경을 재현한 것은 아니다.

## 한계와 브라우저 확인

- 실제 이용자·모든 맵·팀전의 승률을 보장하지 않는다.
- 각자 정확히 한 명에게만 전승/전패하는 엄격한 조건은 미달이다. 전체 상대별 행렬을 JSON으로 보관했다.
- 앞선 기능 검증 기록: [시안 동작](cyan-defense-browser.json), [블루 보호막·충전](beta8-blue-shield-browser.json). 이번 전체 상성 재검증과는 별도 실행이다.
- Ego에서17개 목표 연결의 첫 시드·12조건·양쪽 순서432경기를 브라우저 안 별도 전투 월드로 교차 검증한다. 최신 일치 여부와 잔여 체력 차이는 [교차 검증 JSON](beta8-counter-cycle-browser.json)에 별도 기록한다.
- 렌더링 전체나 직접 수동 경기 완주 검증과는 구분한다.

재실행: node tools/verify-beta8-counter-cycle.mjs. 전체 행렬/해시: [JSON](beta8-counter-cycle-verification.json).
