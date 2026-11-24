// Purple's leap locks her actions for the leap only. Landing must release just that lock:
// a longer stun/freeze received mid-air (e.g. Red's stun shockwave, CC round stun) must survive the landing.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const run = (w, s) => { for (let i = 0; i < Math.round(s * 240); i++) w.update(1 / 240); };
// Beta/official (with the cast motion) and the main-style season 7 definitions (no cast motion).
for (const [label, defs] of [['beta', applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))], ['season7', applyBeta7Balance(BETA_CHARACTERS)]]) {
  const windup = defs.purple.ultimate.motionWindup ?? 0;
  const setup = () => {
    const w = createBeta6Combat(defs, { bounds: 40 });
    const purple = w.add('purple', { automatic: false, team: 'a', x: 0, z: 0, next: 99 });
    const enemy = w.add('red', { automatic: false, team: 'b', x: 20, z: 20, next: 99 });
    enemy.hp = 1e6; enemy.d = { ...enemy.d, maxHealth: 1e6 };
    purple.charge = purple.u.chargeRequired;
    assert(w.cast(purple, enemy, { point: { x: 6, z: 0 }, angle: 0 }), `${label} purple cast`);
    run(w, windup + .05);
    assert(purple.leap, `${label} purple is leaping`);
    return { w, purple, duration: purple.leap.duration };
  };
  {
    // A 2 s stun received 0.2 s into the leap outlasts the landing.
    const { w, purple, duration } = setup();
    run(w, .15);
    const stunUntil = w.time + 2;
    purple.lockUntil = Math.max(purple.lockUntil, stunUntil);
    run(w, duration);
    assert(!purple.leap, `${label} purple landed`);
    assert(Math.abs(purple.lockUntil - stunUntil) < 1e-9, `${label} stun kept after landing: lockUntil ${purple.lockUntil.toFixed(3)} vs ${stunUntil.toFixed(3)}`);
    assert(w.time < purple.lockUntil, `${label} still stunned right after landing`);
  }
  {
    // Without a stun, landing frees Purple at once.
    const { w, purple, duration } = setup();
    run(w, duration + .05);
    assert(!purple.leap, `${label} purple landed`);
    assert(purple.lockUntil <= w.time + 1e-9, `${label} free to act after a clean landing`);
  }
  {
    // A freeze received mid-air is untouched by the landing.
    const { w, purple, duration } = setup();
    run(w, .1);
    const frozenUntil = w.time + 1.5;
    purple.frozenUntil = frozenUntil;
    run(w, duration);
    assert.equal(purple.frozenUntil, frozenUntil, `${label} freeze kept after landing`);
  }
}
console.log('PASS Purple leap: landing releases only the leap lock; mid-air stun and freeze survive (beta and season 7 definitions).');
