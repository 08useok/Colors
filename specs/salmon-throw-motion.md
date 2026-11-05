# 살몬 낚시찌 투척 모션 — 2026-10-22

일반적인 팔 흔들기 대신 오른손으로 허리 쪽의 낚시찌를 꺼내고, 팔을 들어 준비한 다음 앞으로 던지고 자세를 복구하는 전용 모션을 적용했다. 기존 GLB의 팔·팔뚝·손 뼈대를 사용하며 대기·걷기 애니메이션 위에 적용한다.

- 전체 동작 0.84초, 낚시찌를 손에서 놓는 시점 0.36초.
- 준비 중에는 실제 손 뼈대에 연결한 찌를 표시하고 비행용 찌는 숨긴다. 0.36초에 손의 찌를 숨기고 투척물의 비행을 시작한다.
- 일반 공격과 궁극기 투척에 같은 준비 시간을 적용한다. 착지·장치 설치 시간도 이 준비 시간을 포함한다. 발사 입력이 들어오면 탄약·궁 포인트는 기존처럼 소비한다.
- 회수 입력에서는 새 투척 모션을 시작하지 않는다.
- 플레이어와 살몬 AI 모두 전용 모션을 사용하며 종료 후 원래 자세를 복구한다. 타격 판정·피해량·이동 속도는 바꾸지 않았다.

검증:

- `node tools/test-salmon-throw-browser.mjs`: 실제 GLB의 손 위치 변화, 손 소품 표시/제거, 0.36초 발사 동기화, 팔 뼈대 변화·복귀, AI 모션 검사. 페이지 오류 0건.
- `node tools/test-salmon-combat.mjs`, `node tools/test-beta6-combat.mjs`, `node tools/test-salmon-combat-browser.mjs` 통과.
- [단계별 결과](salmon-throw-motion.json) · [꺼내기](salmon-throw-retrieve.png) · [준비](salmon-throw-ready.png) · [투척](salmon-throw-release.png) · [복귀](salmon-throw-rest.png)
