# 3. 전투·결과

## 범위

- 이동, 조준, 일반 공격과 궁극기
- 투사체, 피해, 회복, 독과 감속
- 수풀 은신, 벽 충돌과 넉백
- 탄약, 자동 재장전과 자연 회복
- 게임 모드별 승리·패배 판정
- 최종 순위, 전적, 트로피와 결과 화면

## 공통 전투 규칙

- `WASD`로 이동한다.
- 맵 클릭은 수동 조준, 공격 버튼은 자동 조준을 사용한다.
- 일반 공격은 기본적으로 적을 밀쳐내지 않는다.
- 넉백은 시안 궁극기처럼 명시된 공격에만 적용한다.
- 결과 확정 후 `clearBattleMap()`으로 전투 맵 객체를 정리한다.
- 승리 기준은 전적 코드의 `rank <= 4`와 동일하다.
- 베타 시즌에는 결과 확정 후 캐릭터별 승리·패배 포즈를 먼저 보여주고, 화면 클릭 후 결과 행동 버튼을 표시한다.
- 결과용 캐릭터 표현이 준비되기 전에 `clearBattleMap()`이 캐릭터를 제거하지 않도록 결과 포즈와 맵 정리 순서를 보장한다.

## 게임 모드

- 쇼다운
- Chop Wood
- 테이크다운
- 훈련장

## 기준 코드

- 전투 상태: `src/main.js`의 `state`
- 투사체: `state.projectiles`
- 효과: `state.effects`, `updateEffects(dt)`
- 결과 기록: `recordGameResult(rank, mode)`
- 베타 전투: `src/beta-season.js`

## 상세 문서

- [`mouse-aim.md`](mouse-aim.md)
- [`combat-regen-autoreload.md`](combat-regen-autoreload.md)
- [`chop-wood.md`](chop-wood.md)
- [`character-stats.md`](character-stats.md)
- [`trophy-ranking.md`](trophy-ranking.md)
- [`beta-result-poses.md`](beta-result-poses.md)
