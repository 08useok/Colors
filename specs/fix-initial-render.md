# 초기 렌더링 버그 수정

## 발생 문제
페이지 로드 시 로비 화면 대신 "전투 종료" 결과 화면이 표시됨

## 근본 원인
```
근본 원인: styles.css에서 #result-overlay { display: flex; } (ID 선택자, 명시도 100)가
           .hidden { display: none; } (클래스 선택자, 명시도 10)보다 높은 명시도를 가짐
영향 범위: 페이지 초기 로드 시 result-overlay 표시 상태
관련 파일: index.html:118, styles.css:341-350
기존 spec: 없음
기존 테스트: 없음
```

## Current Behavior
- `result-overlay`에 `class="hidden"` 이 있으나, CSS ID 선택자 규칙이 클래스 규칙보다
  명시도가 높아 `display: flex` 가 적용됨
- 페이지 로드 직후 "전투 종료" 기본 텍스트가 노출됨
- `message-overlay`는 dark 반투명 오버레이만 보임 (자식 카드는 .hidden으로 숨겨짐)

## Expected Behavior
- 페이지 로드 시 `result-overlay`가 보이지 않음
- JS 실행 후 `showLobby()`가 `message-overlay`를 표시하고 로비 카드를 보여줌

## Fix
- `index.html`: `result-overlay`에 `style="display:none"` 추가 (인라인 > ID 선택자)
- `index.html`: `message-overlay`에 `style="display:none"` 추가 (일관성 및 Three.js CDN 실패 방어)

## Regression Guard
- `checkEndState()`에서 `resultOverlay.style.display = "flex"` 로 정상 표시 유지
- `showLobby()`에서 `messageOverlay.style.display = "flex"` 로 정상 표시 유지
- `resetGame()`에서 양쪽 모두 `style.display = "none"` 으로 숨김 처리 유지

## Acceptance Criteria
- [ ] 페이지 최초 로드 시 로비 화면이 표시된다
- [ ] "전투 종료" 기본 텍스트가 초기에 노출되지 않는다
- [ ] 게임 종료 후 결과 화면이 정상적으로 표시된다
- [ ] 재시작 버튼 클릭 후 로비로 돌아간다
