# 살몬 구현 이어 작업 — 2026-10-22

기존 작성 중이던 살몬 전투 모듈을 베타 시즌 8 연습·대전 루프에 연결했다.

누락된 연습 모드 함수와 수동 조준 거리를 추가했다. 포획 높이를 플레이어·봇 모델에 적용하고 착지 시 복구한다. 대전 부활 시 살몬 궁 포인트를 보존한다. 사망한 설치자의 장치는 유지하고 모드 정리 시 전투 데이터·시각 효과를 제거한다. 설치자는 자기 장치를 공격할 수 없고 장치 피해로 궁 포인트를 얻지 않는다.

검증 통과:

- `npm.cmd run check` 및 새 살몬 모듈 구문 검사
- `node tools/test-salmon-combat.mjs`
- `node tools/test-beta6-combat.mjs`
- `node tools/test-beta8-ultimate-balance.mjs`
- `node tools/test-salmon-combat-browser.mjs` (로컬 Edge, 연습 및 KNOCKOUT 시작, 페이지 오류 0)

브라우저 검증은 테스트 서버에서만 내부 접근 코드를 덧붙인다. 제품 소스에 디버그 전역은 추가하지 않는다.

전체 맵·캐릭터 이동기 조합과 온라인 동기화까지 완료한 검증은 아니다. 자세한 확인 범위는 [캐릭터 문서](characters/salmon.md)를 참조한다.
