# Cyan 캐릭터 (확산 직선 투사체)

## 개요
6발의 투사체를 평행하게 발사하는 중거리 확산 딜러.

---

## 스탯

| 항목 | 값 | 비고 |
|------|-----|------|
| 체력 | 6,200 | |
| 이동속도 | 1.0 (Normal) | |
| 사거리 | 8.33 | |
| 탄약 | 3 | |
| 재장전 | 1.0초 | |
| 공격 쿨다운 | 0.35초 | |
| 데미지 (1발) | 600 | 6발 합산 최대 3,600 |
| 투사체 속도 | 18 | |
| 투사체 수 | 6 | |
| 투사체 간격 | 0.75 units | |
| 색상 | `0x0ff0fe` | |

→ 알파 정확한 값: `src/config/characters.js`의 `CHARACTERS.cyan` 참조
→ 베타 정확한 값: `src/config/beta-characters.js`의 `BETA_CHARACTERS.cyan` 참조

---

## 공격 방식

### 투사체
- `attackType: "spreadLine"`
- 6발을 조준 방향과 수직으로 0.75 units 간격 배치하여 동시 발사
- 각 투사체는 직선으로 이동, 사거리(8.33) 도달 시 소멸
- 첫 번째 충돌 적에게 600 데미지

### 조준선
- 기존 캐릭터와 통일된 스타일

---

## CHARACTERS 정의

```js
cyan: {
  color: 0x0ff0fe,
  maxHealth: 6200,
  attackType: "spreadLine",
  reloadDuration: 1.0,
  attackCooldown: 0.35,
  spreadLineDamage: 600,
  spreadLineRange: 8.33,
  spreadLineSpeed: 18,
  spreadLineCount: 6,
  spreadLineSpacing: 0.75,
  moveSpeedMultiplier: 1.0,
  walk: { cycleSpeed: 8, armAmp: 0.25, legAmp: 0.36, armRestZ: Math.PI * 0.05 },
},
```

---

## 궁극기 — 질풍 강타

| 항목 | 값 |
|---|---|
| 충전 조건 | 일반 공격 12회 적중 |
| 피해량 | 800 |
| 사거리 | 10타일 |
| 투사체 속도 | 기본 공격의 5/3 |
| 넉백 거리 | 8타일 |
| 벽 관통 | 가능 |
| 적 관통 | 경로상의 적 모두 타격 |

- 키보드: `Space` 또는 `Q`
- 궁극기 버튼은 충전량에 따라 캐릭터 색으로 채워진다.
- 투사체 이미지는 `assets/vfx/gale-strike.png`를 사용한다.

## 3D 모델

- 경로: `assets/3d/cyan/`
- `walk-m1s.glb`: 걷기 시작
- `walk-m2l.glb`: 반복 걷기
- `walk-m3e.glb`: 걷기 정지
- 공격 시 양팔을 전방으로 뻗는 뼈대 모션을 추가로 적용한다.

## Regression Guard
- 기존 5캐릭터 밸런스 변경 없음
- 기존 charStats 데이터 보존 (cyan 필드만 추가)

## Acceptance Criteria
- [ ] Cyan 선택 후 전투에서 6발 확산 투사체 발사됨
- [ ] 투사체가 0.75 units 간격으로 평행하게 발사됨
- [ ] 각 투사체 데미지 600
- [ ] 궁극기 12회 충전, 800 피해, 10타일 사거리, 8타일 넉백이 적용된다
- [ ] 로비에서 Cyan 카드 표시 + 선택 가능
- [ ] 봇이 Cyan으로 배정될 수 있음
- [ ] 한/영 번역 정상 작동
