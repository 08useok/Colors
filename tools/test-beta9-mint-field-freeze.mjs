// Beta 9 Mint field: standing on it freezes after 3 s, no ice builds while frozen, and the freeze applies
// again after thawing. Main Season 8 rules (no iceBlockedWhileFrozen) keep stacking ice during a freeze.
import assert from 'node:assert/strict';
import { season9CycleConfig } from './beta9-cycle-definitions.mjs';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

function freezesOnField(defs) {
  const freezes = [];
  const w = createBeta6Combat(defs, { bounds: 40, onEvent: e => { if (e.type === 'freeze') freezes.push(+e.time.toFixed(2)); } });
  const mint = w.add('mint', { automatic: false, team: 'a', x: -5, z: 0 });
  // A huge, immobile target held at the field centre (re-pinned every frame so the push cannot move it off).
  const dummy = w.add('red', { automatic: false, team: 'b', x: 0, z: 0 });
  dummy.hp = 1e7; dummy.d = { ...dummy.d, maxHealth: 1e7 };
  mint.charge = mint.u.chargeRequired;
  assert(w.cast(mint, dummy, { point: { x: 0, z: 0 } }) !== false, 'field cast');
  for (let i = 0; i < 10 * 60; i++) { w.update(1 / 60); dummy.x = 0; dummy.z = 0; }
  return { freezes, defs };
}

{
  const { freezes, defs } = freezesOnField(season9CycleConfig());
  const duration = defs.mint.freezeDuration;
  assert(freezes.length >= 2, `field freezes more than once (got ${freezes})`);
  // First freeze about 3 s after the field lands (25 ice per second against 75).
  assert(freezes[0] > 2 && freezes[0] < 4, `first freeze near 3 s, got ${freezes[0]}`);
  // Next freeze only after thawing, and then another 3 s of standing.
  for (let i = 1; i < freezes.length; i++) assert(freezes[i] - freezes[i - 1] >= duration + 2.9, `re-freeze after thaw: ${freezes}`);
}
{
  // Main Season 8 values: 5 ice per second and threshold 100, so the field alone never freezes in 10 s.
  const main = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
  const { freezes } = freezesOnField(main);
  assert.equal(freezes.length, 0, 'main Season 8 field does not freeze on its own');
}
console.log('PASS Beta 9 Mint field: freeze after 3 s on the field, no ice while frozen, freeze again after thawing; main Season 8 unchanged.');
