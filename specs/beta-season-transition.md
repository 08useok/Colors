# 베타 시즌 전환

## 현재 상태

기본 게임은 아직 알파 시즌 4(`alpha4`, v1.4.14)를 유지한다.
베타 시즌 기능은 `beta-season.html`과 `src/config/beta-characters.js`에서 분리 테스트하며, 사용자의 별도 배포 지시 전까지 기본 시즌으로 전환하지 않는다.

이 문서는 베타 시즌 1 후보 콘텐츠의 상위 개요다.

- `specs/crimson-character.md` — 신규 캐릭터 크림슨
- `specs/orange-rebalance.md` — Orange 밸런스 버프
- `specs/character-rarity-shop.md` — 캐릭터 등급 · 크레딧 구매
- `specs/skin-red-theme.md` — 레드 컬러 테마 신규 스킨
- `specs/daily-gacha.md` — 승리할 때마다 지급되는 β 크레딧 보상

---

## 정식 전환 시 시즌 상수 변경

`src/main.js`:
```js
const CURRENT_SEASON = "beta1"; // 정식 전환 시에만 alpha4에서 변경
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

## 베타 → 메인 사거리 변환 규칙

- 베타 시즌의 캐릭터·공격·궁극기를 메인 게임으로 옮길 때 모든 **최대 사거리 값은 베타 값의 2배**로 적용한다.
- 적용 대상은 `attackRange`, 투사체 `*Range`, 궁극기 `range`·`castRange`처럼 공격이 도달하거나 시전될 수 있는 최대 거리다.
- 피해 범위·장판 크기·투사체 충돌 반경처럼 사거리가 아닌 `radius`, `width`, `size` 값은 별도 지시가 없으면 2배로 늘리지 않는다.
- 조준선의 길이와 AI의 공격 가능 거리도 변환된 메인 사거리와 일치해야 한다.
- 예: 베타 사거리 `10`은 메인에서 `20`, 베타 사거리 `8.33`은 메인에서 `16.66`으로 적용한다.
- 이 규칙은 이 문서가 갱신된 이후 메인으로 승격하는 콘텐츠부터 적용한다. 이미 메인에 적용된 캐릭터의 수치는 별도 밸런스 변경 지시 없이 소급 변경하지 않는다.

## Non-goals
- 베타 테스트 중 `CURRENT_SEASON`을 즉시 `beta1`로 변경하는 작업
- 시즌 종료 시점의 보상/랭크 초기화 로직 (알파 시즌 종료 처리 방식 그대로 유지, 별도 변경 없음)
- 시즌 카운트다운 UI, 시즌 종료일 표시

## Acceptance Criteria
- [x] 기본 게임의 `CURRENT_SEASON`은 정식 전환 전까지 `"alpha4"`이다
- [x] 베타 테스트 페이지와 베타 캐릭터 설정이 기본 게임과 분리되어 있다
- [ ] 정식 전환 시 `CURRENT_SEASON`이 `"beta1"`이다
- [ ] `SEASONS`에 `beta1: "베타 시즌 1"` 항목이 존재한다
- [ ] 신규 계정 생성 시 `seasonStats`/`seasonCharStats`에 `beta1` 키가 정상 초기화된다
- [ ] 기존 계정(alpha4까지 진행)으로 접속 시 `seasonStats.beta1`이 자동 생성되고 alpha1~4 데이터는 그대로 유지된다
- [ ] 프로필 "시즌별 전적" 목록에 알파 시즌 1~4 + 베타 시즌 1이 순서대로 표시되고, 베타 시즌 1에 현재 시즌 표시(⬅)가 붙는다
- [ ] 전투 승/패 기록 시 `seasonStats.beta1`/`seasonCharStats.beta1[캐릭터]`가 갱신된다
- [ ] 베타 콘텐츠를 메인으로 승격할 때 모든 최대 사거리 값이 정확히 `×2`로 변환된다
- [ ] 메인의 조준선과 AI 공격 판정이 변환된 사거리와 일치한다
- [ ] 피해 범위·충돌 반경 등 사거리가 아닌 크기 값은 의도치 않게 2배가 되지 않는다
