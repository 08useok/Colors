// Blue ultimate (roll) against walls and map bounds, with knockback victims in the way.
// Pins the current rules: a blocked step reverses the roll by 180 degrees (it retraces, not a
// mirror reflection), each enemy is hit once per roll, and knockback never pushes into walls.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const WALL = 6; // solid for x >= 6
const world = (extra = {}) => {
  const hits = [];
  const w = createBeta6Combat(defs, { bounds: 30, blocked: (x, z, r = 0) => x + r >= WALL, onEvent: e => { if (e.type === 'damage' && e.owner?.id === 'blue') hits.push(e.target.key); }, ...extra });
  return { w, hits };
};
const roll = (w, blue, yaw) => { blue.charge = blue.u.chargeRequired; assert(w.cast(blue, null, { angle: yaw }) || w.cast(blue, { x: blue.x + Math.cos(yaw) * 5, z: blue.z + Math.sin(yaw) * 5, hp: 1 }, { angle: yaw }), 'roll starts'); };
const until = (w, test, max = 5) => { for (let i = 0; i < max * 60 && !test(); i++) w.update(1 / 60); };

{
  // 1. Head-on: reverses, never enters the wall, keeps rolling for the full duration.
  const { w } = world();
  const blue = w.add('blue', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  w.add('red', { automatic: false, team: 'b', x: -25, z: 20 });
  roll(w, blue, 0);
  until(w, () => blue.dash);
  let maxX = -Infinity, reversed = false;
  until(w, () => { maxX = Math.max(maxX, blue.x); if (blue.dash && Math.cos(blue.dash.yaw) < -.99) reversed = true; return !blue.dash; });
  assert(maxX < WALL, `stays out of the wall (max x ${maxX.toFixed(2)})`);
  assert(reversed, 'reverses on the wall');
  assert(blue.x < maxX - 1, 'travels back after the bounce');
}
{
  // 2. Diagonal approach retraces the incoming path (180-degree turn), it does not mirror.
  const { w } = world();
  const blue = w.add('blue', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  w.add('red', { automatic: false, team: 'b', x: -25, z: 20 });
  const yaw = Math.PI / 4;
  roll(w, blue, yaw);
  until(w, () => blue.dash && Math.cos(blue.dash.yaw) < 0);
  const after = Math.atan2(Math.sin(blue.dash.yaw), Math.cos(blue.dash.yaw));
  assert(Math.abs(Math.abs(after - yaw) - Math.PI) < 1e-6, `retraces: ${after.toFixed(3)}`);
}
{
  // 3. Enemy between Blue and the wall: hit once, knocked toward the wall but not into it,
  //    and not hit again when Blue rolls back through it.
  const { w, hits } = world();
  const blue = w.add('blue', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
  const enemy = w.add('red', { automatic: false, team: 'b', x: 5.6, z: 0, hp: 1e6 });
  enemy.d = { ...enemy.d, maxHealth: 1e6 };
  roll(w, blue, 0);
  until(w, () => blue.dash);
  until(w, () => !blue.dash);
  assert.equal(hits.filter(k => k === enemy.key).length, 1, 'one hit per roll');
  assert(enemy.x < WALL, `knockback stops at the wall (x ${enemy.x.toFixed(2)})`);
}
{
  // 4. Map bounds behave like walls.
  const { w } = world({ blocked: () => false });
  const blue = w.add('blue', { automatic: false, team: 'a', x: 25, z: 0, next: 0 });
  w.add('red', { automatic: false, team: 'b', x: -25, z: 20 });
  roll(w, blue, 0);
  until(w, () => blue.dash);
  let maxX = -Infinity;
  until(w, () => { maxX = Math.max(maxX, blue.x); return !blue.dash; });
  assert(maxX <= 30 + 1e-9, 'stays inside bounds');
}
console.log('PASS Blue roll: wall and bound reversal (180-degree retrace), no wall entry, one hit per target per roll, knockback stops at walls.');
