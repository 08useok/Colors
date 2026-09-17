# 5. 재화

## 재화와 기록

| 항목 | 메인 | 베타 테스트 |
|---|---|---|
| 코인 | `account.coins` | `betaState.coins` |
| 크레딧 | `account.credits` | `betaState.credits` |
| 트로피 | 계정·캐릭터 전적 | 시즌별 캐릭터 전적 |

β 크레딧은 베타 UI에서 사용하는 표시명이다. 저장소는 실행 환경별로 분리한다.

## 승리 보상

승리 시 대기 별을 추가하고, 별의 등급 판정 후 코인 또는 크레딧을 수령한다. 지급 흐름과 검증 기준은 [승리 별 보상](daily-gacha.md)에서 관리한다.

## 저장 원칙

- 메인 계정 변경 후 `saveAccount(account)`를 호출한다.
- 베타 테스트 변경 후 `saveBetaState()`로 현재 `BETA_STORAGE_KEY`에 저장한다.
- 저장 키 목록은 [접속·로그인](01-access-login.md#저장-키)을 참조한다.
- 브라우저 로컬 저장 데이터는 다른 기기와 자동 동기화되지 않는다.

## 상세 문서

- [승리 별 보상](daily-gacha.md)
- [캐릭터 등급·구매](character-rarity-shop.md)
- [꾸미기 상점](cosmetics-shop.md)
- [트로피](trophy-ranking.md)
