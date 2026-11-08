// Official Season 1 plaza maps for the team modes (Gem Grab, Knockout, Hot Zone on the Gem Grab arena).
// Same 40x60 field as the Season 9 team arena; the centre is an open plaza (gem altar and hot zones),
// with cover and bushes only along the edges and at the chokepoints in front of each base.
// Coordinates are fractions of halfWidth / halfDepth: [x, z, width, depth], mirrored on both axes.
import { eventMap } from '../config/event-maps.js';
import { TEAM_ARENA, TEAM_ARENA_RESERVED } from '../config/beta9-team-arena.js';

// Nothing may stand inside this centre rectangle (fractions): |x| < .55 and |z| < .35 → 22 x 21 tiles.
export const PLAZA_OPEN = Object.freeze({ x: .55, z: .35 });

const mirror = list => list.flatMap(([x, z, w, d]) => [[x, z, w, d], [-x, z, w, d], [x, -z, w, d], [-x, -z, w, d]]);
const unique = list => [...new Map(list.map(r => [r.join(','), r])).values()];

export const PLAZA_LAYOUTS = Object.freeze([
  { name: '크리스마스 광장', // corner blocks and a chokepoint wall in front of each base
    walls: unique(mirror([[.72, .55, .24, .05], [.84, .44, .05, .14], [.32, .5, .22, .045]])),
    bushes: unique(mirror([[.86, .15, .12, .18], [.62, .7, .16, .08]])) },
  { name: '눈꽃 분수 광장', // short diagonal walls on the plaza rim, wide side bushes
    walls: unique(mirror([[.62, .42, .16, .05], [.42, .6, .05, .1], [.86, .62, .05, .12]])),
    bushes: unique(mirror([[.85, .22, .13, .3], [.2, .62, .14, .06]])) },
  { name: '선물 시장', // market stalls along both side edges, bushes at the base corners
    walls: unique(mirror([[.78, .42, .14, .06], [.78, .64, .14, .06], [.4, .52, .05, .12]])),
    bushes: unique(mirror([[.55, .72, .16, .07], [.9, .2, .08, .2]])) },
]);

export function plazaArenaMap(mode, index = 0) {
  const { halfWidth, halfDepth } = TEAM_ARENA, reserved = TEAM_ARENA_RESERVED[mode] ?? [];
  const source = PLAZA_LAYOUTS[Math.max(0, Math.min(PLAZA_LAYOUTS.length - 1, Math.trunc(Number(index)) || 0))];
  const base = eventMap(mode, index, halfWidth, halfDepth, reserved);
  const scale = ([x, z, w, d]) => ({ x: x * halfWidth, z: z * halfDepth, width: w * halfWidth, depth: d * halfDepth });
  const keep = rect => !reserved.some(([x, z, r = 2]) => Math.abs(x - rect.x) < rect.width / 2 + r && Math.abs(z - rect.z) < rect.depth / 2 + r);
  return { ...base, name: source.name, plaza: true, walls: source.walls.map(scale).filter(keep), bushes: source.bushes.map(scale), lakes: [] };
}
