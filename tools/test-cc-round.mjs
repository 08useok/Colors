// Chartreuse CC round: every crowd control in the game, each with equal odds, and each one applied.
import assert from 'node:assert/strict';
import { season9Definitions } from './simulate-beta9-team-modes.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const EFFECTS = ['slow', 'malfunction', 'freeze', 'poison', 'stun', 'root', 'airborne', 'reveal', 'knockback'];
const defs = season9Definitions(), counts = Object.fromEntries(EFFECTS.map(e => [e, 0]));
const applied = new Set();
let shots = 0;
for (let seed = 1; shots < 2700; seed++) {
  let last = null;
  const w = createBeta6Combat(defs, { seed, bounds: 19.4, onEvent: e => { if (e.type === 'ccRound') { counts[e.effect]++; last = e; } } });
  const c = w.add('chartreuse', { automatic: false, team: 'a', x: 0, z: 0 });
  for (let i = 0; i < 30; i++) {
    const t = w.add('salmon', { automatic: false, team: 'b', x: 4, z: 0 });
    c.rounds = ['cc']; c.ammo = 3; c.next = 0; last = null;
    w.fire(c, t, 0);
    for (let f = 0; f < 18 && !last; f++) w.update(1 / 60);
    if (!last) { w.remove(t); continue; }
    shots++;
    const now = w.time, e = last.effect;
    const ok = { slow: t.slowUntil > now && t.slow === .35, malfunction: t.lockUntil > now, freeze: t.frozenUntil > now,
      poison: t.poisonUntil > now, knockback: t.x > 4.5, stun: t.slow === 1 && t.lockUntil > now, root: t.rootUntil > now,
      airborne: !!t.salmonAirborne, reveal: t.revealedUntil > now + 2 }[e];
    assert(ok, `${e} applied`);
    applied.add(e);
    w.remove(t);
  }
}
assert.deepEqual([...applied].sort(), [...EFFECTS].sort(), 'every effect shows up');
const expected = shots / EFFECTS.length;
for (const e of EFFECTS) assert(Math.abs(counts[e] - expected) < expected * .2, `${e}: ${counts[e]} of ${shots} (expected about ${expected.toFixed(0)})`);
console.log('PASS CC round: 9 crowd controls, equal odds', Object.fromEntries(EFFECTS.map(e => [e, counts[e]])));
