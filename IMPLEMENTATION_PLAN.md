# Implementation Plan — Skull Creek (해골천)

> Last updated: 2026-06-21
> Status: In Development
> Source of truth: `specs/*` vs `src/main.js` (monolithic, ~3219 lines)

---

## Completed Features

The following specs are fully implemented in `src/main.js` and `index.html`:

- [x] Lobby screen (registration, daily login gate, game launch) — `specs/lobby.md`
- [x] Character select (Red, Green, Blue, Orange — all 4 selectable) — `specs/character-select.md`
- [x] Combat: natural regen (3s player / 5s bot, 25%/tick) + auto-reload on `ammo < maxAmmo` — `specs/combat-regen-autoreload.md`
- [x] Green boomerang (60 deg spread, 4-shot sequential 0.08s, fan indicator, 1.0s reload, 900 dmg close / 562 far) — `specs/green-boomerang.md`
- [x] Per-character stats + win streak system (charStats, streakBonus, 100-win milestone) — `specs/character-stats.md`
- [x] Daily ID verification (5-attempt lockout, date-based reset, account recovery) — `specs/daily-login.md`
- [x] Trophy ranking (12 - rank*2, floor 0, deathOrder tracking) — `specs/trophy-ranking.md`
- [x] Battle map rotation (3 maps: 해골 협곡, 마른 호수, 뼈의 미로; random per battle) — `specs/map-rotation.md`
- [x] Mouse aim (raycaster to y=0 plane, independent from WASD) — `specs/mouse-aim.md`
- [x] Initial render bug fix (CDN swap, overlay display fix) — `specs/fix-initial-render.md`
- [x] Orange character base (CHARACTERS config, beginBombAttack, spawnBombSplash, aim indicator, UI button) — `specs/alpha-season-2-v13.md` (partial)
- [x] Bot detection range = 50 units — confirmed at `main.js:2334` (`visionRange = playerDead ? 200 : 50`)

---

## Priority 1 — Bugs & Balance Alignment (spec vs code divergence)

### 1.1 Blue Reload Speed
- [x] `src/main.js` line ~155: Change `CHARACTERS.blue.reloadDuration` from **0.1** to **0.35**
- [x] Verify reload bar visual updates at the new speed (reload is incremental: one pip per `reloadDuration / maxAmmo` seconds)
- [ ] Spec ref: `specs/alpha-season-2-v13.md` says 0.3~0.4s; plan target is 0.35

### 1.2 Orange Damage/Range Tuning (review needed)
Current values in `main.js` vs spec (`specs/alpha-season-2-v13.md`):

| Property | main.js | Spec target | Delta |
|---|---|---|---|
| `bombDamage` | 1200 | ~1000 | +200 |
| `bombSplashDamage` | 450 | ~1000 | -550 |
| `bombRange` | 8 | ~6.5 | +1.5 |
| `bombSplashRange` | 2.5 | ~2-3 | OK |
| Direct hit total | 3450 | 5000 | -1550 |

- [x] Decide: are current values intentional balance patches, or spec drift?
- [x] If aligning to spec: set `bombDamage: 1000`, `bombSplashDamage: 1000`, `bombRange: 6.5`
- [x] If keeping current: update spec to reflect actual tuned values
- [x] Update `orangeAimIndicator` beam length if `bombRange` changes (beam uses `CHARACTERS.orange.bombRange` dynamically — auto-adjusts)

### 1.3 Red Balance (spec mentions planned changes)
- [x] `specs/alpha-season-2-v13.md` says Red: "slight range increase, slight damage increase" — no concrete values yet
- [x]Author concrete values or mark as deferred in spec

### 1.4 Orange HUD Label Bug
- [x] `main.js:2714-2716`: Orange attack state label falls into the `"doublePunch"` fallback — should have its own `"bombAttack"` label
- [x] Add `bombAttack` i18n key to `LANGS.ko` and `LANGS.en` in `src/LANGS/langs.js`

### 1.5 Bot `isRanged` Missing Orange (gameplay bug)
- [x] `main.js:2402`: `const isRanged = bot.characterType === "green" || bot.characterType === "blue";` — Orange is not included
- [x] Orange bots currently position like melee fighters (charge close, no backing away) despite being a bomb-thrower with range 8
- [x] Fix: add `|| bot.characterType === "orange"` to the `isRanged` check

### 1.6 `createAccount` Missing Orange in `charStats`
- [x] `main.js:242-246`: `createAccount()` initializes `charStats` with only `red`, `green`, `blue` — `orange` is missing
- [x] The `loadAccount()` migration guard at line 197 patches this at load time, so existing accounts work, but newly created accounts have an incomplete initial object until reload
- [x] Fix: add `orange: { wins: 0, games: 0 }` to the `charStats` object in `createAccount()`

### 1.7 Orange Attack Animation Gap (cosmetic)
- [x] `main.js` attack animation logic: Orange has no dedicated bomb-throw animation branch — falls through to Red's double-punch arm swing
- [x] Add an orange-specific animation (e.g., single overhead throw motion) or accept punch anim as placeholder

---

## Priority 2 — Chop Wood Game Mode (entirely new)

Spec: `specs/chop-wood.md` — fully written, zero code exists. Confirmed no `chopWood`/`chop_wood`/`CHOP`/`team` references in `main.js`.

### 2.1 State & Data Structures
- [ ] Add to `state`: `chopWoodMode`, `teams`, `playerTeam`
- [ ] Add to fighter: `team`, `axeLevel`, `isChopping`, `chopTimer`
- [ ] Axe grade table (10 tiers: Wooden=1, Stone=2, Iron=3, Gold=5, Diamond=6, Emerald=7, Sapphire=8, Ruby=9, Amethyst=10, Rainbow=12)

### 2.2 Map
- [ ] `createChopWoodMap()`: 60x30 arena, two trees at (-25,0) and (25,0), team spawns at (±28, -8 to +8)
- [ ] Tree mesh (3D object with HP=100, not damageable by projectiles)
- [ ] Central walls/bushes for engagement

### 2.3 Core Mechanics
- [ ] Auto-chop: within 3 tiles of enemy tree, chop every 2s, damage = axe grade value
- [ ] Kill reward: axe upgrades +1 grade + bonus absorption from victim's axe tier
- [ ] Death: axe resets to Wooden, 5s respawn at team spawn
- [ ] Win condition: enemy tree HP = 0
- [ ] No zone/storm in Chop Wood mode

### 2.4 Bot AI for Chop Wood
- [ ] Bots need team-aware targeting (attack enemies, ignore teammates)
- [ ] Bots should path toward enemy tree when safe, retreat/fight when engaged

### 2.5 HUD & UI
- [ ] Lobby button: "찹 우드" (beside Start Battle / Training)
- [ ] In-game HUD: team tree HP bars (top left/right), axe grade display (bottom), "벌목 중..." progress bar
- [ ] Per-player axe grade icon above head
- [ ] Result screen: win/loss + personal stats (kills, chop damage, best axe grade)

### 2.6 Localization
- [ ] Add all Chop Wood strings to `LANGS.ko` and `LANGS.en` in `src/LANGS/langs.js`
- [ ] Add Chop Wood button label and HTML elements to `index.html`

---

## Priority 3 — Patch Notes, Versioning & Spec Maintenance

### 3.1 Missing v1.3.2 Patch Notes
- [ ] Add v1.3.2 patch-entry div to `index.html` (git log: "balance: v1.3.2 밸런스 패치")
- [ ] Add corresponding `pv132x` keys to `LANGS.ko` and `LANGS.en` in `src/LANGS/langs.js`

### 3.2 Future Patch Notes
- [ ] After Blue reload fix: add v1.3.3 (or next version) patch notes
- [ ] After Chop Wood: add patch notes for the new game mode

### 3.3 Update `specs/overview.md` (outdated)
- [ ] Currently says "캐릭터 2종 (Red / Green)" — should be 4 (Red, Green, Blue, Orange)
- [ ] Currently says "AI 봇 9명 (Red/Green 랜덤 배정)" — bots now use all 4 character types (`main.js:1384`)
- [ ] Update to reflect current state (4 characters, 3 maps, Orange bomb attack)

---

## Priority 4 — Dead Code Cleanup

`main.js` is a ~3219-line monolith. Nine extracted modules exist but are **NOT imported by main.js** — they are dead code from an incomplete refactor. Only `LANGS` from `langs.js` is actually imported.

### 4.1 Divergent Dead Modules (sync or delete)

| Module | Key Divergence from main.js |
|---|---|
| `character.js` | Blue reload 0.35 vs 0.1; Blue cooldown 0.25 vs 0.3; Red moveSpeed 1.1375 vs 1.18; Orange reload 0.0 vs 1.0; Orange bombDamage 1000 vs 1200; Orange bombRange 6.5 vs 8; missing bombSplash* fields |
| `account.js` | Missing `charStats.orange` migration guard; `createAccount()` takes `currentLang` param (main.js uses closure); references `DOM` object and `G.state` (would NPE) |
| `combat.js` | Orange falls through to Red punch logic — no `beginBombAttack()` implementation; `getAttackRange()` gives orange punch range instead of bombRange; hardcoded Korean `사망` string instead of i18n |
| `hud.js` | Orange falls through to `doublePunch` label (mirrors main.js bug at 1.4) |
| `animation.js` | Orange has no dedicated attack animation branch — falls through to Red's double-punch |
| `shared.js` | `G` object is never populated by main.js; all dependent modules would NPE. `CONST` values match except missing `turnSpeed` |
| `bot.js` | `isRanged` check missing orange (mirrors main.js bug at 1.5) |
| `map.js` | Functional duplicate of main.js map code; uses `G.scene` vs local `scene` — no content divergence |
| `zone.js` | Functional duplicate of main.js zone code; uses `G.state` vs local `state` — no content divergence |

- [ ] Decision: sync all modules to match main.js, OR delete them as dead code
- [ ] If syncing: update character.js values, add bomb attack to combat.js, add orange migration to account.js, populate G in shared.js, add orange animation to animation.js, fix isRanged in bot.js
- [ ] If deleting: remove all 9 dead modules + remove vestigial `<script type="module" src="./src/character.js">` from `index.html:329`

### 4.2 Non-Exported LANGS Files (dead code)
- [ ] `src/LANGS/ui.js`: `const UI = {...}` with no `export`. Broken ko nesting (en positioned as sibling of ko instead of inside it). Stale `orangeDesc` text differs from `langs.js`. Dead code — delete or fix+export.
- [ ] `src/LANGS/patchnotes.js`: `const PATCHNOTES = {...}` with no `export`. ko has `system:` wrapper but en does not (asymmetric nesting). ko has `pv11`/`pv12` but en has `pv13` instead — mismatched version keys. Array format incompatible with main.js flat-key system. Dead code — delete or fix+export.

### 4.3 Wire Up Modules (large task, optional)
- [ ] Replace inline CHARACTERS in main.js with `import { CHARACTERS } from './character.js'`
- [ ] Replace inline account functions with `import { ... } from './account.js'`
- [ ] Repeat for combat, bot, hud, map, zone, animation modules
- [ ] Ensure `G` in `shared.js` is populated after Three.js init
- [ ] Remove inlined duplicates from main.js

---

## Priority 5 — Minor Issues & Vestigial Code

### 5.1 Vestigial Script Tag
- [ ] `index.html:329`: `<script type="module" src="./src/character.js">` — serves no purpose (character.js exports are not consumed). Remove.

### 5.2 `botStyle` Dead Code
- [ ] `main.js:709,1395,1429,1454`: `botStyle` field is assigned (`"aggressive"` / `"skirmisher"`) but **never read** in `updateBot()`. Either implement differentiated behavior or remove the field.

### 5.3 Vestigial State Fields
- [ ] `state.pointerLocked`: declared as `false`, never set to `true` — pointer lock was removed
- [ ] `state.mouse.yaw` / `state.mouse.pitch`: set in `resetGame()` (line 1554-1555) and `startTraining()` (line 1486-1487) but never declared in initial state object (lines 420-461), never read by any logic
- [ ] `state.winner`: set to `""` on reset (lines 1476, 1544), never updated after — the local `winner` variable in `checkEndState()` (line 2804) is not stored back to state

### 5.4 `showDamageTakenIndicator` Unreachable
- [ ] `main.js:1278-1283`: Function defined but **never called** anywhere in main.js. Either wire it into `applyDamage()` when player takes damage, or remove.

### 5.5 Stale Comments
- [ ] `src/LANGS/dom-core.js` line 1: comment says `// src/core/dom.js` — stale path from a file move

---

## Architecture Notes

- **Authoritative runtime code**: `src/main.js` (only file loaded by `index.html` via module import)
- **Authoritative translations**: `src/LANGS/langs.js` (flat key-value, ko + en, properly exported — the ONLY module main.js imports besides Three.js CDN)
- **DOM references**: `src/LANGS/dom-core.js` (centralized `DOM` object — imported by dead modules only, not by main.js)
- **Dead modules**: `shared.js`, `character.js`, `account.js`, `combat.js`, `bot.js`, `hud.js`, `map.js`, `zone.js`, `animation.js` — exist but are NOT wired into main.js
- **Dead data files**: `ui.js` (broken structure, no export), `patchnotes.js` (inconsistent ko/en structure, no export)
- **Entry point**: `index.html` → `src/main.js?v=1.3.10`
- **No `src/lib/` directory** — project has no shared utility library
