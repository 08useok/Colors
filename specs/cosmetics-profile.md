# 프로필 꾸미기 — 배경 · 뱃지

## 개요

로비 프로필 헤더에 배경과 뱃지를 적용한다.  
배경은 프로필 카드의 배경색/그라디언트, 뱃지는 닉네임 옆 아이콘으로 표시된다.

---

## 프로필 배경 아이템 (6개)

| id | 이름 | 표현 | 가격(코인) |
|---|---|---|---|
| `bg_default` | 기본 | 회색 (`#2a2a2a`) | 무료 (기본 보유) |
| `bg_flame` | 불꽃 | 주황→빨강 그라디언트 | 200 |
| `bg_ocean` | 바다 | 파랑→청록 그라디언트 | 200 |
| `bg_night` | 밤하늘 | 남색→보라 그라디언트 | 200 |
| `bg_forest` | 숲 | 진초록→올리브 그라디언트 | 200 |
| `bg_gold` | 황금 | 황금→노랑 그라디언트 | 400 |

---

## 뱃지 아이템 (8개)

| id | 이모지 | 이름 | 가격(코인) |
|---|---|---|---|
| `badge_none` | — | 없음 | 무료 (기본) |
| `badge_star` | ⭐ | 스타 | 150 |
| `badge_crown` | 👑 | 왕관 | 150 |
| `badge_sword` | ⚔️ | 검 | 150 |
| `badge_skull` | 💀 | 해골 | 150 |
| `badge_fire` | 🔥 | 불꽃 | 150 |
| `badge_bolt` | ⚡ | 번개 | 150 |
| `badge_gem` | 💎 | 보석 | 300 |

---

## 로비 프로필 카드 렌더링

### 배경
- `#profile-header` 영역에 CSS `background` 속성으로 적용
- 그라디언트는 `linear-gradient(135deg, color1, color2)` 형식

### 뱃지
- 닉네임 텍스트 앞에 이모지 표시: `⭐ 닉네임`
- `badge_none` 장착 시 이모지 없음

---

## 계정 스키마 추가

기존 `cosmetics` 키에 병합:

```json
"cosmetics": {
  "ownedEmotes": [],
  "equippedEmote": null,
  "ownedBgs": ["bg_default"],
  "equippedBg": "bg_default",
  "ownedBadges": ["badge_none"],
  "equippedBadge": "badge_none"
}
```

---

## 장착 UI (상점 내)

- 배경/뱃지 탭에서 보유 아이템에 "장착" / 장착 중이면 "장착됨" 표시
- 장착 시 로비 프로필 카드 즉시 갱신 (상점 열린 상태에서도 반영)
- 1개만 장착 가능 (기존 장착 자동 해제)

---

## 마이그레이션

기존 계정에 `cosmetics` 키가 없으면 초기값으로 자동 생성:
```json
{ "ownedEmotes": [], "equippedEmote": null,
  "ownedBgs": ["bg_default"], "equippedBg": "bg_default",
  "ownedBadges": ["badge_none"], "equippedBadge": "badge_none" }
```

---

## Acceptance Criteria

- [ ] 로비 프로필 헤더에 장착된 배경이 표시된다
- [ ] 닉네임 앞에 장착된 뱃지 이모지가 표시된다
- [ ] `bg_default`와 `badge_none`은 모든 신규/기존 계정이 기본 보유한다
- [ ] 배경·뱃지 장착 변경 시 프로필 카드가 즉시 갱신된다
- [ ] 상점에서 구매 후 즉시 보유 목록에 추가된다
