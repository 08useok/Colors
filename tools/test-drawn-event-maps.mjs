// Drawn event maps (drawn-event-maps.js): every map is inside its field, 180° symmetric, keeps each mode's
// spawns / objective areas clear, and every start can walk (bot navigation) to its objective.
import assert from 'node:assert/strict';
import { DRAWN_EVENT_MAPS, drawnEventMap } from '../src/config/drawn-event-maps.js';
import { TEAM_ARENA, TEAM_ARENA_RESERVED } from '../src/config/beta9-team-arena.js';
import { HOT_ZONE_LAYOUTS, createHotZone } from '../src/config/hot-zone.js';
import { mapBlocked, navigateEventMap } from '../src/config/event-maps.js';
import { betaShowdownProfile } from '../src/config/beta-showdown.js';

const showdown = betaShowdownProfile(true);
const ring = (radius, n = 9) => Array.from({ length: n }, (_, i) => ({ x: Math.sin(i * Math.PI * 2 / n) * radius, z: Math.cos(i * Math.PI * 2 / n) * radius }));
const teamSpawns = TEAM_ARENA_RESERVED.gemGrab.filter(([, z]) => z !== 0).map(([x, z]) => ({ x, z }));
const FIELDS = {
  gemGrab: { half: [20, 30], spawns: teamSpawns, goals: () => [{ x: 0, z: 0 }], open: [{ x: 0, z: 0, r: 3 }] },
  hotZone: { half: [20, 30], spawns: teamSpawns, goals: map => map.hotZones, open: [] },
  chopWood: { half: [15, 30], spawns: [-8, 0, 8].flatMap(x => [{ x, z: -28 }, { x, z: 28 }]),
    goals: () => [{ x: 0, z: 22 }, { x: 0, z: -22 }], open: [{ x: 0, z: -25, r: 4 }, { x: 0, z: 25, r: 4 }] },
  soccer: { half: [19, 19], spawns: [[0, -14], [-6, -12], [6, -12], [-7, 12], [0, 12], [7, 12]].map(([x, z]) => ({ x, z })),
    goals: () => [{ x: 0, z: 0 }], open: [{ x: 0, z: 0, r: 3 }], mouths: true },
  goldRush: { half: [20, 20], spawns: [{ x: 0, z: 15 }, ...ring(9)], goals: () => [{ x: 0, z: 0 }], open: [{ x: 0, z: 0, r: 6 }] },
  showdown: { half: [showdown.halfSize, showdown.halfSize], spawns: [{ x: 0, z: showdown.playerSpawnZ }, ...ring(showdown.botSpawnRadius)],
    goals: () => [{ x: 0, z: 0 }], open: [{ x: 0, z: 0, r: 7.5 }], step: showdown.navigationStep },
};
const key = r => [r.x, r.z, r.width, r.depth].map(v => v.toFixed(2)).join(',');
const overlaps = (r, x, z, radius) => Math.abs(r.x - x) < r.width / 2 + radius && Math.abs(r.z - z) < r.depth / 2 + radius;

function walk(map, from, to, reach) {
  let at = { ...from };
  for (let i = 0; i < 1500 && Math.hypot(at.x - to.x, at.z - to.z) > reach; i++) {
    const step = navigateEventMap(map, at, to, .65);
    const dx = step.x - at.x, dz = step.z - at.z, len = Math.hypot(dx, dz) || 1, move = Math.min(.4, len);
    const next = { x: at.x + dx / len * move, z: at.z + dz / len * move };
    assert(!mapBlocked(map, next.x, next.z, .6), `${map.id}: path from ${from.x},${from.z} hits terrain at ${next.x.toFixed(1)},${next.z.toFixed(1)}`);
    at = next;
  }
  assert(Math.hypot(at.x - to.x, at.z - to.z) <= reach, `${map.id}: ${from.x.toFixed(1)},${from.z.toFixed(1)} reaches ${to.x},${to.z}`);
}

const indexes = new Set();
for (const entry of DRAWN_EVENT_MAPS) {
  assert(entry.index > 3 && !indexes.has(entry.index), `list number ${entry.index} is new and unique`); indexes.add(entry.index);
  for (const mode of entry.modes) {
    const map = drawnEventMap(mode, entry.index), spec = FIELDS[mode];
    assert.deepEqual([map.halfWidth, map.halfDepth], spec.half, `${map.id} on the ${mode} field`);
    if (spec.step) map.navigationStep = spec.step;
    const all = [...map.walls, ...map.lakes, ...map.bushes], solid = [...map.walls, ...map.lakes];
    assert(map.walls.length >= 4 && map.bushes.length >= 2, `${map.id} has cover`);
    for (const list of [map.walls, map.lakes, map.bushes]) {
      const keys = new Set(list.map(key));
      for (const r of list) {
        assert(Math.abs(r.x) + r.width / 2 <= map.halfWidth + 1e-9 && Math.abs(r.z) + r.depth / 2 <= map.halfDepth + 1e-9, `${map.id}: inside`);
        assert(keys.has(key({ ...r, x: -r.x, z: -r.z })), `${map.id}: 180° partner of ${key(r)}`);
      }
    }
    for (const o of spec.open) assert(!all.some(r => overlaps(r, o.x, o.z, o.r)), `${map.id}: ${o.x},${o.z} r${o.r} stays open`);
    if (spec.mouths) assert(!solid.some(r => Math.abs(r.x) - r.width / 2 < 5 && Math.abs(r.z) + r.depth / 2 > 15), `${map.id}: goal mouths open`);
    for (const s of spec.spawns) assert(!mapBlocked(map, s.x, s.z, .7), `${map.id}: spawn ${s.x.toFixed(1)},${s.z.toFixed(1)} clear`);
    if (mode === 'hotZone') {
      const zones = createHotZone(entry.index, map.hotZones ?? null).zones;
      for (const z of zones) assert(!solid.some(r => overlaps(r, z.x, z.z, z.radius)), `${map.id}: hot zone ${z.x},${z.z} clear`);
      if (map.hotZones) assert.deepEqual(zones.map(({ x, z, radius }) => ({ x, z, radius })), map.hotZones, `${map.id}: uses its own zones`);
    }
    const goals = mode === 'hotZone' ? createHotZone(entry.index, map.hotZones ?? null).zones : spec.goals(map);
    for (const s of spec.spawns.slice(0, 7)) for (const g of goals) walk(map, s, g, mode === 'hotZone' ? Math.min(1.5, g.radius) : 1.2);
  }
}
// Old list numbers keep their old meaning; a number from another mode falls back to the usual layouts.
assert.equal(drawnEventMap('gemGrab', 3), null); assert.equal(drawnEventMap('knockout', 6), null); assert.equal(drawnEventMap('gemGrab', 9), null);
assert.deepEqual(createHotZone(1).zones.map(({ x, z }) => [x, z]), HOT_ZONE_LAYOUTS[1].map(({ x, z }) => [x, z]), 'shared hot zone layouts unchanged');
console.log(`PASS drawn event maps: ${DRAWN_EVENT_MAPS.length} maps (${DRAWN_EVENT_MAPS.map(e => e.index).join(', ')}), fields/symmetry/spawns/objectives/paths ok.`);
