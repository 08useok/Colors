# 캐릭터별 통계 + 연승 시스템

## 개요
캐릭터마다 독립적인 전적(판수 · 승리 · 승률)을 기록하고,
연속 승리(연승)를 추적해 로비와 결과 화면에 표시한다.
100승 달성 시 트로피 부스트 보상을 1회 지급한다.

---

## 1. localStorage 스키마 변경

### 기존
```js
{
  id, nickname, trophies, wins, losses,
  selectedCharacter, lastLoginDate, loginAttempts
}
```

### 추가 필드
```js
{
  // ... 기존 필드 유지 ...
  charStats: {
    red:   { wins: 0, games: 0 },
    green: { wins: 0, games: 0 },
    blue:  { wins: 0, games: 0 },
  },
  winStreak: 0,       // 현재 연승 횟수
  bestStreak: 0,      // 역대 최고 연승
}
```

- `charStats`가 없는 기존 계정은 `loadAccount()` 시 기본값으로 초기화 (마이그레이션)
- 승리 기준: `rank <= 4` (기존 `wins` 카운트와 동일 기준)

---

## 2. 통계 업데이트 — `recordGameResult(rank)`

### 연승 보너스 트로피표

| 현재 연승 (승리 후 기준) | 보너스 트로피 |
|---|---|
| 1연승 | +0 |
| 2연승 | +1 |
| 3연승 | +2 |
| 4연승 | +3 |
| 5연승 이상 | +4 |

```js
function streakBonus(streak) {
  if (streak <= 1) return 0;
  return Math.min(streak - 1, 4);
}
```

```js
// 기존 로직 유지 + 아래 추가
const char = account.selectedCharacter;  // 'red' | 'green' | 'blue'
account.charStats[char].games += 1;
if (rank <= 4) {
  account.charStats[char].wins += 1;
  account.winStreak += 1;
  if (account.winStreak > account.bestStreak) {
    account.bestStreak = account.winStreak;
  }
  const bonus = streakBonus(account.winStreak);
  if (bonus > 0) account.trophies += bonus;  // 기본 트로피 계산 이후 추가 지급
} else {
  account.winStreak = 0;
}
```

### 100승 부스트
- `charStats[char].wins > 0 && charStats[char].wins % 100 === 0` 조건으로 판단 (0 오발화 방지)
- 조건 충족 시 `account.trophies += 50` 추가 지급
- 결과 화면에 "🎉 100승 달성! +50 트로피" 메시지 표시

---

## 3. 로비 — 캐릭터 버튼 UI

각 `char-btn` 안의 `char-desc` 아래에 `.char-winrate` 요소를 추가한다.

```
[R]
Red
HP 10,000
더블 펀치, 근접 압박형 탱커
━━━━━━━━━━━━━━━
승률 72%  |  12승 / 17판
```

- `showLobby()` 호출 시 `account.charStats`를 읽어 각 버튼에 업데이트
- 0판인 경우: `"첫 판에 도전하세요!"`
- 승률: `Math.round(wins / games * 100)`%

### 연승 표시 (로비 우측 상단)
계정 정보 영역(`lobby-nickname-row` 또는 그 근처)에:
```
🔥 3연승 중
```
- `winStreak >= 2`일 때만 표시 (1연승은 표시 안 함)
- `winStreak === 0`이면 숨김

---

## 4. 결과 화면 — 연승 표시

기존 `result-stats` 아래에 연승 정보를 추가한다.

| 상황 | 표시 |
|---|---|
| 2연승 이상 달성 (rank ≤ 4) | `🔥 N연승! +M 트로피 보너스` |
| 1연승 (첫 승) | 표시 안 함 |
| 연승 종료 (rank > 4, 직전 streak ≥ 2) | `연승이 끊겼습니다 (최고: N연승)` |
| streak < 2 종료 | 표시 안 함 |

- 결과 화면 렌더링 시점: `recordGameResult()` 호출 **이전에** `prevStreak = account.winStreak` 캡처,
  호출 후 갱신된 `winStreak`과 함께 사용
  - 연승 달성: `newStreak >= 2` → `🔥 N연승 달성!`
  - 연승 종료: `prevStreak >= 2 && newStreak === 0` → `연승이 끊겼습니다 (최고: N연승)`

---

## 5. HTML 추가 요소

```html
<!-- char-btn 내부 char-desc 다음 -->
<div class="char-winrate" id="winrate-red"></div>
<div class="char-winrate" id="winrate-green"></div>
<div class="char-winrate" id="winrate-blue"></div>

<!-- 로비 우측 상단 계정 영역 내 -->
<div id="streak-display" class="hidden"></div>
```

---

## 6. 마이그레이션 — 기존 계정 호환

```js
function loadAccount() {
  const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY));
  if (!account.charStats) {
    account.charStats = {
      red:   { wins: 0, games: 0 },
      green: { wins: 0, games: 0 },
      blue:  { wins: 0, games: 0 },
    };
  }
  if (account.winStreak === undefined) account.winStreak = 0;
  if (account.bestStreak === undefined) account.bestStreak = 0;
  return account;
}
```

---

## Regression Guard
- 기존 전체 `wins` / `losses` 카운트 및 트로피 계산 로직 변경 없음
- 기존 `selectedCharacter` 저장/복원 변경 없음
- `charStats` 없는 기존 계정: 마이그레이션으로 기본값 자동 보완, 로그인 재시도 불필요

## Acceptance Criteria
- [ ] 전투 후 해당 캐릭터의 games가 1 증가한다
- [ ] rank ≤ 4이면 해당 캐릭터의 wins가 1 증가한다
- [ ] 로비 캐릭터 버튼 아래에 "승률 N% | M승 / K판"이 표시된다
- [ ] 0판 캐릭터는 "첫 판에 도전하세요!" 텍스트를 표시한다
- [ ] 연승 2회 이상이면 로비 우측 상단에 "🔥 N연승 중"이 표시된다
- [ ] 2연승부터 +1, 3연승 +2, 4연승 +3, 5연승 이상 +4 보너스 트로피가 지급된다
- [ ] 결과 화면에 연승 달성 시 "🔥 N연승! +M 트로피 보너스" 메시지가 표시된다
- [ ] 연승이 끊기면 "연승이 끊겼습니다 (최고: N연승)" 메시지가 표시된다
- [ ] 100승 달성 시 +50 트로피가 지급되고 결과 화면에 축하 메시지가 표시된다
- [ ] 기존 계정(charStats 없음)도 정상 동작한다 (마이그레이션)
