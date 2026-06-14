# 자연 회복 + 자동 재장전

## 자연 회복 (Natural Health Regen)

### 동작 조건
- 마지막 전투 행동(공격 또는 피격)으로부터 **3초** 경과 시, **최대 체력의 25%를 즉시(한 번에) 회복**
- 이후에도 전투 없이 체력이 가득 차지 않았다면 **1초마다 추가로 25%씩** 회복 (틱 단위 즉시 회복, 점진적 증가 아님)
- 체력 상한: `maxHealth` 초과 불가

### 전투 행동 정의 (lastCombatTime 갱신 조건)
| 행동 | 해당 fighter |
|---|---|
| 피격 | target |
| 공격 실행 (beginAttack / beginBoomerangAttack) | attacker |

### 구현 포인트
- `makeFighter()`: `lastCombatTime: -999` 초기화 (게임 시작 즉시 5초 만족)
- `applyDamage()`: `target.lastCombatTime = state.gameTime`
- `beginAttack()` / `beginBoomerangAttack()`: `fighter.lastCombatTime = state.gameTime`
- `updateNaturalRegen(dt)` 신규 함수 → `animate()` 루프에서 호출

```js
function updateNaturalRegen(dt) {
  for (const fighter of state.players) {
    if (!fighter.isPlayer || fighter.dead || fighter.health >= fighter.maxHealth) continue;
    if (state.gameTime - fighter.lastCombatTime >= 3 && state.gameTime >= fighter.nextRegenAt) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.maxHealth * 0.25);
      fighter.nextRegenAt = state.gameTime + 1;
    }
  }
}
```

- `nextRegenAt`: 다음 회복 틱이 가능한 시각. 회복 직후 `gameTime + 1`로 설정해 1초 간격으로 추가 회복 허용
- 전투 행동(피격/공격) 시 `lastCombatTime` 갱신으로 3초 조건이 다시 false가 되어 회복 사이클이 중단됨

### 적용 대상
- 플레이어만 (봇은 자연회복 없음)

---

## 자동 재장전 (Auto-Reload After Attack)

### 동작 조건
- 공격 후 `ammo < maxAmmo` 이면 즉시 `pendingAutoReload = true`
- 재장전 속도: 기존 `reloadDuration = 0.5s` 유지
- 탄약 가득 차면 재장전 시작 안 함

### Current Behavior
- `ammo <= 0` 일 때만 `pendingAutoReload = true`

### Expected Behavior
- 공격할 때마다 `ammo < maxAmmo` 이면 `pendingAutoReload = true`
- `updateReloads()` 조건도 동일하게 `ammo < maxAmmo` 로 변경

### 관련 변경 위치
| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| `beginAttack()` | `if (ammo <= 0)` | `if (ammo < maxAmmo)` |
| `beginBoomerangAttack()` | `if (ammo <= 0)` | `if (ammo < maxAmmo)` |
| `updateReloads()` | `ammo <= 0` 체크 | `ammo < maxAmmo` 체크 |
| 봇 `updateBot()` | `ammo <= 0` 체크 | `ammo < maxAmmo` 체크 |

---

## Regression Guard
- 기존 수치 변경 없음: `reloadDuration 0.5s`, `maxAmmo 3`, `attackCooldown 0.62s`
- Red / Green 캐릭터 공격 판정 변경 없음
- R 키 수동 재장전 여전히 동작
- 자기장 데미지는 lastCombatTime 갱신 안 함 (자기장 밖에서도 회복 가능)

## Acceptance Criteria
- [ ] 3초간 피격/공격 없으면 최대 체력의 25%가 즉시 한 번에 회복된다
- [ ] 이후에도 전투가 없고 체력이 가득 차지 않았다면 1초마다 25%씩 추가로 즉시 회복된다
- [ ] 회복 중 공격하거나 피격 시 회복 사이클이 즉시 중단된다
- [ ] 회복은 최대 체력을 초과하지 않는다
- [ ] 자연회복은 플레이어에게만 적용된다 (봇은 회복 안 함)
- [ ] 공격 후 ammo < maxAmmo 이면 자동으로 재장전이 시작된다
- [ ] 재장전 속도는 기존 0.5s와 동일하다
- [ ] ammo가 가득 찬 상태에서 공격해도 불필요한 재장전이 시작되지 않는다
