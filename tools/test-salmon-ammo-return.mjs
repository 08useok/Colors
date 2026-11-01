// Salmon never reloads on its own and its floats vanish when it falls.
// Coming back by Pink's revive must therefore refill ammo, or Salmon is stuck at zero.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const run = (w, s) => { for (let i = 0; i < Math.ceil(s * 60); i++) w.update(1 / 60); };

{
  const w = createBeta6Combat(defs, { bounds: 30 });
  const salmon = w.add('salmon', { automatic: false, next: 0, team: 'a' });
  const pink = w.add('pink', { automatic: false, next: 0, team: 'a', x: 2 });
  const enemy = w.add('red', { automatic: false, team: 'b', x: 25, hp: 100000 });
  // Throw everything away, then fall: floats are removed with the owner.
  for (let i = 0; i < 5; i++) { salmon.next = 0; assert(w.fire(salmon, { x: 8, z: i * 3 - 6 })); }
  assert.equal(salmon.ammo, 0);
  run(w, 1);
  w.hit(enemy, salmon, 1e6);
  run(w, .1);
  assert.equal(w.salmon.floats.filter(f => f.owner === salmon).length, 0, 'floats vanish on death');
  pink.charge = pink.u.chargeRequired;
  assert(w.cast(pink, salmon), 'Pink revive cast');
  run(w, 2);
  assert(salmon.hp > 0, 'Salmon revived');
  assert.equal(salmon.ammo, salmon.d.maxAmmo, 'revive refills ammo');
}
{
  // Knockout disables revives: nothing changes for a fallen Salmon.
  const w = createBeta6Combat(defs, { bounds: 30, allowRevives: false });
  const salmon = w.add('salmon', { automatic: false, next: 0, team: 'a', ammo: 0 });
  const pink = w.add('pink', { automatic: false, next: 0, team: 'a', x: 2 });
  const enemy = w.add('red', { automatic: false, team: 'b', x: 25 });
  salmon.ammo = 0; w.hit(enemy, salmon, 1e6); pink.charge = pink.u.chargeRequired;
  assert(!w.cast(pink, salmon));
  assert.equal(salmon.ammo, 0);
}
console.log('PASS Salmon: Pink revive refills ammo after floats vanish; no revive when revives are disabled.');
