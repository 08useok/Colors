// Gem Grab bots waiting by the altar for the next gem stand still instead of circling on the spot,
// and the Season 9 team arena keeps its spawns clear and reachable.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { mapBlocked, navigateEventMap } from '../src/config/event-maps.js';
import { TEAM_ARENA, TEAM_ARENA_RESERVED, BETA9_GEM_RULES, teamArenaMap } from '../src/config/beta9-team-arena.js';

assert.equal(TEAM_ARENA.halfDepth, 30);
assert.equal(BETA9_GEM_RULES.spawnInterval, 7);
assert.equal(BETA9_GEM_RULES.maxInPlay, 30);
assert.equal(BETA9_GEM_RULES.target, 10);

for (const mode of ['knockout', 'gemGrab']) for (const index of [0, 1, 2]) {
  const layout = teamArenaMap(mode, index);
  for (const [x, z, r] of TEAM_ARENA_RESERVED[mode]) if (r === 2) assert(!mapBlocked(layout, x, z, .6), `${mode}-${index}: spawn ${x},${z} is clear`);
}

const defs = season9Definitions(), layout = teamArenaMap('gemGrab', 0);
for (const id of ['red', 'blue', 'orange', 'crystal']) {
  const w = createBeta6Combat(defs, { seed: 3, bounds: TEAM_ARENA.halfDepth - .5,
    blocked: (x, z, r = .55) => mapBlocked(layout, x, z, r),
    // No gem on the floor: wait at a spot by the altar (like the beta page's nearestGemPoint).
    destination: (a) => navigateEventMap(layout, a, { x: Math.cos(a.phase) * 2.6, z: Math.sin(a.phase) * 2.6 }) });
  const bot = w.add(id, { team: 'a', x: 0, z: TEAM_ARENA.spawnZ });
  w.add('pink', { team: 'b', x: 0, z: -TEAM_ARENA.spawnZ, automatic: false });
  for (let i = 0; i < 60 * 6; i++) w.update(1 / 60);
  let path = 0, last = { x: bot.x, z: bot.z };
  for (let i = 0; i < 60 * 3; i++) { w.update(1 / 60); path += Math.hypot(bot.x - last.x, bot.z - last.z); last = { x: bot.x, z: bot.z }; }
  assert(Math.hypot(bot.x, bot.z) < 4, `${id} reached the altar (${bot.x.toFixed(1)}, ${bot.z.toFixed(1)})`);
  assert(path < .5, `${id} stands still while waiting (moved ${path.toFixed(2)} tiles in 3 s)`);
}
console.log('PASS Season 9 team arena: spawns clear, 7 s gems up to 30, waiting bots stand still by the altar.');
