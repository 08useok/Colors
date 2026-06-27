# 마우스 조준 시스템

## 현재 동작
- `player.yaw` = WASD 이동 방향(`atan2`) — 이동 안 하면 조준 방향 고정

## 목표 동작
- `player.yaw` = 마우스 커서의 월드 좌표 방향
- 이동 방향과 독립적으로 조준 가능
- 제자리에서도 마우스만 움직이면 조준 방향 변경

## 구현 방식
1. `mousemove` 이벤트 → `state.mouse.screenX/Y` 갱신
2. `updatePlayerControls`에서 `Raycaster`로 마우스 → y=0 평면 교점 계산
3. 교점과 플레이어 위치 차이 → `player.yaw` 결정
4. 이동 벡터(tempVec3)는 WASD 기반 유지, yaw만 마우스 기반 분리

## 모바일 폴백
- 터치 환경: 조이스틱 이동 방향 = 조준 방향 (기존 동작 유지)

## 영향 범위
- `updatePlayerControls` — yaw 결정 로직 교체
- `attackAimIndicator` — `player.yaw` 그대로 사용하므로 자동 반영
- `resolveAttack` — `attacker.yaw` 그대로 사용하므로 자동 반영

## Acceptance Criteria
- [ ] 마우스 커서 방향으로 조준 인디케이터가 향한다
- [ ] 제자리에서 마우스만 움직여도 조준 방향이 바뀐다
- [ ] 이동 방향과 조준 방향이 독립적으로 동작한다
- [ ] 공격이 마우스가 향한 방향으로 판정된다
