# 6. 시스템

## 범위

- 시즌과 버전
- 맵 생성·선택·로테이션
- 벽, 수풀, 호수와 충돌 데이터
- AI 봇과 멀티플레이
- 오디오와 다국어
- 저장, 정리와 검증 절차

## 시즌

- 기본 게임: 알파 시즌 4, `v1.4.14`
- 베타 시즌: `beta-season.html`에서 분리 테스트
- 정식 전환 전까지 `CURRENT_SEASON`은 `alpha4`를 유지한다.

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

