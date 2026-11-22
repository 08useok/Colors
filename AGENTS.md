# AGENTS.md
# Keep this file under 60 lines. Operational info only — no status updates.

## Build & Run
No build step (vanilla JS ES modules, Three.js via CDN, no bundler).
Serve the project root with any static server (`py -m http.server 4173`, or
`preview_start` with `skull-creek` from `.claude/launch.json`).
- Main: `index.html` → `src/main.js`
- Beta: `beta-season.html` → `src/beta-season.js`
- Official: `official.html` → same `src/beta-season.js`
- Wiki: `wiki.html` → `src/wiki.js`

Multiplayer Worker (`party/server.js`, `wrangler.jsonc`): `npm install`, then
`npm run dev` (port 8787, or `preview_start` with `multiplayer`).
The user deploys (`npm run deploy`) — just say when Worker code changed.

## Validation
- Tests: plain node scripts in `tools/` (`node tools/<name>.mjs`); common ones
  are in `package.json` scripts (`check:*`). Ranked/QA scripts need the
  Worker (8787) and a static server.
- No typecheck, lint, or build.
- Browser check: built-in browser tools (`preview_start`, `javascript_tool`,
  `read_console_messages`, `computer` screenshot). Screenshots can time out;
  prefer `javascript_tool` + console errors. Long scripts: store results in
  `window.__res` and poll instead of awaiting past the 45 s tool timeout.

## Layout
- `src/main.js` (~16k lines): main season. Balance on top of beta8 lives in
  its `if (CURRENT_SEASON === "beta8") {...}` block (`releaseStats`);
  `CURRENT_VERSION` drives the lobby version label.
- `src/beta-season.js` (~11k lines): beta + official seasons.
- `src/combat/beta6-combat.js`: shared combat engine (main, beta, official).
  Main reaches it through `src/combat/main-season-combat.js`.
- `src/config/`: characters (`beta-characters.js`), per-season balance
  (`beta6..9-balance.js`), modes, maps, skins, gadgets, patch notes.
- `src/LANGS/`: ko/en UI and archive text. `specs/`: specs and patch notes.

## Working Rules
- Cache busting: when a module changes, bump the `?v=` on every import of it
  (and the `<script>` tag in the HTML that loads the entry file).
- The working tree usually holds the user's uncommitted edits. Never commit
  them: build changes from `git show HEAD:path`, then stage with
  `git hash-object -w` + `git update-index --cacheinfo`.
- Commit locally; push only when the user asks.
- Patch notes go in the same commit as the change:
  - Main: `index.html` patch entry + `src/LANGS/archive-text.js` (ko/en) +
    `specs/patch-notes.md`, and bump `CURRENT_VERSION`.
  - Beta/official: `src/config/beta9-patch-notes.js` summary.
- Main-only balance changes also update `MAIN_OVERRIDES` in
  `tools/test-main-season8-release.mjs`.

## Codebase Patterns
- `state` holds all mutable game state; transient visuals go through
  `state.effects` (`{ mesh, life, maxLife, type }`, `updateEffects(dt)`).
- When tearing down a mode, remove meshes/projectiles/effects from `scene`
  and clear the matching `state` arrays.
