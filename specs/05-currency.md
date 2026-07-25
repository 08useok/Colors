# 5. 재화

## 재화 종류

| 재화 | 저장 위치 | 용도 |
|---|---|---|
| 코인 | 기본 계정의 `account.coins` | 꾸미기와 일반 상점 |
| 크레딧 | 캐릭터 구매 시스템 | 등급 캐릭터 구매 |
| β 크레딧 | `colorsBetaSeasonTest.credits` | 베타 시즌 테스트 구매 |
| 트로피 | 기본 계정의 `account.trophies` | 랭킹과 계정 성장 |

## 승리 보상

- 승리할 때마다 100 β 크레딧을 자동 지급한다.
- 쇼다운, Chop Wood, 테이크다운에 적용한다.
- 패배에는 지급하지 않는다.
- 베타 일일 보상 화면에 오늘 지급 횟수와 총액을 표시한다.

## 저장 원칙

- 기본 계정 재화 변경 후 `saveAccount(account)`을 호출한다.
- 베타 재화 변경 후 `colorsBetaSeasonTest`를 갱신한다.
- 브라우저 로컬 저장이므로 다른 기기와 자동 동기화되지 않는다.

## 상세 문서

- [`daily-gacha.md`](daily-gacha.md) — 현재는 일일 가샤가 아닌 승리 보상 문서
- [`character-rarity-shop.md`](character-rarity-shop.md)
- [`cosmetics-shop.md`](cosmetics-shop.md)
- [`trophy-ranking.md`](trophy-ranking.md)

