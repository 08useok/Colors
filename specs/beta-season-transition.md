# 베타 시즌 전환

## 개요
2026-07-06부로 게임 내 시즌을 알파 시즌 4(`alpha4`)에서 베타 시즌 1(`beta1`)로 전환한다. 이 문서는 이번 시즌에 새로 추가되는 콘텐츠(크림슨, 크레딧, 캐릭터 등급, 가샤, 신규 스킨, Orange 밸런스)의 상위 개요이며, 각 항목의 상세는 아래 스펙 파일을 참조한다.

- `specs/crimson-character.md` — 신규 캐릭터 크림슨
- `specs/orange-rebalance.md` — Orange 밸런스 버프
- `specs/character-rarity-shop.md` — 캐릭터 등급 · 크레딧 구매
- `specs/skin-red-theme.md` — 레드 컬러 테마 신규 스킨
- `specs/daily-gacha.md` — 일일 가샤(랜덤 뽑기)

---

## 시즌 상수 변경

`src/main.js`:
```js
const CURRENT_SEASON = "beta1"; // 기존 "alpha4"
const SEASONS = {
  alpha1: "알파 시즌 1",
  alpha2: "알파 시즌 2",
  alpha3: "알파 시즌 3",
  alpha4: "알파 시즌 4",
  beta1: "베타 시즌 1", // 신규
};
```

## 시즌 전적 처리
- 기존 `seasonStats`/`seasonCharStats`는 시즌 키(`alpha1`~`alpha4`)별로 이미 분리 저장되고 있음 — 구조 변경 없음
- `CURRENT_SEASON`이 `beta1`로 바뀌는 순간부터 신규 전적은 `seasonStats.beta1` / `seasonCharStats.beta1`에 누적
- 기존 알파 시즌 전적(1~4)은 그대로 보존 — 마이그레이션이나 초기화 없음
- 프로필 화면의 "시즌별 전적" 목록에 "베타 시즌 1"이 알파 시즌 4 다음 줄에 추가되고, 현재 시즌 표시(⬅)가 베타 시즌 1로 이동

## Non-goals
- 시즌 종료 시점의 보상/랭크 초기화 로직 (알파 시즌 종료 처리 방식 그대로 유지, 별도 변경 없음)
- 시즌 카운트다운 UI, 시즌 종료일 표시

## Acceptance Criteria
- [ ] `CURRENT_SEASON`이 `"beta1"`이다
- [ ] `SEASONS`에 `beta1: "베타 시즌 1"` 항목이 존재한다
- [ ] 신규 계정 생성 시 `seasonStats`/`seasonCharStats`에 `beta1` 키가 정상 초기화된다
- [ ] 기존 계정(alpha4까지 진행)으로 접속 시 `seasonStats.beta1`이 자동 생성되고 alpha1~4 데이터는 그대로 유지된다
- [ ] 프로필 "시즌별 전적" 목록에 알파 시즌 1~4 + 베타 시즌 1이 순서대로 표시되고, 베타 시즌 1에 현재 시즌 표시(⬅)가 붙는다
- [ ] 전투 승/패 기록 시 `seasonStats.beta1`/`seasonCharStats.beta1[캐릭터]`가 갱신된다
