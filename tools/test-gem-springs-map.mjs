// Gem Grab map 「보석 샘터」: drawing → rectangles, 180° symmetry, clear spawns and gem altar,
// open centre for both Hot Zone layouts, and every start can walk to the altar.
import assert from 'node:assert/strict';
import { GEM_SPRINGS_ROWS, GEM_SPRINGS_TOP_HALF, GEM_SPRINGS_MAP_INDEX, gemSpringsMap } from '../src/config/beta-gem-springs-map.js';
import { TEAM_ARENA, TEAM_ARENA_RESERVED } from '../src/config/beta9-team-arena.js';
import { HOT_ZONE_LAYOUTS } from '../src/config/hot-zone.js';
import { mapBlocked, navigateEventMap } from '../src/config/event-maps.js';

assert.equal(GEM_SPRINGS_TOP_HALF.length, 15); assert.equal(GEM_SPRINGS_ROWS.length, 30);
assert(GEM_SPRINGS_ROWS.every(row => row.length === 20), 'every row is 20 cells (40 tiles)');
assert(GEM_SPRINGS_MAP_INDEX > 3, 'does not collide with the shared layouts or the canyon (0-3)');
const map = gemSpringsMap();
assert.equal(map.halfWidth, TEAM_ARENA.halfWidth); assert.equal(map.halfDepth, TEAM_ARENA.halfDepth);
assert(map.walls.length >= 10 && map.lakes.length >= 6 && map.bushes.length >= 8);
const key = r => [r.x, r.z, r.width, r.depth].map(v => v.toFixed(2)).join(',');
for (const list of [map.walls, map.lakes, map.bushes]) {
  const keys = new Set(list.map(key));
  for (const r of list) {
    assert(Math.abs(r.x) + r.width / 2 <= map.halfWidth + 1e-9 && Math.abs(r.z) + r.depth / 2 <= map.halfDepth + 1e-9, 'inside the field');
    assert(keys.has(key({ ...r, x: -r.x, z: -r.z })), `180° partner of ${key(r)}`);
    assert(keys.has(key({ ...r, x: -r.x })), `left-right partner of ${key(r)}`);
  }
}
const overlaps = (r, x, z, radius) => Math.abs(r.x - x) < r.width / 2 + radius && Math.abs(r.z - z) < r.depth / 2 + radius;
// Centre: nothing at all (walls, water, bushes) inside |x| < 4, |z| < 10.
for (const r of [...map.walls, ...map.lakes, ...map.bushes])
  assert(!(Math.abs(r.x) - r.width / 2 < 4 && Math.abs(r.z) - r.depth / 2 < 10), `centre stays open, found ${key(r)}`);
for (const layout of HOT_ZONE_LAYOUTS) for (const zone of layout)
  assert(![...map.walls, ...map.lakes].some(r => overlaps(r, zone.x, zone.z, zone.radius)), `hot zone ${zone.x},${zone.z} is clear`);
const spawns = TEAM_ARENA_RESERVED.gemGrab.filter(([, z]) => z !== 0).map(([x, z]) => ({ x, z }));
for (const s of spawns) assert(!mapBlocked(map, s.x, s.z, .7), `spawn ${s.x},${s.z} is clear`);
// Walk from each spawn to the altar following the bot navigation.
for (const s of spawns) {
  let at = { ...s };
  for (let i = 0; i < 400 && Math.hypot(at.x, at.z) > 1; i++) {
    const step = navigateEventMap(map, at, { x: 0, z: 0 }, .65);
    const dx = step.x - at.x, dz = step.z - at.z, len = Math.hypot(dx, dz) || 1, move = Math.min(.4, len);
    const next = { x: at.x + dx / len * move, z: at.z + dz / len * move };
    assert(!mapBlocked(map, next.x, next.z, .6), `path from ${s.x},${s.z} stays clear at ${next.x.toFixed(1)},${next.z.toFixed(1)}`);
    at = next;
  }
  assert(Math.hypot(at.x, at.z) <= 1, `spawn ${s.x},${s.z} reaches the altar`);
}
console.log(`PASS gem springs map: ${map.walls.length} walls, ${map.lakes.length} water, ${map.bushes.length} bushes, symmetric, clear spawns/centre/hot zones, altar reachable.`);
