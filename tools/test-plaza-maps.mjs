// Official Season 1 plaza maps: open centre (gem altar, hot zones), spawns clear, everyone can reach the centre.
import assert from 'node:assert/strict';
import { plazaArenaMap, PLAZA_LAYOUTS, PLAZA_OPEN } from '../src/official/plaza-maps.js';
import { TEAM_ARENA } from '../src/config/beta9-team-arena.js';
import { HOT_ZONE_LAYOUTS } from '../src/config/hot-zone.js';
import { mapBlocked, navigateEventMap } from '../src/config/event-maps.js';

const W = TEAM_ARENA.halfWidth, D = TEAM_ARENA.halfDepth, z0 = TEAM_ARENA.spawnZ;
const spawns = [[-6, -z0], [0, -z0], [6, -z0], [-6, z0], [0, z0], [6, z0], [-5, z0], [5, z0]];
assert.equal(PLAZA_LAYOUTS.length, 3);
for (const mode of ['gemGrab', 'knockout']) for (let i = 0; i < 3; i++) {
  const map = plazaArenaMap(mode, i);
  assert.equal(map.plaza, true); assert.equal(map.halfWidth, W); assert.equal(map.halfDepth, D);
  assert(map.walls.length >= 4 && map.bushes.length >= 4, `${mode} ${i} has cover`);
  for (const r of [...map.walls, ...map.bushes]) {
    const clear = Math.abs(r.x) - r.width / 2 >= PLAZA_OPEN.x * W - 1e-9 || Math.abs(r.z) - r.depth / 2 >= PLAZA_OPEN.z * D - 1e-9;
    assert(clear, `${mode} ${i}: ${JSON.stringify(r)} intrudes on the open plaza`);
    assert(Math.abs(r.x) + r.width / 2 <= W && Math.abs(r.z) + r.depth / 2 <= D, 'inside the field');
  }
  for (const [x, z] of spawns) assert(!mapBlocked(map, x, z, .7), `${mode} ${i}: spawn ${x},${z} blocked`);
  for (const zones of HOT_ZONE_LAYOUTS) for (const zone of zones) assert(!mapBlocked(map, zone.x, zone.z, zone.radius), `${mode} ${i}: hot zone blocked`);
  for (const [x, z] of spawns) {
    const step = navigateEventMap(map, { x, z }, { x: 0, z: 0 }, 1);
    assert(step && Number.isFinite(step.x) && Number.isFinite(step.z), `${mode} ${i}: spawn ${x},${z} finds a way to the centre`);
  }
}
console.log('PASS plaza maps: 3 layouts, open centre for the gem altar and hot zones, clear spawns, centre reachable.');
