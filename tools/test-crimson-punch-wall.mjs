// Red's double punch and Crimson's 3-punch basic attack must not hit enemies behind a wall
// (cover checked per punch at impact). Crimson's ultimate 「KO 스트레이트」 is intentionally untouched.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const run = (w, s) => { for (let i = 0; i < Math.round(s * 240); i++) w.update(1 / 240); };
for (const [label, defs] of [['beta', applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))], ['season7', applyBeta7Balance(BETA_CHARACTERS)]]) {
  for (const id of ['crimson', 'red']) {
    const d = defs[id];
    const full = Array.from({ length: d.attackCount }, (_, i) => d.attackDamages?.[i] ?? d.attackDamage).reduce((s, v) => s + v, 0);
    const duel = wall => {
      const w = createBeta6Combat(defs, { bounds: 40, seed: 1, aimError: 0, blocked: (x, z, r = 0) => wall && x > 1 - r && x < 1.4 + r && Math.abs(z) < 5 + r });
      const puncher = w.add(id, { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
      const enemy = w.add('blue', { automatic: false, team: 'b', x: 2.4, z: 0, next: 99 });
      enemy.hp = 1e6; enemy.d = { ...enemy.d, maxHealth: 1e6 };
      assert(w.fire(puncher, enemy, 0), `${label} ${id} fires`);
      run(w, .6);
      return { puncher, dealt: 1e6 - enemy.hp };
    };
    const open = duel(false);
    assert.equal(open.dealt, full, `${label} ${id}: all ${d.attackCount} punches land with no wall (${open.dealt} vs ${full})`);
    const covered = duel(true);
    assert.equal(covered.dealt, 0, `${label} ${id}: wall blocks every punch (dealt ${covered.dealt})`);
    assert.equal(covered.puncher.charge, 0, `${label} ${id}: blocked punches do not charge the ultimate`);
  }
}
console.log('PASS Red and Crimson punches: blocked by walls, all punches land in the open (beta and season 7 definitions).');
