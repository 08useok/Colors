// Season 9 beta team arenas (Gem Grab, Knockout). The field is longer than the old 40x40 square:
// spawns sit 52 tiles apart, so the 5 s spawn shield (40 tiles at base speed) runs out before the
// enemy side. The main season keeps its own rules (gem-grab.js, event-maps.js).
import { eventMap } from './event-maps.js';
import { GEM_GRAB_RULES } from './gem-grab.js';
import { KNOCKOUT_RULES } from './knockout.js';

export const TEAM_ARENA = Object.freeze({ halfWidth: 20, halfDepth: 30, spawnZ: 26 });

// Gems rise from the centre one every 7 s, as in Brawl Stars; up to 30 can be in the match at once
// (on the floor plus carried). Winning is unchanged: hold 10 for 15 s.
export const BETA9_GEM_RULES = Object.freeze({ ...GEM_GRAB_RULES, halfDepth: TEAM_ARENA.halfDepth,
  spawnInterval: 7, firstSpawnDelay: 7, maxInPlay: 30 });

// Extra cover for the longer field, mirrored on both axes. Fractions of halfWidth / halfDepth,
// as in event-maps.js: [x, z, width, depth].
export const TEAM_ARENA_COVER = Object.freeze({
  walls: [[-.45, -.68, .18, .04], [.45, -.68, .18, .04], [-.45, .68, .18, .04], [.45, .68, .18, .04],
    [-.12, -.42, .04, .1], [.12, .42, .04, .1]],
  bushes: [[-.78, -.38, .14, .12], [.78, -.38, .14, .12], [-.78, .38, .14, .12], [.78, .38, .14, .12],
    [0, -.6, .24, .05], [0, .6, .24, .05]],
});

const spawnZ = TEAM_ARENA.spawnZ;
// Keep cover away from the spawn lines and the gem altar.
export const TEAM_ARENA_RESERVED = Object.freeze({
  knockout: [[0, -spawnZ, 2], [-6, -spawnZ, 2], [6, -spawnZ, 2], [-6, spawnZ, 2], [0, spawnZ, 2], [6, spawnZ, 2]],
  gemGrab: [[0, 0, 3], [-5, spawnZ, 2], [5, spawnZ, 2], [0, spawnZ, 2], [-6, -spawnZ, 2], [0, -spawnZ, 2], [6, -spawnZ, 2]],
});

export function teamArenaMap(mode, index = 0) {
  const { halfWidth, halfDepth } = TEAM_ARENA, reserved = TEAM_ARENA_RESERVED[mode] ?? [];
  const layout = eventMap(mode, index, halfWidth, halfDepth, reserved);
  const scale = ([x, z, w, d]) => ({ x: x * halfWidth, z: z * halfDepth, width: w * halfWidth, depth: d * halfDepth });
  const keep = rect => !reserved.some(([x, z, r = 2]) => Math.abs(x - rect.x) < rect.width / 2 + r && Math.abs(z - rect.z) < rect.depth / 2 + r);
  layout.walls.push(...TEAM_ARENA_COVER.walls.map(scale).filter(keep));
  layout.bushes.push(...TEAM_ARENA_COVER.bushes.map(scale));
  return layout;
}

// Knockout poison: the safe rectangle shrinks from the full field to nothing between
// poisonStarts and poisonCloses (same timing as before, now for a rectangular field).
export function knockoutSafeArea(elapsed) {
  const t = Math.max(0, Math.min(1, (KNOCKOUT_RULES.poisonCloses - elapsed) / (KNOCKOUT_RULES.poisonCloses - KNOCKOUT_RULES.poisonStarts)));
  return { x: (TEAM_ARENA.halfWidth - .5) * t, z: (TEAM_ARENA.halfDepth - .5) * t };
}
