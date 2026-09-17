# 6. 시스템

## 범위

- 시즌과 버전
- 맵 생성·선택·로테이션
- 벽, 수풀, 호수와 충돌 데이터
- AI 봇과 멀티플레이
- 오디오와 다국어
- 저장, 정리와 검증 절차

## 시즌

- 2026-09-15 로컬 코드 기준 메인은 베타 시즌 5다. `src/main.js`의 `CURRENT_SEASON`과 `CURRENT_VERSION`이 날짜별 활성 시즌·버전을 결정한다.
- `beta-season.html`은 `?test=beta5`, `beta6`, `beta7`, `beta8`을 지원하며 생략하거나 지원하지 않는 값을 전달하면 `beta6`으로 열린다.
- 각 테스트 시즌은 별도 저장 키를 사용한다. [접속·로그인](01-access-login.md#저장-키)을 참조한다.
- 시즌별 변경 요구사항은 [시즌 기획 목차](README.md#시즌-기획)에서 관리한다.

## 맵

- `MAP_POOL`: 쇼다운 맵 설계도 목록
- `wallSpecs`: 벽 배치
- `bushSpecs`: 수풀 배치
- `createMap()`: 선택된 설계도로 맵 생성
- `clearBattleMap()`: 전투 종료 후 맵과 충돌 데이터 정리

## 기준 코드

- 시스템과 맵: `src/main.js`
- 다국어: `src/LANGS/`
- 멀티플레이: `src/multiplayer.js`, `server/`, `party/`
- 베타 시스템: `src/beta-season.js`

## 상세 문서

- [`beta-season-transition.md`](beta-season-transition.md)
- [`alpha-season-2-v13.md`](alpha-season-2-v13.md)
- [`map-rotation.md`](map-rotation.md)
- [`sound-effects.md`](sound-effects.md)
- [`audio-glossary.md`](audio-glossary.md)
- [`ingame-glossary.md`](ingame-glossary.md)
- [`overview.md`](overview.md)
