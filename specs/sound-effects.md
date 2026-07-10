# 효과음 확장 — UI/게임 이벤트 SFX

## Current Behavior
`src/main.js:1135`의 `audio` 객체가 Web Audio API 오실레이터 실시간 합성으로 5종만 재생한다: `attack`, `hit`, `reload`, `kill`, `warning`. 별도 오디오 파일(에셋) 없음, 라이브러리 없음 (`specs/overview.md` 오디오 항목과 일치).

BGM(`lobby-bgm.mp3`, `showdown-bgm.mp3`, `showdown-theme.mp3`)은 이 스펙 범위 밖 (기존 파일 기반 재생 유지).

## Scope Decision (딥 인터뷰 결과)
사용자 요청 목록(UI/게임시작/이동/전투/캐릭터/상태/쇼다운/결과/환경, 약 30항목) 중:
- **포함**: 이미 게임 로직/이벤트 지점이 존재하는 항목 + 소규모 감지 로직만 추가하면 되는 4개 항목(버튼 호버, 코스메틱 구매 실패, 체력 낮음 1회 알림, 덤불 진입/이탈)
- **제외** (게임 메커닉 자체가 없어 별도 기능 스펙 필요): 점프/착지(`specs/overview.md` Non-goals에 명시), 지형별 발자국(지형 구분 시스템 없음), 치명타(크리티컬 판정 없음), 벽 파괴(벽 체력 개념 없음), 궁극기/스킬 준비 완료(게이지 시스템 없음), 보호막(shield 로직 없음), 연속 처치/킬스트릭(로직 없음), 아이템 획득(루팅 시스템 없음), 물 상호작용(호수는 진입 불가 정적 장애물이라 개념 자체 불성립)
- 레벨업 상점·스킨 상점 구매 실패는 버튼이 `disabled`라 클릭 이벤트 자체가 발생하지 않아 제외 (코스메틱 탭만 `toast()` 지점 존재)

## Expected Behavior — 합성 방식
기존 `pulse({ wave, from, to, duration, peak, attack, delay })` 헬퍼를 그대로 재사용해 `audio.play(type)`에 새 분기를 추가한다. 신규 파형 21종:

| type | 카테고리 | 사운드 의도 | 설계 (wave/from→to/duration/peak) |
|---|---|---|---|
| `click` | UI | 짧고 또렷한 클릭 | sine 900→600 / 0.04s / .05 |
| `hover` | UI | 아주 미세한 틱 | sine 700→750 / 0.03s / .02 |
| `open` | UI | 상승하는 스윕 | triangle 300→600 / 0.10s / .045 |
| `close` | UI | 하강하는 스윕 | triangle 500→260 / 0.08s / .04 |
| `purchase` | UI | 경쾌한 2음 상승(코인) | triangle 440→660 .08/.05 + square 660→880 .06/.04 delay .07 |
| `purchaseFail` | UI | 짧고 탁한 버즈 | sawtooth 180→120 / 0.10s / .05 |
| `matchFound` | 게임시작 | 밝은 확인음 | sine 520→780 / 0.15s / .05 |
| `countdownTick` | 게임시작 | 플랫 비프 (3·2·1 공통) | square 440(유지) / 0.08s / .06 |
| `gameStart` | 게임시작 | 활기찬 스웰 | sawtooth 200→500 .20/.07 + triangle 500→700 .15/.05 delay .05 |
| `projectileFire` | 전투 | 발사 훅(whoosh) | sine 800→300 / 0.09s / .04 |
| `explosion` | 전투 | 저음 붐 | sawtooth 90→40 .35/.09 + square 60→30 .30/.06 delay .02 |
| `damaged` | 상태 | 플레이어 피격 둔탁음 (공격자 관점 `hit`과 구분) | triangle 220→120 / 0.12s / .07 |
| `lowHealth` | 상태 | 긴박한 경고 펄스 (`warning`=자기장 밖과 구분) | square 300→260 .15/.06 + square 260→300 .12/.05 delay .1 |
| `heal` | 상태 | 부드러운 상승 쉬머 | sine 500→900 .20/.04 + sine 700→1100 .18/.03 delay .06 |
| `showdownStart` | 쇼다운 | 드라마틱 혼 | sawtooth 150→300 .30/.08 + square 300→450 .20/.06 delay .1 |
| `zoneShrink` | 쇼다운 | 불길한 하강음 (자기장 페이즈 전환 순간) | triangle 400→150 / 0.40s / .05 |
| `win` | 결과 | 승리 팡파르 3연음 | triangle 440→660 .12/.06 + 660→880 .15/.06 delay .1 + 880→1100 .18/.05 delay .25 |
| `lose` | 결과 | 처지는 2연음 | triangle 440→220 .30/.05 + 220→110 .35/.04 delay .2 |
| `chopWood` | 환경 | 나무 특유의 둔탁한 노크음 (기존 `hit` 대체) | square 220→110 / 0.06s / .07 |
| `bushEnter` | 환경 | 부스럭 진입 | triangle 350→250 / 0.10s / .03 |
| `bushExit` | 환경 | 부스럭 이탈(역방향) | triangle 250→350 / 0.10s / .03 |

`zonePhaseIndex`/`lowHealthAlerted`/`bushState` 같은 이전 상태 비교용 플래그를 `state`에 추가해 매 프레임 폴링 중 "값이 바뀐 순간"만 1회 재생한다 (기존 `attack`/`hit` 등은 이벤트 발생 시점에 직접 호출이라 별도 플래그 불필요).

## Trigger Points (main.js 기준, 딥 인터뷰 조사 결과)

| type | 연결 위치 |
|---|---|
| `click` | 전역 버튼 `addEventListener("click", ...)` 약 40여 곳 — 공용 헬퍼로 일괄 적용 |
| `hover` | 주요 버튼에 `mouseenter` 리스너 신규 추가 (전역 위임 방식 권장) |
| `open` / `close` | 오버레이 `classList.remove/add("hidden")` 지점 (`shopOverlay`, `matchmakingOverlay`, `rotationOverlay` 등) |
| `purchase` | `renderShopLevelUp`/`renderShopSkins`/코스메틱 `onBuy` 콜백 성공 분기 |
| `purchaseFail` | 코스메틱 상점 `toast("코인이 부족합니다")` 호출 지점 (3곳) |
| `matchFound` | `mp.on("ROOM_JOINED"/"PLAYER_JOINED")` |
| `countdownTick` | `mp.on("COUNTDOWN")` 및 솔로 모드 `state.freezeUntil` 기반 프리즈 카운트다운 — 정수 초 값이 바뀌는 순간 |
| `gameStart` | `mp.on("GAME_START")`, `resetGame()` 및 각 모드 시작 함수 |
| `projectileFire` | `state.projectiles.push({...})` 각 공격 함수 |
| `explosion` | `createBombExplosionEffect()` 호출부 (`updateProjectiles()`) |
| `damaged` | `applyDamage()` — 대상이 플레이어(로컬 조작 캐릭터)일 때 |
| `lowHealth` | `applyDamage()` 이후 `health / maxHealth < 0.3` 최초 진입 시 1회 (신규 플래그) |
| `heal` | `beginHealCircleAttack()` 회복 적용 지점 |
| `showdownStart` | `triggerShowdownAnnounce()` |
| `zoneShrink` | 자기장 페이즈 텍스트 갱신 지점에서 이전 페이즈 인덱스와 비교 (신규 플래그) |
| `win` / `lose` | `checkEndState()`, `checkTakeDownEnd()` 각 승/패 분기 |
| `chopWood` | `updateChopping()` 나무 타격 지점 (기존 `audio.play("hit")` 대체) |
| `bushEnter` / `bushExit` | `isInBush()` 결과를 이전 프레임 값과 비교 (신규 플래그) |

## Non-goals
- 점프/착지/치명타/벽파괴/궁극기/스킬게이지/보호막/킬스트릭/아이템획득/지형별발자국/물상호작용 — 해당 게임 메커닉 자체가 없어 이번 스펙에서 제외 (필요 시 각각 별도 스펙)
- 실제 오디오 파일(mp3/wav) 도입, 오디오 라이브러리(Howler 등) 추가 — 기존 무에셋 오실레이터 합성 방식 유지
- 레벨업/스킨 상점의 구매 실패 사운드 — 버튼 disabled 구조상 트리거 지점 부재로 제외
- 기존 5종(`attack`/`hit`/`reload`/`kill`/`warning`) 파라미터 변경 (단, `chopWood`가 나무 타격에서 `hit` 호출을 대체)

## Acceptance Criteria
- [ ] `audio.play()`에 위 표의 21개 신규 `type` 분기가 추가된다
- [ ] 각 트리거 지점에서 해당 사운드가 콘솔 에러 없이 재생된다 (브라우저 콘솔 확인)
- [ ] 카운트다운/자기장 축소/체력 낮음/덤불 진입·이탈은 매 프레임 반복 재생되지 않고 상태 전환 순간에 1회만 재생된다
- [ ] 기존 `attack`/`hit`/`reload`/`kill`/`warning` 동작에 회귀 없음 (단, 나무 타격은 `chopWood`로 대체)
- [ ] 레벨업/스킨 상점 구매 실패는 이번 범위에서 구현하지 않는다 (버튼 disabled 유지)
