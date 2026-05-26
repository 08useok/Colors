# 그린 부메랑 공격 시스템

## 공격 사양
- 투사체 수: 4개
- 부채꼴 각도: -22.5°, -7.5°, +7.5°, +22.5° (조준 yaw 기준)
- 투사체 속도: 16 units/s
- 최대 사거리: 5 units
- 근거리 데미지 (0 ~ 3.5타일): 800
- 원거리 데미지 (3.5 ~ 5타일): 560 (30% 감소)
- 탄약 소모: 공격 1회당 1 (최대 3발, Red와 동일 시스템)

## 투사체 동작
1. `beginBoomerangAttack` 호출 → 4개 투사체 `state.projectiles`에 추가
2. `updateProjectiles`에서 매 프레임 이동
3. 경로상 첫 번째 적 충돌 시 데미지 적용 후 소멸
4. 최대 사거리 도달 시 소멸
5. 벽/수풀 관통 (프로토타입 단계)

## 비주얼
- 작은 초록 토러스 형태 (`TorusGeometry`)
- 비행 중 회전 애니메이션

## 영향 범위
- `beginAttack` — 캐릭터 타입 분기 추가
- `updateBot` — 공격 사거리를 `getAttackRange(fighter)` 로 추상화
- `state` — `projectiles: []` 추가
- `resetGame` — 투사체 정리 추가
- `animate` — `updateProjectiles(dt)` 추가

## Acceptance Criteria
- [ ] 클릭 시 부메랑 4개가 부채꼴로 날아간다
- [ ] 각 부메랑이 적에 맞으면 800 데미지를 준다
- [ ] 3.5타일 이상 거리 적에게는 560 데미지가 적용된다
- [ ] 5타일 이상 날아가면 소멸한다
- [ ] AI Green 봇도 부메랑 공격을 사용한다
