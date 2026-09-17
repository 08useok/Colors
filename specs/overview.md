# Colors (해골천) — 프로젝트 개요

## 목표

브라우저에서 실행하는 Three.js 기반 3D TPS 배틀로얄 프로토타입이다.

## 실행 구조

- 메인 게임: [index.html](../index.html) → [src/main.js](../src/main.js)
- 베타 테스트: [beta-season.html](../beta-season.html) → [src/beta-season.js](../src/beta-season.js)
- Vanilla JavaScript ES 모듈과 Three.js r165 CDN을 사용하며 별도 빌드 단계는 없다.
- 멀티플레이 코드는 [src/multiplayer.js](../src/multiplayer.js), 서버는 `server/`와 `party/`에서 관리한다.
- 실행 방법과 검증 명령은 [프로젝트 README](../README.md)를 참조한다.

## 기능별 명세

기능 설명과 수치는 담당 문서에서 관리한다. 이 개요에는 캐릭터 스탯이나 보상 수치를 중복 기재하지 않는다.

| 분야 | 담당 문서 |
|---|---|
| 계정·인증 | [접속·로그인](01-access-login.md) |
| 로비·선택·프로필 | [로비·UI](02-lobby-ui.md) |
| 전투·게임 모드·결과 | [전투·결과](03-combat-results.md) |
| 캐릭터 능력치·공격 | [캐릭터](04-characters.md) |
| 상점·보상·재화 저장 | [재화](05-currency.md) |
| 시즌·맵·멀티플레이·오디오 | [시스템](06-systems.md) |

## 시즌과 기획

- 현재 실행 대상과 저장 분리는 [시스템](06-systems.md), 시즌별 요구사항은 [전체 목차](README.md#시즌-기획)에서 확인한다.
- [앱 전환](beta-season-5-app.md)과 [로테이션 토너먼트](beta-season-8-rotation-tournament.md)는 별도 기획이다. 문서 존재를 구현 완료로 간주하지 않는다.
- 과거 출시 수치와 변경 전 동작은 해당 시즌 및 Git 이력에 보존한다.
