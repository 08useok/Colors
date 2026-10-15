# 시즌 8 베타 궁극기 조정

일반 공격 적중의 궁 충전량을 50%로 낮추고 피해형 궁극기 피해를 25% 증가했다. 메인·이전 시즌에는 적용하지 않는다. 완충 요구량과 궁극기 재충전·레드 피격 충전은 유지한다.

| 캐릭터 | 궁극기 피해 변경 |
|---|---|
| lavender | damagePerSecond: 780 → 975 |
| red | 피해 없음/즉사 유지 |
| green | 피해 없음/즉사 유지 |
| blue | damage: 1600 → 2000 |
| orange | damage: 1400 → 1750 |
| yellow | connectionDamage: 1200 → 1500 |
| cyan | damage: 3120 → 3900 |
| purple | damage: 5000 → 6250 |
| pink | 피해 없음/즉사 유지 |
| crimson | damage: 5400 → 6750 |
| gold | tickDamage: 100 → 125 |
| ivory | 착탄 2400 → 3000 / 장판 2600 → 3250 |
| chartreuse | 활성 중 일반 공격 피해 ×1.25 |
| mint | damagePerSecond: 450 → 563 |
| azure | damage: 4800 → 6000 |
| crystal | 피해 없음/즉사 유지 |

라벤더 일반 공격은 적중당 0.5칸이며 궁극기는 적중당 0.025칸을 유지한다. 6회 장판 피해는 5,850, 재충전은 0.15칸이다. 골드와 라벤더만 이동 장판이 유지되는 동안 재사용을 막는다.

검증: `node tools/test-beta8-ultimate-balance.mjs`에서 16종의 실제 일반 공격·궁극기 루프를 비교한다. 기존 상성표는 이전 수치의 기록이며 이번 변경 후의 승률을 뜻하지 않는다.
