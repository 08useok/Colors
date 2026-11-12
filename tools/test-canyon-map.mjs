// Beta Knockout map 「물길 협곡」: drawing → rectangles, 180° symmetry, clear spawns,
// every start can reach the centre, and water blocks walking but not shots.
import assert from 'node:assert/strict';
import { CANYON_ROWS, CANYON_TOP_HALF, canyonKnockoutMap } from '../src/config/beta-canyon-map.js';
import { TEAM_ARENA, TEAM_ARENA_RESERVED } from '../src/config/beta9-team-arena.js';
import { mapBlocked, mapSightBlocked, navigateEventMap } from '../src/config/event-maps.js';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

assert.equal(CANYON_TOP_HALF.length, 15); assert.equal(CANYON_ROWS.length, 30);
assert(CANYON_ROWS.every(row => row.length === 20), 'every row is 20 cells (40 tiles)');
const map = canyonKnockoutMap();
assert.equal(map.halfWidth, TEAM_ARENA.halfWidth); assert.equal(map.halfDepth, TEAM_ARENA.halfDepth);
assert(map.walls.length >= 10 && map.lakes.length >= 10 && map.bushes.length >= 8);
const key = r => [r.x, r.z, r.width, r.depth].map(v => v.toFixed(2)).join(',');
for (const list of [map.walls, map.lakes, map.bushes]) {
  const keys = new Set(list.map(key));
  for (const r of list) {
    assert(Math.abs(r.x) + r.width / 2 <= map.halfWidth + 1e-9 && Math.abs(r.z) + r.depth / 2 <= map.halfDepth + 1e-9, 'inside the field');
    assert(keys.has(key({ ...r, x: -r.x, z: -r.z })), `180° partner of ${key(r)}`);
  }
}
const pillar = map.walls.find(w => Math.abs(w.x) < 3 && w.width === 4);
assert(pillar, 'the || river pillar is one solid 4-tile block, not two thin walls');
const spawns = TEAM_ARENA_RESERVED.knockout.map(([x, z]) => ({ x, z }));
for (const s of spawns) assert(!mapBlocked(map, s.x, s.z, .7), `spawn ${s.x},${s.z} is clear`);
for (const s of spawns) {
  const step = navigateEventMap(map, s, { x: 0, z: 0 }, 1);
  assert(step && Number.isFinite(step.x), `spawn ${s.x},${s.z} finds a way to the centre`);
}
// Water: walking is blocked, sight and projectiles are not.
const lake = map.lakes.find(l => Math.abs(l.x + 13) < .01 && Math.abs(l.z + 19) < .01); // the ~~~ pond away from the edge
assert(lake && mapBlocked(map, lake.x, lake.z, .1) && !mapSightBlocked(map, lake.x, lake.z, .1));
{
  const defs = season9Definitions();
  const shoot = sightBlocked => {
    const w = createBeta6Combat(defs, { seed: 3, aimError: 0, bounds: 30, blocked: (x, z, r) => mapBlocked(map, x, z, r), ...(sightBlocked ? { sightBlocked: (x, z, r) => mapSightBlocked(map, x, z, r) } : {}) });
    const a = w.add('blue', { automatic: false, x: lake.x - lake.width / 2 - 2, z: lake.z, next: 0 });
    const b = w.add('red', { automatic: false, x: lake.x + lake.width / 2 + 2, z: lake.z, team: 'b' });
    w.fire(a, b); for (let f = 0; f < 120; f++) w.update(1 / 60);
    return b.d.maxHealth - b.hp;
  };
  assert(shoot(true) > 0, 'a shot flies over the water');
  assert.equal(shoot(false), 0, 'without sightBlocked the old rule (water blocks shots) still applies');
}
console.log(`PASS canyon map: ${map.walls.length} walls, ${map.lakes.length} water, ${map.bushes.length} bushes, 180° symmetric, clear spawns, centre reachable, shots fly over water.`);
