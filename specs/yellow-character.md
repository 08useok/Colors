# Yellow 캐릭터 추가 (Season 2)

## 개요
전기 투사체로 적을 감속시키는 중거리 사냥꾼.
Red의 내구력, Green의 폭딜, Blue의 장거리, Orange의 폭발과 차별화되는 **이동 제어 + 추격** 특화 캐릭터.

---

## 스탯

| 항목 | 값 | 비고 |
|------|-----|------|
| 체력 | 5,800 | Blue(4400) < **Yellow** < Orange(6500) |
| 이동속도 | 1.0 (Normal) | Blue, Orange와 동일 |
| 사거리 | 8 | Orange와 동일 |
| 탄약 | 3 | |
| 재장전 | 1.0초 | Orange와 동일 |
| 공격 쿨다운 | 0.7초 | Orange와 동일 |
| 데미지 | 4,400 | Red 더블펀치 총합과 동일 |
| 투사체 속도 | 16 | Orange와 동일 |

---

## 공격 방식

### 투사체
- 직선 전기 투사체 1발 발사
- `attackType: "electric"`
- 투사체 색상: `0xFFDD00` (노란색)
- 투사체 메시: 작은 구체 (Orange bomb과 유사 크기)

### 조준선
- 흰색 직선, 사거리(8)와 일치
- 기존 캐릭터 조준선 스타일 통일

---

## 특수 효과 — Shock (감전)

### 발동 조건
- Yellow의 투사체가 적에게 명중

### 효과
- 이동속도 40% 감소
- 지속 시간: 2초
- 추가 데미지 없음
- 재히트 시 지속 시간 갱신 (중첩 아님)

### 시각 효과
- 피격 시 노란 플래시 (기존 빨간 데미지 팝업과 별도)
- 감전 상태인 적: 노란 깜빡임 또는 전기 이펙트 (간단하게)

---

## 상성

| 캐릭터 | 관계 | 이유 |
|--------|------|------|
| Blue | ✅ 유리 | 낮은 체력 + 감속으로 추격 용이 |
| Red | ❌ 불리 | 높은 체력으로 감속을 버티고 근접 압박 |

### 상성표 업데이트 (5캐릭터)
```
Red:    ✅ Green   ❌ Orange
Green:  ✅ Orange  ❌ Red
Orange: ✅ Red     ❌ Blue
Blue:   ✅ Orange  ❌ Green
Yellow: ✅ Blue    ❌ Red
```

---

## CHARACTERS 정의

```js
yellow: {
  color: 0xFFDD00,
  maxHealth: 5800,
  attackType: "electric",
  reloadDuration: 1.0,
  attackCooldown: 0.7,
  electricDamage: 4400,
  electricRange: 8,
  electricSpeed: 16,
  shockSlowPercent: 0.4,
  shockDuration: 2.0,
  moveSpeedMultiplier: 1.0,
  walk: { cycleSpeed: 8, armAmp: 0.25, legAmp: 0.36, armRestZ: Math.PI * 0.05 },
},
```

---

## 구현 범위

### 포함
- [ ] CHARACTERS에 yellow 추가
- [ ] 전기 투사체 발사 로직 (직선, 단발)
- [ ] Shock 디버프 시스템 (이동속도 40% 감소, 2초, 갱신)
- [ ] 감전 시각 이펙트 (노란 플래시)
- [ ] 로비 캐릭터 카드 추가
- [ ] 조준선 (흰색 직선, 사거리 8)
- [ ] 상성표 5캐릭터로 업데이트
- [ ] 봇 AI에 yellow 배정 + yellow 전용 전략
- [ ] charStats에 yellow 추가 + 마이그레이션
- [ ] 한/영 번역 키 추가

### 제외
- Yellow 전용 맵
- Yellow 스킨/코스메틱
- 감전 체인 (다른 적에게 전이)

---

## Regression Guard
- 기존 4캐릭터 밸런스 변경 없음
- 기존 charStats 데이터 보존 (yellow 필드만 추가)
- 상성표 레이아웃이 5캐릭터로 확장되어도 기존 4캐릭터 상성 유지

## Acceptance Criteria
- [ ] Yellow 선택 후 전투에서 전기 투사체 발사됨
- [ ] 피격 시 적 이동속도 40% 감소, 2초 지속
- [ ] 재히트 시 Shock 지속 시간 갱신
- [ ] 로비에서 Yellow 카드 표시 + 선택 가능
- [ ] 상성표 5캐릭터로 업데이트됨
- [ ] 봇이 Yellow로 배정될 수 있음
- [ ] 한/영 번역 정상 작동
