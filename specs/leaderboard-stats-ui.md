# 리더보드 + 모드별 전적 + 통계 UI 이동

## 개요
1. 리더보드 기능 추가
2. 캐릭터 승률을 모드별(쇼다운/찹 우드)로 분리 기록
3. 통계(승률, 판수, 승리) + 계정 정보 + 트로피를 왼쪽 위 별도 패널로 이동

---

## 1. 리더보드

### 표시 위치
- 로비 사이드 패널에 "리더보드" 토글 버튼 추가
- 클릭 시 리더보드 패널 표시

### 데이터
- localStorage 기반 (싱글플레이 게임이라 본인 기록만)
- 표시 항목: 트로피, 총 승률, 최고 연승, 캐릭터별 최고 승률

### 구조
```
리더보드
━━━━━━━━━
🏆 트로피: 366
📊 총 승률: 73% (41승 / 56판)
🔥 최고 연승: 6
━━━━━━━━━
캐릭터별 최고 승률:
  🔴 Red: 60% (9승/15판)
  🟢 Green: 75% (15승/20판)
  🔵 Blue: 80% (16승/20판)
  🟠 Orange: 0% (0승/0판)
```

---

## 2. 모드별 전적 분리

### localStorage 스키마 변경

#### 기존
```js
charStats: {
  red: { wins: 0, games: 0 },
  green: { wins: 0, games: 0 },
  ...
}
```

#### 변경
```js
charStats: {
  showdown: {
    red: { wins: 0, games: 0 },
    green: { wins: 0, games: 0 },
    blue: { wins: 0, games: 0 },
    orange: { wins: 0, games: 0 },
  },
  chopWood: {
    red: { wins: 0, games: 0 },
    green: { wins: 0, games: 0 },
    blue: { wins: 0, games: 0 },
    orange: { wins: 0, games: 0 },
  },
}
```

### 마이그레이션
- 기존 `charStats.red` → `charStats.showdown.red`로 자동 변환
- `loadAccount()`에서 구조 감지 후 마이그레이션

### 기록 시점
- `recordGameResult(rank)`: `state.mode`에 따라 해당 모드의 charStats 업데이트
- 쇼다운: `charStats.showdown[char]`
- 찹 우드: `charStats.chopWood[char]`

---

## 3. 통계 UI 이동

### 현재 위치
- 로비 카드 내 (lobby-main 안에 인라인)

### 변경 위치
- 로비 왼쪽 위에 별도 버튼 "내 정보" 클릭 → 패널 표시

### 패널 내용
```
[내 정보]
━━━━━━━━━
양우석  Lv.2
🏆 트로피 366
41승 15패 | 승률 73%
최고 연승: 6
━━━━━━━━━
쇼다운 전적:
  Red: 60% | 9승/15판
  Green: 75% | 15승/20판
  Blue: 80% | 16승/20판
  Orange: -
━━━━━━━━━
찹 우드 전적:
  Red: -
  Green: -
  Blue: -
  Orange: -
```

### 로비 카드에서 제거할 것
- 기존 캐릭터 카드 아래 승률 표시 → 유지하되 현재 모드 기준으로 표시
- lobby-header의 승률/전적 → "내 정보" 패널로 이동

---

## HTML 추가 요소

```html
<!-- 사이드 패널에 추가 -->
<button id="stats-toggle" class="side-toggle-btn">내 정보</button>
<div id="stats-panel" class="stats-panel hidden">
  <!-- 계정 정보 + 모드별 전적 -->
</div>

<!-- 사이드 패널에 추가 -->
<button id="leaderboard-toggle" class="side-toggle-btn">리더보드</button>
<div id="leaderboard-panel" class="leaderboard-panel hidden">
  <!-- 리더보드 내용 -->
</div>
```

---

## Regression Guard
- 기존 전체 wins/losses 카운트 유지
- 기존 charStats 마이그레이션으로 데이터 보존
- 캐릭터 카드 승률 표시는 현재 선택된 모드 기준

## Acceptance Criteria
- [ ] 리더보드 버튼 클릭 시 트로피/총 승률/최고 연승/캐릭터별 승률 표시
- [ ] 쇼다운/찹 우드 전적이 분리 기록됨
- [ ] 기존 charStats가 showdown으로 자동 마이그레이션됨
- [ ] "내 정보" 버튼 클릭 시 계정 + 모드별 전적 패널 표시
- [ ] 캐릭터 카드 승률이 현재 모드 기준으로 표시됨
- [ ] 한/영 번역 지원
