// Natural counter ring re-measure (gadgets on): all pairs × 3 maps × both orders for one (seed, aim error).
// Same fight as tools/simulate-gadgets-three-maps.mjs — power 7, gadgets on for both, transforms off, 90 s, regen —
// with the seed and aim error as parameters so several runs can go in parallel.
// Usage: SEED=20261112 AIM=0 OUT=path.json node tools/measure-natural-ring.mjs
// Then:  node tools/report-natural-ring.mjs <run files...>   (writes specs/natural-counter-ring-75-20261112.{json,md})
import fs from 'node:fs';
import { maps, defs } from './simulate-gadgets-three-maps.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { mapBlocked, insideMapRect, navigateEventMap } from '../src/config/event-maps.js';

const seed = Number(process.env.SEED), aimError = Number(process.env.AIM), dt = 1 / 60, limit = 90;
export function fight(subject, opponent, layout, mirror, options = { seed, aimError }) {
  layout = structuredClone(layout);
  const world = createBeta6Combat(defs, { seed: options.seed, aimError: options.aimError, bounds: 15.4, gadgets: true, transforms: false,
    blocked: (x, z, r) => mapBlocked(layout, x, z, r), walkable: (x, z) => !mapBlocked(layout, x, z, .55),
    bushAt: (x, z) => layout.bushes.some(r => insideMapRect(x, z, r)), destination: (a, b) => navigateEventMap(layout, a, b) });
  const heroData = { team: 'a', x: -mirror * 5, z: 0, powerMultiplier: 1.12 }, enemyData = { team: 'b', x: mirror * 5, z: 0, powerMultiplier: 1.12 };
  let hero, enemy;
  if (mirror === 1) { hero = world.add(subject, heroData); enemy = world.add(opponent, enemyData); }
  else { enemy = world.add(opponent, enemyData); hero = world.add(subject, heroData); }
  while (world.time < limit && hero.hp > 0 && enemy.hp > 0) {
    world.update(dt);
    for (const actor of [hero, enemy]) if (actor.hp > 0 && actor.hp < actor.d.maxHealth && world.time - actor.combatAt >= 5) actor.hp = Math.min(actor.d.maxHealth, actor.hp + actor.d.maxHealth * .1 * dt);
  }
  return hero.hp <= 0 && enemy.hp <= 0 ? 'draw' : hero.hp <= 0 ? 'loss' : enemy.hp <= 0 ? 'win' : 'draw';
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/measure-natural-ring.mjs')) {
  const ids = Object.keys(defs), rows = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++)
    for (const layout of maps) for (const mirror of [-1, 1]) rows.push({ a: ids[i], b: ids[j], map: layout.id, mirror, result: fight(ids[i], ids[j], layout, mirror) });
  fs.writeFileSync(process.env.OUT, JSON.stringify({ seed, aimError, rows }));
  console.log('done', seed, aimError, rows.length);
}
