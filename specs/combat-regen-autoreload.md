# 자연 회복 + 자동 재장전

## 자연 회복 (Natural Health Regen)

### 동작 조건
- 마지막 전투 행동(공격 또는 피격)으로부터 **5초** 경과 시 회복 시작
- 회복 속도: **초당 최대 체력의 10%** (매 프레임 `maxHealth * 0.1 * dt`)
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
    if (fighter.dead || fighter.health >= fighter.maxHealth) continue;
    if (state.gameTime - fighter.lastCombatTime >= 5) {
      fighter.health = Math.min(fighter.maxHealth, fighter.health + fighter.maxHealth * 0.1 * dt);
    }
  }
}
```

### 적용 대상
- 플레이어 + 봇 전원

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
- [ ] 5초간 피격/공격 없으면 체력이 자동으로 회복된다
- [ ] 회복 중 공격하거나 피격 시 회복이 즉시 중단된다
- [ ] 회복은 최대 체력을 초과하지 않는다
- [ ] 봇도 자연 회복이 적용된다
- [ ] 공격 후 ammo < maxAmmo 이면 자동으로 재장전이 시작된다
- [ ] 재장전 속도는 기존 0.5s와 동일하다
- [ ] ammo가 가득 찬 상태에서 공격해도 불필요한 재장전이 시작되지 않는다
