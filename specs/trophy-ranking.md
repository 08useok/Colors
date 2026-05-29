# 순위 기반 트로피 분배

## 개요
게임 종료 시 최후 순위에 따라 트로피를 분배한다.
1위에 가까울수록 많이 얻고, 하위권은 트로피를 잃는다.

## 트로피 분배표

| 순위 | 트로피 변화 |
|---|---|
| 1위 | +10 |
| 2위 | +8 |
| 3위 | +6 |
| 4위 | +4 |
| 5위 | +2 |
| 6위 | 0 |
| 7위 | -2 |
| 8위 | -4 |
| 9위 | -6 |
| 10위 | -8 |

공식: `trophyChange = 12 - rank × 2`
최솟값: `trophies = Math.max(0, trophies + trophyChange)`

## 사망 순서 추적

- `state.deathOrder: number[]` — 사망한 플레이어 ID를 순서대로 저장
- `applyDamage()`에서 `target.health <= 0` 시 `state.deathOrder.push(target.id)`
- `resetGame()`에서 `state.deathOrder = []` 초기화

## 순위 계산

```js
function getPlayerRank(player) {
  if (!player.dead) return 1; // 최후 생존 = 1위
  const idx = state.deathOrder.indexOf(player.id);
  return state.players.length - idx; // 10명 기준: 최초 사망 = 10위
}
```

예시 (10명):
- deathOrder[0] (첫 사망) → 10 - 0 = **10위**
- deathOrder[8] (마지막 사망) → 10 - 8 = **2위**
- 생존자 → **1위**

## 결과 화면 표시

| 상황 | 제목 | 본문 |
|---|---|---|
| 1위 | `1위 🏆` | `+10 트로피 (총 N)` |
| 2~5위 | `N위` | `+M 트로피 (총 N)` |
| 6위 | `6위` | `트로피 변화 없음 (총 N)` |
| 7~10위 | `N위` | `-M 트로피 (총 N)` |
| 무승부 | `무승부` | 순위 계산 동일 적용 |

## AI 탐지 반경 확대

- `chooseBotTarget()`: `distanceSq > 30 * 30` → `distanceSq > 50 * 50`
- 탐지 반경 30 → 50 units (약 67% 증가, "반 이상")
- 수풀 가시성 예외(9 units) 유지

## Regression Guard
- 기존 `wins` / `losses` 카운트 유지 (플레이어 1위 = win, 나머지 = loss)
- 트로피 0 미만 방지 로직 유지
- 봇 공격 판정(atkRange * 1.05) 변경 없음 — 탐지 반경만 변경

## Acceptance Criteria
- [ ] 1위 시 +10, 2위 시 +8 … 10위 시 -8 트로피 적용된다
- [ ] 결과 화면에 순위와 트로피 변화량이 표시된다
- [ ] 트로피가 0 미만으로 내려가지 않는다
- [ ] 봇이 50 units 이내 적을 탐지하고 교전한다
- [ ] resetGame() 시 deathOrder가 초기화된다
