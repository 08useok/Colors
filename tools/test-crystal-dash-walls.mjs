// Crystal's analysis dash travels along its path: it stops at walls instead of passing through them,
// and a bot keeps its charge when a wall blocks the way to its target.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

// One wall at x in [-1, 1], z in [-10, 10].
const blocked = (x, z, r = .55) => x > -1 - r && x < 1 + r && z > -10 - r && z < 10 + r;
const world = () => createBeta6Combat(season9Definitions(), { bounds: 19.4, blocked });

for (const escapes of [false, true]) {
  const w = world();
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: -6, z: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 6, z: 0 });
  crystal.angle = 0; crystal.charge = crystal.u.chargeRequired;
  assert.notEqual(w.cast(crystal, target, {}), false, 'manual cast');
  for (let i = 0; i < 120; i++) { if (escapes) target.z = 8; w.update(1 / 60); }
  assert(crystal.x < -1, `dash stops before the wall (${escapes ? 'miss' : 'hit'}), got x=${crystal.x}`);
  assert(!target.analysisOwner, 'no bind through a wall');
}
{
  const w = world();
  const crystal = w.add('crystal', { automatic: true, team: 'a', x: -6, z: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 6, z: 0 });
  crystal.charge = crystal.u.chargeRequired;
  assert.equal(w.cast(crystal, target, {}), false, 'bot does not dash into a wall');
  assert.equal(crystal.charge, crystal.u.chargeRequired, 'bot keeps its charge');
}
{
  // Open ground still binds as before.
  const w = createBeta6Combat(season9Definitions(), { bounds: 19.4 });
  const crystal = w.add('crystal', { automatic: false, team: 'a', x: -6, z: 0 });
  const target = w.add('red', { automatic: false, team: 'b', x: 6, z: 0 });
  crystal.angle = 0; crystal.charge = crystal.u.chargeRequired;
  w.cast(crystal, target, {});
  for (let i = 0; i < 120; i++) w.update(1 / 60);
  assert.equal(target.analysisOwner, crystal, 'binds on open ground');
}
console.log('PASS Crystal dash: stops at walls on hit and miss, no bind through walls, bot keeps charge when blocked, open ground unchanged.');
