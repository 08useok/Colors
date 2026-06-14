# Implementation Plan — 해골천 (Skull Creek)

> Auto-generated gap analysis: specs/* vs src/main.js
> Last updated: 2026-06-14

---

## Completed Specs (verified against code)

- [x] **mouse-aim.md** — Mouse raycasting decouples aim from movement. Auto-aim on mouseHeld. Mobile fallback via joystick.
- [x] **character-select.md** — Red/Green/Blue selectable in lobby. Bots randomly assigned. Stats match spec (Red 10K HP, Green 8.4K HP). Blue (4.4K HP bullet) added beyond spec as bonus.
- [x] **fix-initial-render.md** — CDN switched to jsdelivr. `account-creation` visible by default. `message-overlay` has no inline `display:none`. `showLobby()` called at init.
- [x] **daily-login.md** — ID registration, daily re-auth, 5-attempt lockout, account recovery reveal, localStorage schema all implemented.
- [x] **trophy-ranking.md** — `calcTrophyChange(rank) = 12 - rank*2`. `deathOrder[]` tracking. Floor at 0. Bot detection range = 50 units. Result screen shows rank + trophy delta.
- [x] **lobby.md** — Full flow: account creation → daily auth → lobby main → char select → battle/training. Level formula, win/loss recording, trophy display all working.
- [x] **green-boomerang.md** — Angles ±30°/±10° (60° total), range 5 units, far threshold 3.5, far multiplier 0.625, reload 1.0s, aim indicator 60° fan. All match spec.
- [x] **combat-regen-autoreload.md** — 3s combat cooldown, then instant 25% maxHealth heal, repeating every 1s while uncombated (`fighter.nextRegenAt`), applies to player only (bots don't regen). Red reload 0.5s.
- [x] **map-rotation.md** — 3 maps (해골 협곡, 마른 호수, 뼈의 미로) with random selection on battle start. Map name shown in HUD. Play Again reuses same map. Training unaffected.

---

## Remaining Items (priority order)

### P6: Bot style placeholder (low priority)
> `botStyle` ("aggressive"/"skirmisher") is assigned per bot in `initPlayers()` but `updateBot()` never branches on it. Both styles behave identically.

This is cosmetic — no spec requires differentiated bot styles. Leave as-is unless a spec is authored.

---

## Missing Specs (features in code but no spec)

### Blue Character
> Blue (HP 4,400, bullet attack, range 16, speed 28) is fully implemented in code but has no spec under `specs/`. The overview says "캐릭터 2종 (Red/Green)" — Blue was added in commit `eb87032`.

Recommendation: Author `specs/blue-bullet.md` to document Blue's stats, attack behavior, aim indicator (laser beam + dot), and training label fix.

---

## Notes

- `showLobby()` is called at init (line 2772) ✓
- `lastCombatTime` initialized to `-999` (line 593) — regen available at game start ✓
- Zone damage does NOT update `lastCombatTime` ✓
- Auto-reload triggers at `ammo < maxAmmo` in `updateAmmoRegen()` ✓
- Training mode label now uses dynamic character name lookup ✓
- Map rotation: `clearBattleMap()` does full GPU resource cleanup (geometry + material dispose) ✓
- `state.pointerLocked` declared but unused (no Pointer Lock API call) — harmless
- `Space` key captured but unbound — harmless
