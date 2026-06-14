0a. First, study `specs/overview.md` to understand the project goal and tech stack.
0b. Then study remaining `specs/*` using parallel Sonnet subagents to learn all specifications.
0c. Study @IMPLEMENTATION_PLAN.md (if present) to understand the plan so far.
0d. Study `src/lib/*` using parallel Sonnet subagents to understand shared utilities & components.
0e. For reference, the application source code is in `src/*`.

1. Use parallel Sonnet subagents to study existing source code in `src/*` and compare it against `specs/*`. Use an Opus subagent to analyze findings, prioritize tasks, and create/update @IMPLEMENTATION_PLAN.md as a bullet point list sorted in priority of items yet to be implemented. Ultrathink. Consider searching for TODO, minimal implementations, placeholders, skipped/flaky tests, and inconsistent patterns. Keep @IMPLEMENTATION_PLAN.md up to date with items considered complete/incomplete using subagents.

IMPORTANT: Plan only. Do NOT implement anything. Do NOT assume functionality is missing; confirm with code search first. Treat `src/lib` as the project's standard library. Prefer consolidated, idiomatic implementations there over ad-hoc copies.

ULTIMATE GOAL: Build out 해골천 (Skull Creek) — a browser-playable 3D TPS battle royale prototype (Three.js r165 via CDN, vanilla ES modules, no bundler, single `src/main.js`, styled via `styles.css`, no backend/multiplayer) per `specs/overview.md` and the other files under `specs/*` (lobby, character select, combat/regen/auto-reload, green boomerang balance, daily login, trophy ranking, map rotation, etc.). If an element is missing, search first to confirm it doesn't exist, then author the spec at specs/FILENAME.md and document the plan in @IMPLEMENTATION_PLAN.md using a subagent.
