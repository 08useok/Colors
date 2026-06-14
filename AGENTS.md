# AGENTS.md
# Keep this file under 60 lines. Operational info only — no status updates.

## Build & Run
No build step (vanilla JS ES modules, Three.js r165 via CDN, no bundler).
Serve the project root with any static file server, then open in a browser:

```powershell
py -m http.server 4173
```

Open `http://localhost:4173`. Entry point: `index.html` → `src/main.js` (type="module").

## Validation
- Tests: none (no test framework configured)
- Typecheck: none (plain JS, no TS)
- Lint: none configured
- Build: none (no bundler/compile step)
- Manual verification: use the Claude Preview MCP tools (`preview_start`,
  `preview_eval`, `preview_console_logs`, `preview_screenshot`) to run the
  page and check for runtime errors after changes.

## Operational Notes
- Single source file: `src/main.js` (~2700+ lines). Markup in `index.html`,
  styles in `styles.css`.
- Reload via `preview_eval` with `window.location.reload()`, then check
  `preview_console_logs(level: "error")`.
- For quick in-page testing, temporarily expose internals via
  `window.__debug = { ... }` near the bottom of `src/main.js` (after
  `createMap()`), test via `preview_eval`, then remove before committing.
- `preview_screenshot` can be flaky/time out in this environment; prefer
  `preview_eval` + `preview_console_logs` for verification when it hangs.

### Codebase Patterns
- `state` object holds all mutable game state (players, projectiles, effects,
  zone, lobby/account data).
- Transient visuals (sparks, slashes, damage popups) go through
  `state.effects` as `{ mesh, life, maxLife, type }`, processed in
  `updateEffects(dt)`.
- Character stats/config live in `CHARACTERS` (red/green/blue).
- Battle map geometry/solids/lake/bushes are built in `createMap()` into
  `battleMapGroup` + `state.battleSolids/battleLakeRects/battleBushes`;
  training map is separate (`createTrainingMap()` / `trainingMapGroup`).
- When tearing down a mode (e.g. `exitTraining()`), always remove fighter
  meshes/projectiles/effects from `scene` and clear the corresponding
  `state` arrays to avoid leftover objects.
