# 초기 렌더링 버그 수정 (v2)

## 발생 문제
크롬에서 페이지 로드 시 로비 화면이 나타나지 않고 어두운 화면에 멈춤

## 근본 원인
```
근본 원인 ①: v1 픽스에서 message-overlay에 style="display:none" 추가 →
              JS 실행 전까지 로비 카드가 완전히 숨겨짐
근본 원인 ②: Three.js CDN(unpkg.com) 로드 실패/지연 시
              main.js ES module import 전체 실패 → showLobby() 미실행
결합 효과: CSS body 배경만 보이고 로비가 전혀 표시되지 않음

영향 범위: 페이지 초기 로드 시 로비 화면 표시
관련 파일: index.html:70 (message-overlay), src/main.js:1 (import CDN URL)
기존 spec: specs/fix-initial-render.md (v1 — 이 파일이 v2로 대체)
기존 테스트: 없음
```

## Current Behavior
- `message-overlay`에 `style="display:none"` 이 있어 JS 미실행 시 로비 비표시
- `account-creation`, `lobby-main` 모두 `class="hidden"` 으로 숨겨진 상태
- Three.js CDN(unpkg.com) 불안정 시 JS 전혀 실행 안 됨 → 빈 화면

## Expected Behavior
- 페이지 로드 즉시 로비 카드(계정 생성 or 로비 메인)가 표시됨
- JS 미실행 환경에서도 account-creation 카드는 기본 표시
- JS 실행 시 `showLobby()`가 계정 유무에 따라 올바른 카드를 표시

## Fix
1. `index.html`: `message-overlay`에서 `style="display:none"` 제거
   → CSS `display: flex` 기본값 복원 (오버레이 항상 표시)
2. `index.html`: `account-creation`의 `class="message-card hidden"` →
   `class="message-card"` 로 변경 (기본 표시)
3. `src/main.js`: CDN URL을
   `unpkg.com` → `cdn.jsdelivr.net` 으로 교체 (글로벌/한국 안정성 향상)

### 엣지 케이스
- 기존 계정 보유 사용자: JS 실행 시 account-creation이 잠깐 보였다가
  showLobby()가 lobby-main으로 전환 (플래시 허용)
- result-overlay의 기존 `style="display:none"` 픽스는 유지

## Regression Guard
- `checkEndState()`: `resultOverlay.style.display = "flex"` 정상 작동 유지
- `showLobby()`: `messageOverlay.style.display = "flex"` — 이미 flex이므로 무해
- `resetGame()`: `messageOverlay.style.display = "none"` 으로 숨김 유지
- `account-creation`의 inline style 설정 (`style.display = "none"/"block"`)이
  class보다 우선 → 기존 showLobby() 로직 변경 없음

## Acceptance Criteria
- [ ] 크롬에서 열면 로비 화면(계정 생성 or 로비 메인)이 즉시 표시된다
- [ ] 계정 없을 때: 계정 생성 카드가 표시된다
- [ ] 계정 있을 때: 로비 메인 카드가 표시된다
- [ ] "전투 종료" 기본 텍스트가 초기에 노출되지 않는다
- [ ] 게임 종료 후 결과 화면이 정상적으로 표시된다
- [ ] 재시작 버튼 클릭 후 로비로 돌아간다
