# CLAUDE.md — Colors

빌드·실행·구조·작업 규칙은 AGENTS.md에 있다:

@AGENTS.md

## 소통
- 모든 답변을 한국어로 한다. 진행 메시지, 확인 질문, wrap_up 요약, 버튼 라벨까지 전부.
- 코드 주석과 커밋 메시지는 기존 관례(한국어 요약 + 영어 식별자)를 따른다.

## 배포
- master에 푸시하면 GitHub Pages(https://08useok.github.io/Colors/)에 바로 공개된다.
  그래서 커밋은 로컬에만 하고, 사용자가 "푸시"라고 말할 때만 push한다.
- 베타 작업은 사용자가 localhost에서 직접 확인한다. 작업 후 여는 방법을 알려준다
  (`py -m http.server 4173` → http://localhost:4173/beta-season.html).
- 워커(`party/server.js`)를 바꿨으면 사용자에게 배포가 필요하다고 알린다.

## 패치 노트
- 게임 동작·밸런스·시스템이 바뀌면 같은 커밋에 패치 노트를 바로 반영한다. 요청을 기다리지 않는다.
- 플레이어용 노트(`index.html`, `src/LANGS/archive-text.js`, `src/config/beta9-patch-notes.js`)에는
  꼬리잡기, 240-0, 시뮬레이션 승률 같은 내부 검증을 쓰지 않는다. 바뀐 내용과 실제 기록만 적는다.
  내부 검증 결과는 채팅, 커밋 메시지, `specs/patch-notes.md`(개발 기록)에만 남긴다.
- 버그 수정 문구는 증상 중심으로 쓴다: "~하던 문제를 수정했습니다".
- 버전 하나에 성격이 다른 변경(밸런스와 버그 수정)이 섞이면 버전을 나눈다.

## 밸런스
- 수치는 깔끔하게 맞춘다: 체력·피해는 100 단위, 사거리는 0.5타일 단위.
- 메인 전용 수치는 `src/main.js`의 beta8 블록에 두고, 베타 수치(`src/config/beta*-balance.js`)는 건드리지 않는다.
- 새 캐릭터는 반드시 꼬리잡기(`src/config/beta8-counter-targets.js`)에 넣는다.
  - 검증 도구: `tools/verify-beta8-counter-cycle.mjs`
  - 1:1 대결 프로필: 거리 6 × 조준 오차 2 × 시드 10 × 좌우 반전 = 240판
  - X → 새 캐릭터 → Y 삽입 위치 후보를 제안하고 사용자가 고르게 한다.
  - 두 연결이 모두 240-0이 될 때까지 조정한 뒤 전체 검증을 다시 돌린다.
  - 변신과 가젯은 꼬리잡기에서 제외한다(`transforms: false, gadgets: false`).

## 테스트와 확인
- 사용자 미커밋 수정이 섞인 작업 폴더 대신 인덱스를 별도 폴더로 내보내(checkout-index)
  그 폴더를 정적 서버로 띄워 확인한다.
  `.claude/launch.json`을 임시로 바꿨으면 `git checkout -- .claude/launch.json`으로 되돌린다.
- 실제 플레이 테스트는 브라우저 창이 보여야 한다(숨겨지면 게임이 멈춤). 먼저 창을 띄워 달라고 한다.
- 디버그용 `window.__debug` / `window.__play` 훅은 커밋 전에 지운다.
- 파일을 쓰기 위해 열기 전에 새 내용을 먼저 다 만들어 둔다(중간에 실패하면 파일이 비지 않게).
