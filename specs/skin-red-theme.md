# 레드 컬러 테마 스킨 — 베타 시즌 1

## 개요
베타 시즌 1 신규 스킨으로 "레드 컬러 테마" 라인을 추가한다. 서로 다른 캐릭터에 빨간색 계열 스킨을 적용하며, 캐릭터 등급과 무관하게 스킨 자체의 등급(희귀/초희귀/영웅)에 따라 코인 가격이 다르다.

기존 `SKINS` 객체(`src/main.js:213`)에는 등급(rarity) 필드가 없었다 — 이번에 스킨마다 `rarity` 필드를 추가한다.

## 신규 스킨 정의

| id | 대상 캐릭터 | 이름 | 등급 | 가격(코인) | season |
|---|---|---|---|---|---|
| `beta_red_orange` | Orange | Crimson Orange | 희귀 | 1,000 | `beta1` |
| `beta_red_crimson` | Crimson | Blood Crimson | 초희귀 | 2,500 | `beta1` |
| `beta_red_red` | Red | Scarlet Red | 영웅 | 5,000 | `beta1` |

```js
const SKINS = {
  alpha_red: { name: "Alpha Red", character: "red", season: "alpha3", cost: 1000, desc: "skinAlphaRedDesc", rarity: "rare" },
  beta_red_orange:  { name: "Crimson Orange", character: "orange",  season: "beta1", cost: 1000, desc: "skinBetaRedOrangeDesc",  rarity: "rare" },
  beta_red_crimson: { name: "Blood Crimson",  character: "crimson", season: "beta1", cost: 2500, desc: "skinBetaRedCrimsonDesc", rarity: "epic" },
  beta_red_red:     { name: "Scarlet Red",    character: "red",     season: "beta1", cost: 5000, desc: "skinBetaRedRedDesc",     rarity: "legendary" },
};
```

- 기존 `alpha_red`에도 `rarity: "rare"` 소급 부여 (필드 누락 방지)
- `rarity` 값: `rare`(희귀) / `epic`(초희귀) / `legendary`(영웅)

## 표현 방식
- 기존 `applySkin()` 패턴을 따라 캐릭터 외형에 빨간 색조 오버레이 또는 장식(예: 기존 `alpha_red`의 왕관처럼 등급별 시각 포인트) 적용 — 구체적 비주얼은 구현 시 결정
- 상점 카드에 등급 배지 표시 (희귀/초희귀/영웅 텍스트 또는 색상 테두리로 구분)

## 구매 조건
- **캐릭터 등급과 무관하게 코인으로만 구매** — 예를 들어 `beta_red_crimson`(크림슨 스킨)을 구매하려면 코인 2,500만 있으면 되고, 크림슨 캐릭터 자체를 크레딧으로 보유했는지 여부는 스킨 구매 가능 여부에 영향 없음 (단, 장착은 해당 캐릭터를 플레이할 때만 적용되므로 캐릭터 보유가 사실상 선행되어야 유의미)
- 기존 스킨 구매 플로우(`shop-skins` 탭, `skin.cost`, `skin.season === CURRENT_SEASON`) 그대로 재사용

## 로컬라이제이션
- `src/LANGS/langs.js`에 `skinBetaRedOrangeDesc`, `skinBetaRedCrimsonDesc`, `skinBetaRedRedDesc` 키를 ko/en 모두 추가

## Non-goals
- 레드 테마 외 다른 색상 테마 스킨 라인 (그린/블루 테마 등)
- 스킨 등급별 스탯 보정 (스킨은 순수 코스메틱, 밸런스에 영향 없음 — 기존 원칙 유지)

## Acceptance Criteria
- [ ] 상점 스킨 탭에 `beta_red_orange`, `beta_red_crimson`, `beta_red_red` 3종이 표시된다
- [ ] 각 스킨의 코인 가격이 1000/2500/5000으로 정확히 표시된다
- [ ] 각 스킨 카드에 등급(희귀/초희귀/영웅)이 표시된다
- [ ] 코인이 충분하면 구매 후 즉시 보유 목록에 추가되고 장착 가능하다
- [ ] 장착 시 해당 캐릭터 플레이 중 스킨 외형이 적용된다
- [ ] `CURRENT_SEASON`이 `beta1`이 아니게 되면(다음 시즌 진입 시) 미보유 상태의 이 스킨들은 "시즌 종료" 표시로 전환된다 (기존 시즌 만료 로직 재사용)
