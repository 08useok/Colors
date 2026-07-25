# Purple 캐릭터 (독침 + 독액)

## 개요
독침으로 즉발 피해 + 맹독을 부여하고, 독액으로 광역 즉발 폭발 피해를 주는 장거리 복합 딜러.

---

## 스탯

| 항목 | 값 |
|------|-----|
| 체력 | 6,000 |
| 이동속도 | 1.0 |
| 사거리 | 13 |
| 재장전 | 0.5s |
| 공격 쿨다운 | 0.45s |
| 색상 | `0x800080` |
| 등급 | 희귀 (200크레딧) |

---

## 공격 방식 1 — 독침 (Needle)

쌍독침 2발을 11도 부채꼴로 동시 발사.

| 항목 | 값 |
|---|---|
| 투사체 수 | 2 |
| 부채꼴 각도 | 11° |
| 즉발 피해 (발당) | 700 |
| 사거리 | 13 |
| 속도 | 18 |
| 맹독 DPS | 760 / 초 |
| 맹독 지속 | 4초 |
| 맹독 총 피해 | 3,040 |
| 맹독 중첩 | 없음 (갱신형) |

- 침 1발 명중 시에도 맹독 부여
- 2발 모두 명중해도 맹독 중첩 없이 갱신

---

## 공격 방식 2 — 독액 (Vial)

독액 1발을 발사해 도달 즉시 범위 폭발.

| 항목 | 값 |
|---|---|
| 즉발 피해 | 3,040 |
| 사거리 | 13 |
| 속도 | 18 |
| 스플래시 반경 | 5.0 타일 |

> 독침/독액 두 공격 모드의 전환 방식(탄약 분리 vs 버튼 전환 등)은 구현 시 결정.

---

## CHARACTERS 정의

```js
purple: {
  color: 0x800080,
  maxHealth: 6000,
  attackType: "poison",
  reloadDuration: 0.5,
  attackCooldown: 0.45,
  needleRange: 13,
  needleSpeed: 18,
  needleDamage: 700,
  poisonDPS: 760,
  poisonDuration: 4,
  vialRange: 13,
  vialSpeed: 18,
  vialDamage: 3040,
  vialSplashRadius: 5.0,
  moveSpeedMultiplier: 1.0,
  walk: { cycleSpeed: 7, armAmp: 0.22, legAmp: 0.34, armRestZ: Math.PI * 0.04 },
},
```

---

## Regression Guard
- 기존 캐릭터 밸런스 변경 없음
- 기존 charStats 데이터 보존 (purple 필드만 추가)

## Acceptance Criteria
- [ ] Purple 선택 후 독침 2발이 11도 부채꼴로 동시 발사된다
- [ ] 독침 명중 시 즉발 피해 700 + 맹독 760/s × 4s (총 3040) 적용
- [ ] 맹독은 중첩 없이 갱신된다
- [ ] 독액 명중 시 즉발 3040 피해 + 반경 5.0 스플래시 적용
- [ ] 로비에서 Purple 카드 표시 + 미보유 시 잠금
- [ ] 봇이 Purple로 배정될 수 있다
