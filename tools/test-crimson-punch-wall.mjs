// Crimson's 3-punch basic attack must not hit enemies behind a wall (same cover check as Red's punches).
// Her ultimate 「KO 스트레이트」 is intentionally untouched by this check.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const run = (w, s) => { for (let i = 0; i < Math.round(s * 240); i++) w.update(1 / 240); };
for (const [label, defs] of [['beta', applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))], ['season7', applyBeta7Balance(BETA_CHARACTERS)]]) {
  const d = defs.crimson;
  const full = Array.from({ length: d.attackCount }, (_, i) => d.attackDamages?.[i] ?? d.attackDamage).reduce((s, v) => s + v, 0);
  const duel = wall => {
    const w = createBeta6Combat(defs, { bounds: 40, seed: 1, aimError: 0, blocked: (x, z, r = 0) => wall && x > 1 - r && x < 1.4 + r && Math.abs(z) < 5 + r });
    const crimson = w.add('crimson', { automatic: false, team: 'a', x: 0, z: 0, next: 0 });
    const enemy = w.add('red', { automatic: false, team: 'b', x: 2.4, z: 0, next: 99 });
    enemy.hp = 1e6; enemy.d = { ...enemy.d, maxHealth: 1e6 };
    assert(w.fire(crimson, enemy, 0), `${label} crimson fires`);
    run(w, .6);
    return { crimson, dealt: 1e6 - enemy.hp };
  };
  const open = duel(false);
  assert.equal(open.dealt, full, `${label} all ${d.attackCount} punches land with no wall (${open.dealt} vs ${full})`);
  const covered = duel(true);
  assert.equal(covered.dealt, 0, `${label} wall blocks every punch (dealt ${covered.dealt})`);
  assert.equal(covered.crimson.charge, 0, `${label} blocked punches do not charge the ultimate`);
}
console.log('PASS Crimson punches: blocked by walls, all punches land in the open (beta and season 7 definitions).');
