# Orange 밸런스 버프 — 베타 시즌 1

## Current Behavior
2026-07-02 실전 데이터 기준 Orange 승률 27%(7승/26판)로 전체 캐릭터 중 최하위.

`src/main.js` 현재 값 (`CHARACTERS.orange`):
```js
orange: {
  maxHealth: 5800,
  bombDamage: 750,
  bombSplashDamage: 300,
  bombRange: 9,
  bombSpeed: 22,
  bombSplashCount: 5,
  bombSplashSpeed: 10,
  bombSplashRange: 4.4,
  bombSplashHitRadius: 0.60,
}
```

## Expected Behavior
직격/스플래시 피해량과 투사체 속도를 상향해 명중 시 보상을 높이고, 원거리 딜러로서의 위협도를 개선한다.

제안 값 (실전 반영 후 추가 조정 가능):
```js
orange: {
  maxHealth: 5800,           // 변경 없음
  bombDamage: 900,           // 750 → 900 (직격 피해 +20%)
  bombSplashDamage: 380,     // 300 → 380 (스플래시 개별 피해 +27%)
  bombRange: 9,               // 변경 없음
  bombSpeed: 26,              // 22 → 26 (투사체 속도 +18%, 회피 난이도 상승)
  bombSplashCount: 5,          // 변경 없음
  bombSplashSpeed: 10,         // 변경 없음
  bombSplashRange: 4.4,        // 변경 없음
  bombSplashHitRadius: 0.75,   // 0.60 → 0.75 (스플래시 판정 반경 확대 — 명중률 개선)
}
```

- 직격 시 총 피해량: 900(직격) + 380×5(스플래시) = 2,800 (기존 750+300×5=2,250 대비 +24%)
- `bombSpeed` 상승은 원거리 교전에서 회피 여유시간을 줄여 명중률 자체를 높이는 효과
- `bombSplashHitRadius` 확대는 판정 관대화로 체감 명중률 개선

## Non-goals
- Orange 외 캐릭터(Purple/Pink 등) 밸런스 조정 — 실전 데이터 확보 후 별도 스펙에서 진행
- HP/사거리/재장전 등 위 표에 없는 스탯 변경
- 상성표(`specs/character-stats.md`) 수치 갱신 (별도 작업)

## Regression Guard
- `beginBombAttack`, `spawnBombSplash` 등 기존 폭탄 로직 흐름 변경 없음 — 스탯 값만 조정
- Orange 봇 AI(`isRanged`, `idealDist` 등) 동작 방식 변경 없음
- 다른 캐릭터의 `CHARACTERS` 항목에 영향 없음

## Acceptance Criteria
- [ ] `CHARACTERS.orange.bombDamage`가 900이다
- [ ] `CHARACTERS.orange.bombSplashDamage`가 380이다
- [ ] `CHARACTERS.orange.bombSpeed`가 26이다
- [ ] `CHARACTERS.orange.bombSplashHitRadius`가 0.75이다
- [ ] 나머지 Orange 스탯(HP, bombRange, bombSplashCount, bombSplashSpeed, bombSplashRange)은 기존 값 그대로 유지된다
- [ ] 훈련장에서 Orange로 직격 시 표시 피해량이 900으로 적용된다
- [ ] 봇 Orange의 폭탄 투사체 속도가 체감상 더 빨라진다 (기존 대비 회피 난이도 상승)
