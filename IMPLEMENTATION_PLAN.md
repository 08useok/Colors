# Implementation Plan — Skull Creek (해골천)

> Last updated: 2026-07-06
> Status: In Development — Beta Season 1 transition
> Source of truth: `specs/*` vs `src/main.js` (monolithic, ~7538 lines)
> Entry point: `index.html` → `src/main.js?v=1.4.9`

---

## Completed Features

The following specs are fully implemented in `src/main.js` and `index.html`:

- [x] Lobby screen (registration, daily login gate, game launch) — `specs/lobby.md`
- [x] Character select (Red, Green, Blue, Orange, Yellow, Cyan, Purple, Pink — 8 selectable) — `specs/character-select.md`
- [x] Combat: natural regen (3s player / 5s bot, 25%/tick) + auto-reload on `ammo < maxAmmo` — `specs/combat-regen-autoreload.md`
- [x] Green boomerang (60° spread, 4-shot sequential 0.08s, fan indicator) — `specs/green-boomerang.md`
- [x] Per-character stats + win streak system (charStats, streakBonus, 100-win milestone) — `specs/character-stats.md`
- [x] Daily ID verification (5-attempt lockout, date-based reset, account recovery) — `specs/daily-login.md`
- [x] Trophy ranking (12 - rank*2, floor 0, deathOrder tracking) — `specs/trophy-ranking.md`
- [x] Battle map rotation (3 maps, random per battle) — `specs/map-rotation.md`
- [x] Mouse aim (raycaster to y=0 plane, independent from WASD) — `specs/mouse-aim.md`
- [x] Initial render bug fix (CDN swap, overlay display fix) — `specs/fix-initial-render.md`
- [x] Orange character (bomb + 5-way splash, aim indicator, bot AI) — `specs/alpha-season-2-v13.md`
- [x] Yellow character (electric projectile, 40% slow debuff 1.5s) — `specs/yellow-character.md`
- [x] Cyan character (6-pill spreadLine projectiles) — `specs/cyan-character.md`
- [x] Purple character (poison needle + vial, 760 DPS × 4s DoT) — confirmed in CHARACTERS
- [x] Pink character (heal circle + melee, 11500 HP, 1.4x speed) — confirmed in CHARACTERS
- [x] Chop Wood 3v3 mode (team trees, axe grades, bot team AI) — `specs/chop-wood.md`
- [x] Shop — coin-based character level up (8 chars, max Lv.6) — confirmed in main.js
- [x] Shop — skins tab (buy/equip/unequip flow, 1 skin: `alpha_red`) — confirmed in main.js
- [x] Shop — cosmetics tab (emote/bg/badge subtabs) — `specs/cosmetics-shop.md`
- [x] Emotes (5 emotes, Q key trigger, 5s cooldown, sprite bubble) — `specs/cosmetics-emote.md`
- [x] Profile backgrounds (6 backgrounds, CSS-based) — `specs/cosmetics-profile.md`
- [x] Profile badges (8 badges, emoji prepend to nickname) — `specs/cosmetics-profile.md`
- [x] Season system (alpha1–alpha4, per-season stats tracking) — confirmed in main.js
- [x] Leaderboard & stats UI — `specs/leaderboard-stats-ui.md`
- [x] v1.3.2 patch notes — confirmed in index.html + langs.js
- [x] Bush stealth + combat reveal system — confirmed in main.js
- [x] Bot detection range = 50 units — confirmed in main.js
- [x] Multiplayer Take Down mode (WebSocket via Railway) — `src/multiplayer.js`

---

## Priority 1 — Beta Season 1 Transition (베타 시즌 1)

Umbrella spec: `specs/beta-season-transition.md` — 2026-07-06 target date.

**Dependency chain** (implement in this order):
```
1.1 Season Constant  ←  foundation for all beta work
1.2 Orange Rebalance ←  standalone, no cross-dependencies
1.3 Rarity & Credits ←  account schema for Crimson + Gacha
1.4 Daily Gacha      ←  sole source of credits
1.5 Crimson Character ← hero tier (900 credits), needs rarity shop
1.6 Red Theme Skins  ←  beta_red_crimson needs Crimson to exist
1.7 Patch Notes      ←  last step, after all features land
```

### 1.1 Season Constant Change
- [ ] `main.js:176`: Change `CURRENT_SEASON` from `"alpha4"` to `"beta1"`
- [ ] `main.js:177-182`: Add `beta1: "베타 시즌 1"` to `SEASONS` object
- [ ] `langs.js`: Update `season` key from `"알파 시즌 4"` to `"베타 시즌 1"` (ko) / `"Alpha Season 4"` to `"Beta Season 1"` (en)
- [ ] Verify: new accounts get `seasonStats.beta1` / `seasonCharStats.beta1` initialized
- [ ] Verify: existing alpha accounts auto-create `beta1` keys on load (migration logic already exists)
- [ ] Verify: profile "시즌별 전적" shows beta1 with current-season marker (⬅)

### 1.2 Orange Rebalance — `specs/orange-rebalance.md`
- [ ] `CHARACTERS.orange.bombDamage`: 750 → 900
- [ ] `CHARACTERS.orange.bombSplashDamage`: 300 → 380
- [ ] `CHARACTERS.orange.bombSpeed`: 22 → 26
- [ ] `CHARACTERS.orange.bombSplashHitRadius`: 0.60 → 0.75
- [ ] Verify: other Orange stats unchanged (HP 5800, range 9, splashCount 5, splashSpeed 10, splashRange 4.4)
- [ ] Effective full-hit total becomes 900 + (380×5) = 2,800 (up from 2,250, +24%)

### 1.3 Character Rarity & Credit System — `specs/character-rarity-shop.md`
- [ ] Define rarity tiers: Common (red/green/blue — free), Rare (orange/yellow/cyan/purple/pink — 200 credits), Hero (crimson — 900 credits)
- [ ] Add `ownedCharacters` field to account schema (new accounts start with `["red","green","blue"]`)
- [ ] Add `credits` field to account schema (integer, starts at 0)
- [ ] Migration: accounts without `ownedCharacters` auto-receive all 8 pre-beta characters; Crimson excluded
- [ ] Lock UI: unowned characters show lock icon + price, cannot be selected, click redirects to shop
- [ ] Shop character purchase tab: check balance → deduct credits → add to `ownedCharacters` → unlock
- [ ] Bots use all 9 characters regardless of player ownership
- [ ] Add rarity/credit i18n keys to langs.js

### 1.4 Daily Gacha — `specs/daily-gacha.md`
- [ ] Add `gacha: { lastResetDate, remaining: 6 }` to account schema
- [ ] 6 pulls per day, reset at midnight (same `getTodayString()` logic)
- [ ] Reward pool: coins (50/100/200/400), credits (50/100/200/400), emotes (5), badges (7 excl. badge_none) — weighted probabilities per spec
- [ ] Duplicate emote/badge → auto-convert to coin value
- [ ] Gacha UI: overlay with result popup (icon + name + quantity), remaining pull counter
- [ ] Add gacha button to lobby UI + `#gacha-overlay` to index.html
- [ ] Add all gacha i18n keys to langs.js
- [ ] Credits obtainable ONLY through gacha — no other source

### 1.5 Crimson Character (Hero tier) — `specs/crimson-character.md`
- [ ] Add `crimson` to `CHARACTERS`: HP 9800, color `#a00000`, range 4, melee fan attack
- [ ] Implement fan-shaped 4-hit combo: 0.12s intervals, ±15°/±45° directions, damage 600/700/800/1100 (total 3200), cooldown 0.6s, reload 0.5s
- [ ] Implement ultimate "파괴의 일격": 8 gauge charges → 3000 damage in 5×5 area, destroy walls, knockback 1-2 tiles
- [ ] Add gauge HUD element (0-8 progress bar, activate at 8)
- [ ] Gauge persists through death
- [ ] Crimson movement speed: fastest in game (above Pink's 1.4x) — determine concrete multiplier
- [ ] Add `crimson` to `ROTATION_CHAR_ORDER` and bot type pools
- [ ] Add crimson bot AI (aggressive melee approach, bot uses ultimate)
- [ ] Add `crimson` to `charStats` in `createAccount()` + migration in `loadAccount()`
- [ ] Add `crimson` to `seasonCharStats` initialization
- [ ] Add `crimson` to `charLevels` initialization + migration
- [ ] Add `crimson` to `CHAR_STAT_BARS`
- [ ] Add Crimson button to `index.html` (`#char-select-row` + `#color-buttons`)
- [ ] Add Crimson row to matchup table in HTML
- [ ] Add crimson attack animation (fan/sweep melee)
- [ ] Add all crimson i18n keys to `langs.js` (crimsonDesc, crimsonDetails, attack name, ultimate name)
- [ ] Update `charCount` in langs.js: "8종" → "9종"

### 1.6 Red Theme Skins — `specs/skin-red-theme.md`
- [ ] Add `rarity` field to existing `alpha_red` skin: `rarity: "rare"`
- [ ] Add 3 new skins to `SKINS`:
  - `beta_red_orange` (Orange, "Crimson Orange", rare, 1000 coins)
  - `beta_red_crimson` (Crimson, "Blood Crimson", epic, 2500 coins)
  - `beta_red_red` (Red, "Scarlet Red", legendary, 5000 coins)
- [ ] Rarity badge displayed on shop skin cards
- [ ] Add skin name/description i18n keys to langs.js (ko + en)
- [ ] Skins purchased with coins (no credits needed, no character ownership gate)

### 1.7 Beta Season Patch Notes
- [ ] Add beta season 1 patch notes div to `index.html`
- [ ] Add corresponding i18n keys to langs.js
- [ ] Bump version in `index.html` script tag (currently v1.4.9)

---

## Priority 2 — Bugs & Missing Data (current code gaps)

### 2.1 `CHAR_STAT_BARS` Missing Purple & Pink — ✅ Fixed
- [x] `main.js:757-765`: Added `purple: { hp: 6, atk: 8, range: 5, speed: 6 }` and `pink: { hp: 10, atk: 7, range: 3, speed: 10 }`
- [ ] Add: `crimson: { ... }` (after Crimson is implemented, tracked under 1.5)

### 2.2 `charLevels` Missing Purple & Pink — ✅ Fixed
- [x] `createAccount()`: `charLevels` now includes `purple: 1, pink: 1`
- [x] Migration guard: added `purple`/`pink` backfill checks alongside existing yellow/cyan checks
- [ ] Add `crimson: 1` after Crimson is implemented (tracked under 1.5)

### 2.3 `cosmetics` Not Initialized in `createAccount()` — ✅ Fixed
- [x] `createAccount()` now sets `cosmetics` field directly (same shape as the `loadAccount()` migration default) — no longer relies on next-load migration

### 2.4 ~~Yellow Animation Fallthrough~~ — Not a bug (stale plan finding)
- Verified `main.js:5819`: Yellow is already grouped with Orange/Cyan in a dedicated windup-throw animation branch, does NOT fall through to Red's punch. No fix needed.

### 2.5 `alpha_red` Skin Missing `rarity` Field
- [ ] `main.js` SKINS definition (line 213): `alpha_red` has no `rarity` field — spec says add `rarity: "rare"` retroactively
- [ ] (Will be addressed as part of 1.6)

### 2.6 Version String Inconsistencies in `index.html` — ✅ Fixed
- [x] `index.html`: Lobby version badge `v1.4.2` → `v1.4.9`
- [x] `index.html`: CSS cache buster `styles.css?v=1.4.2` → `?v=1.4.9`
- [ ] Both should be updated whenever version bumps (ongoing process note, not a one-time fix)

### 2.7 `showDamageTakenIndicator` Unreachable — ✅ Fixed (wired up)
- [x] Confirmed the element/CSS animation (`damagePopDown`) were purpose-built but never called — wired into `applyDamage()` alongside the existing `createDamagePopup()` 3D popup for the player-damaged case

---

## Priority 3 — Spec Maintenance

### 3.1 Update `specs/overview.md`
- [x] Now says 9 characters (correct after Crimson) — already updated
- [ ] Verify all 18 features listed match actual implementation state after Beta Season 1

### 3.2 Update `specs/character-select.md`
- [x] Already updated to include Crimson + rarity tiers (9 characters)
- [ ] Verify lock/unlock mechanics match final implementation after 1.3 is done

### 3.3 Patch Notes for Recent Versions
- [ ] Verify all versions through v1.4.9 have patch notes (currently present in index.html)
- [ ] After Beta Season 1 work: add new version patch notes

---

## Priority 4 — Dead Code & Vestigial Cleanup — ✅ Done (2026-07-07)

### 4.1 Dead Modules (not imported by main.js) — ✅ Deleted
Decision: delete (not sync) — confirmed zero runtime imports anywhere outside the modules' own mutual references, and the project is committed to a single-file `main.js` architecture (no bundler).
- [x] Deleted `src/character.js`
- [x] Deleted `src/hud.js`
- [x] Deleted `src/animation.js`
- [x] Deleted `src/LANGS/dom-core.js`

### 4.2 Vestigial State Fields — ✅ Removed
- [x] `state.pointerLocked`: removed from initial state (was declared, never set `true`, never read)
- [x] `state.mouse.yaw` / `state.mouse.pitch`: removed from all 4 reset locations (never declared in initial `state.mouse`, never read)
- [x] `state.winner`: removed from initial state and all 4 reset locations (never read after being set)

### 4.3 Stale Comments — ✅ Moot
- Resolved automatically — the file (`src/LANGS/dom-core.js`) containing the stale comment was deleted in 4.1

---

## Architecture Notes

- **Authoritative runtime**: `src/main.js` (~7538 lines, monolithic)
- **Translations**: `src/LANGS/langs.js` (flat key-value, ko + en — imported by main.js)
- **Multiplayer**: `src/multiplayer.js` (WebSocket client for Take Down mode — imported by main.js)
- **Entry point**: `index.html` → `src/main.js?v=1.4.9`
- **No `src/lib/`** — no shared utility library
- **No bundler** — vanilla ES modules, Three.js r165 via CDN
