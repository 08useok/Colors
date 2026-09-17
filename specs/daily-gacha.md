# 승리 별 보상

> 2026-09-15 로컬 코드 기준. 기존 파일명은 참조 호환을 위해 유지한다.

## 지급 흐름

1. 승리 결과가 확정되면 `daily.pendingRewards`를 1 늘린다.
2. 보상 화면에서 대기 중인 별을 열고 등급 판정을 진행한다.
3. 확정된 등급에 따라 코인 또는 크레딧 중 하나를 지급한다.
4. `pendingRewards`를 1 줄이고, 수령 횟수 `daily.winRewards`를 1 늘린 뒤 저장한다.

승리 순간 고정 100 크레딧을 지급하는 방식이 아니다. `winRewards`는 현재 코드에서 수령 횟수이며 날짜별 집계 필드로 해석하지 않는다.

## 승리 판정

- 메인은 `recordGameResult`의 승리 처리에서 `grantBetaDailyWinReward(account)`를 호출한다.
- 베타 테스트는 `endGoldRush`에서 처리한다. 쇼다운은 상위 4위, 축구와 골드 러쉬는 해당 모드의 승리 판정을 사용한다.
- 패배 시 승리 별을 추가하지 않는다.
- 등급별 지급량과 승급 확률은 각 실행 파일의 `DAILY_REWARD_TIERS` 및 보상 처리 코드가 기준이다.

## 저장

| 환경 | 저장 대상 | 저장 함수 |
|---|---|---|
| 메인 | 현재 계정의 `coins`, `credits`, `daily` | `saveAccount(account)` |
| 베타 테스트 | 선택한 시즌의 `betaState` | `saveBetaState()` |

베타 저장 키는 [접속·로그인](01-access-login.md#저장-키)에서 확인한다. 메인 계정과 테스트 시즌의 보상을 서로 합산하지 않는다.

## 기준 코드

- [메인](../src/main.js): `grantBetaDailyWinReward`, `finishDailyReward`
- [베타 테스트](../src/beta-season.js): `endGoldRush`, `finishDailyReward`

## 검증 기준

- 승리 한 번에 대기 별이 한 번만 증가한다.
- 대기 별이 없으면 수령을 시작하지 않는다.
- 보상 확정 시 한 종류의 재화만 증가하고 대기 별이 한 개 차감된다.
- 새로고침 후 재화와 대기·수령 횟수가 유지된다.
- 메인과 각 베타 테스트 시즌의 보상이 분리된다.
