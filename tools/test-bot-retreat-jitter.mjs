// Low-health bots on walled knockout maps (with waypoint navigation) must not shake in place:
// they flee away from the enemy itself, and stop once well out of reach instead of pressing into the edge.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { eventMap, mapBlocked, insideMapRect, navigateEventMap } from '../src/config/event-maps.js';
import { championsMap } from '../src/config/champions-maps.js';

const defs = season9Definitions();
function stuckJitter(who, games) {
  const pool = Object.keys(defs).filter(k => ![who, 'yellow'].includes(k) && defs[k].maxHealth);
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  let count = 0;
  for (let game = 0; game < games; game++) {
    const pick = () => pool.splice(Math.floor(rnd() * pool.length), 1)[0];
    const mates = [pick(), pick()], foes = [pick(), pick()]; pool.push(...mates, ...foes);
    const base = eventMap('knockout', game % 3, 20, 20);
    const layout = game % 2 ? championsMap('knockout', base.halfWidth, base.halfDepth) : base;
    const w = createBeta6Combat(defs, { seed: 300 + game, aimError: .035, bounds: 19.4,
      blocked: (x, z, r = .55) => mapBlocked(layout, x, z, r), walkable: (x, z) => !mapBlocked(layout, x, z, .5),
      bushAt: (x, z) => layout.bushes.some(rect => insideMapRect(x, z, rect)), destination: (a, t) => navigateEventMap(layout, a, t) });
    const A = [who, ...mates].map((id, i) => w.add(id, { team: 'a', x: [-4, 0, 4][i], z: -15 }));
    const B = ['yellow', ...foes].map((id, i) => w.add(id, { team: 'b', x: [-4, 0, 4][i], z: 15 }));
    const c = A[0]; let flips = [], prev = null, reported = -10; const trail = [];
    for (let f = 0; f < 60 * 90; f++) {
      w.update(1 / 60);
      if (c.hp <= 0 || !B.some(b => b.hp > 0)) break;
      const v = { x: c.vx, z: c.vz }, sp = Math.hypot(v.x, v.z), ps = prev && Math.hypot(prev.x, prev.z);
      if (prev && sp > .5 && ps > .5 && (v.x * prev.x + v.z * prev.z) / (sp * ps) < -.5) flips.push(w.time);
      if (sp > .5) prev = v;
      flips = flips.filter(t => w.time - t < 1);
      trail.push({ t: w.time, x: c.x, z: c.z }); while (w.time - trail[0].t > 3) trail.shift();
      const stay = w.time - trail[0].t > 2.9 && trail.every(q => Math.hypot(q.x - c.x, q.z - c.z) < 1.5);
      if (flips.length >= 8 && stay && w.time - reported > 3) { reported = w.time; count++; }
    }
  }
  return count;
}
for (const who of ['crystal', 'gold']) {
  const n = stuckJitter(who, 80);
  assert(n <= 2, `${who}: shaking in place ${n} times (was 27 for Crystal, 22 for Gold before the fix)`);
}
console.log('PASS low-health bots do not shake in place on walled knockout maps (Crystal, Gold; 80 games each).');
