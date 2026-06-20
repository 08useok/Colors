# Implementation Plan — v1.3 Alpha Season 2

> Status: In Development
> Target Release: 2026-06-20
> Focus: Blue balance retuning + Orange character implementation

---

## 🔵 Phase 1: Blue Balance Adjustment

### Task 1.1: Update Reload Speed
- [ ] Change `CHARACTERS.blue.reloadDuration` from **0.1** to **0.35**
- [ ] Update internal references if any
- [ ] Verify reload bar visual updates correctly

**Impact**: Reduces Blue's continuous DPS, increases risk for missed shots

---

## 🟠 Phase 2: Orange Character Implementation

### Task 2.1: CHARACTERS Config
- [ ] Add Orange entry to CHARACTERS object
  - `hp`: ~6500 (medium-tanky)
  - `attackCooldown`: ~0.7s
  - `reloadDuration`: N/A (auto-reload bomb)
  - `moveSpeedMultiplier`: 1.0 (normal)
  - `boomerangRange`: N/A
  - `bulletRange`: ~6.5 (between Green and Blue)
  - `weaponType`: "bomb" (custom)

### Task 2.2: Bomb Projectile System
- [ ] Create bomb projectile type (separate from bullet/boomerang)
- [ ] Implement properties:
  - Position, velocity, lifetime
  - maxRange: ~6.5 units
  - maxLifetime: calculated from speed
  - visual: orange mesh/sphere
  - damage: base 1000 (per split)

### Task 2.3: 5-Way Explosion Logic
- [ ] Detonation trigger: 
  - On collision with player OR
  - On maxRange reached OR
  - On lifetime expiry
- [ ] Spread pattern: 5 directions (cross pattern or radial)
  - Direction 1: forward
  - Directions 2-5: ±45° and perpendicular
- [ ] Each split is separate projectile (continues for ~2-3 units)
- [ ] Collision detection: Spread can hit targets

### Task 2.4: Damage Calculation
- [ ] Base damage per split: 1000
- [ ] Direct hit (all 5 on single target): 5000
- [ ] Area damage: Check overlap of split paths
- [ ] No falloff initially (can adjust if needed)

### Task 2.5: VFX & Audio
- [ ] Bomb launch effect (glow, particle trail)
- [ ] Explosion effect (5-way burst with color)
- [ ] Impact sounds (launch, explosion, hit)
- [ ] Color scheme: Orange (#ff9800) with gold accents

---

## 🎮 Phase 3: UI & Localization

### Task 3.1: Enable Orange Character
- [ ] Remove "locked" class from Orange button in index.html
- [ ] Change badge text from "출시예정" to "선택됨" (dynamic)
- [ ] Update char-details to show weapon info

### Task 3.2: Patch Notes
- [ ] Add v1.3 section in HTML
- [ ] Bullet 1: Blue reload speed adjustment
- [ ] Bullet 2: Orange character introduction
- [ ] Bullet 3: (optional) game philosophy note

### Task 3.3: Localization (i18n)
- [ ] LANGS.ko:
  - `pv13a`: "블루 재장전 속도 조정"
  - `pv13b`: "오렌지 캐릭터 추가 (폭탄형 딜러)"
  - Orange skill name & description
- [ ] LANGS.en: parallel translations

---

## ✅ Phase 4: Testing & Validation

### Task 4.1: Local HTTP Testing
- [ ] Start server: `py -m http.server 4173`
- [ ] Verify character select (Orange selectable)
- [ ] Verify Blue reload timing (slower, visual bar updates)
- [ ] Play battle with Orange:
  - [ ] Bomb launches from hand
  - [ ] Travels correctly to max range
  - [ ] Detonates on hit/range
  - [ ] 5 spreads visible
  - [ ] Damage numbers appear
  - [ ] Hit detection works

### Task 4.2: Bug Checks
- [ ] No console errors
- [ ] Training mode still works
- [ ] All 4 characters play-testable
- [ ] Stats display correct
- [ ] Patch notes render correctly

### Task 4.3: Deployment
- [ ] `git add -A`
- [ ] `git commit -m "v1.3 Alpha Season 2 — Blue reload tuning + Orange character"`
- [ ] `git push origin master`
- [ ] Update index.html version query: `?v=1.3`

---

## 📊 Current Status: READY TO IMPLEMENT
