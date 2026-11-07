// Gadgets (Official Season 1): one per character, cooldown-based, off unless options.gadgets.
// Black and White are not built yet, so their gadgets are tested on stand-in characters.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { GADGETS } from '../src/config/gadgets.js';

const defs = season9Definitions();
const step = (w, s) => { for (let i = 0; i < s * 60; i++) w.update(1 / 60); };

{ // Off by default: no gadget field, gadget() does nothing.
  const w = createBeta6Combat(defs, { bounds: 19.4 });
  const a = w.add('red', { automatic: false });
  assert.equal(a.g, null);
  assert.equal(w.gadget(a), false);
}
{ // Characters without a gadget get none even with gadgets on.
  const w = createBeta6Combat(defs, { bounds: 19.4, gadgets: true });
  assert.equal(w.add('red', { automatic: false }).g, null);
}
{ // Dash (Black's 그림자 걸음): moves `distance` toward the aim, then cools down.
  const w = createBeta6Combat(defs, { bounds: 19.4, gadgets: true });
  const a = w.add('red', { automatic: false, x: 0, z: 0, g: GADGETS.black });
  assert.equal(w.gadget(a, { angle: 0 }), true);
  assert(Math.abs(a.x - GADGETS.black.distance) < .25, `dashed to ${a.x}`);
  assert.equal(w.gadget(a, { angle: 0 }), false, 'on cooldown');
  step(w, GADGETS.black.cooldown + .1);
  assert.equal(w.gadget(a, { angle: Math.PI }), true, 'ready again after the cooldown');
}
{ // Dash stops at walls; pressed straight into a wall it does nothing and keeps the cooldown.
  const blocked = (x, z, r = .55) => x > 2 - r && x < 3 + r;
  const w = createBeta6Combat(defs, { bounds: 19.4, gadgets: true, blocked });
  const a = w.add('red', { automatic: false, x: 0, z: 0, g: GADGETS.black });
  w.gadget(a, { angle: 0 });
  assert(a.x < 2 - .5, `stopped before the wall at ${a.x}`);
  const b = w.add('red', { automatic: false, x: 1.3, z: 5, g: GADGETS.black });
  assert.equal(w.gadget(b, { angle: 0 }), false, 'no move into a wall');
  assert.equal(b.gadgetReadyAt, 0, 'cooldown kept');
}
{ // Empower (White's 벌레 떼) marks the next attack.
  const w = createBeta6Combat(defs, { bounds: 19.4, gadgets: true });
  const a = w.add('orange', { automatic: false, g: GADGETS.white });
  assert.equal(w.gadget(a), true);
  assert.equal(a.empoweredAttack, 'bugs');
}
{ // No gadget while frozen; bots dash in on a target just out of reach.
  const w = createBeta6Combat(defs, { bounds: 19.4, gadgets: true });
  const a = w.add('red', { automatic: false, g: GADGETS.black, frozenUntil: 5 });
  assert.equal(w.gadget(a), false);
  let used = 0;
  const w2 = createBeta6Combat(defs, { bounds: 19.4, gadgets: true, onEvent: e => { if (e.type === 'gadget') used++; } });
  const bot = w2.add('red', { team: 'a', x: -5, z: 0, g: GADGETS.black });
  w2.add('blue', { team: 'b', x: 4, z: 0, automatic: false });
  step(w2, 3);
  assert(used >= 1, 'bot used its dash');
}
console.log('PASS gadgets: off by default, dash (walls, cooldown), empower, frozen, bot use.');
