// 체공 무적 (11.26): Purple 독성 대도약, Salmon catch, and Chartreuse CC round lift make the airborne actor
// invulnerable (no damage, no crowd control) until it lands. Salmon's landing damage and poison applied before
// the lift still apply.
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { applyBeta9Balance } from '../src/config/beta9-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const run = (w, t) => { for (let i = 0; i < Math.round(t * 240); i++) w.update(1 / 240); };
for (const [label, defs] of [['main', applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS))], ['beta', applyBeta9Balance(applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS)))]]) {
  defs.purple.purpleUltimateEnabled = true; defs.purple.ultimate.motionWindup = 0;
  { // Purple leap: no damage or stun in the air, damageable again after landing.
    const w = createBeta6Combat(defs, { bounds: 40 });
    const p = w.add('purple', { automatic: false, team: 1, charge: 8, hp: 50000 }), r = w.add('red', { automatic: false, team: 2, x: 20, hp: 50000 });
    assert(w.cast(p, r, { point: { x: 8, z: 0 }, angle: 0 }), `${label}: cast`);
    run(w, .3); assert(p.leap, `${label}: in the air`);
    assert.equal(w.hit(r, p, 1000), 0, `${label}: no damage mid-leap`);
    run(w, .6); assert(!p.leap, `${label}: landed`);
    assert.equal(w.hit(r, p, 1000), 1000, `${label}: damageable after landing`);
  }
  { // Poison applied before the leap keeps ticking in the air.
    const w = createBeta6Combat(defs, { bounds: 40 });
    const p = w.add('purple', { automatic: false, team: 1, charge: 8, hp: 50000 }), e = w.add('purple', { automatic: false, team: 2, x: 20, hp: 50000 });
    p.poisonOwner = e; p.poisonUntil = w.time + 4; p.poisonNext = w.time + .1;
    assert(w.cast(p, e, { point: { x: 8, z: 0 }, angle: 0 }), `${label}: poisoned cast`);
    run(w, .3); assert(p.leap, `${label}: poisoned purple in the air`);
    assert.equal(p.hp, 50000 - e.d.poisonDPS, `${label}: poison tick lands mid-leap`);
    assert.equal(w.hit(e, p, 1000), 0, `${label}: other damage still blocked`);
  }
  { // Salmon catch: invulnerable in the air, landing damage still lands.
    const w = createBeta6Combat(defs, { bounds: 30 });
    const s = w.add('salmon', { automatic: false, next: 0, team: 'a' }), b = w.add('red', { x: 7, team: 'b', automatic: false, hp: 100000 });
    assert(w.fire(s, b)); for (let i = 0; i < 240 && !b.salmonAirborne; i++) w.update(1 / 240);
    assert(b.salmonAirborne, `${label}: caught`);
    const before = b.hp; assert.equal(w.hit(s, b, 500), 0, `${label}: no damage while caught`);
    run(w, b.salmonAirborne.duration + .1); assert(!b.salmonAirborne, `${label}: landed`);
    assert.equal(before - b.hp, defs.salmon.landingDamage, `${label}: landing damage applies`);
    assert.equal(w.hit(s, b, 500), 500, `${label}: damageable after landing`);
  }
  { // Chartreuse CC round lift: find a seed whose CC round rolls "airborne".
    let found = false;
    for (let seed = 1; seed < 400 && !found; seed++) {
      let lifted = null;
      const w = createBeta6Combat(defs, { bounds: 30, seed, onEvent: e => { if (e.type === 'ccRound' && e.effect === 'airborne') lifted = e.target; } });
      const c = w.add('chartreuse', { automatic: false, next: 0, team: 'a' }), b = w.add('red', { x: 4, team: 'b', automatic: false, hp: 100000 });
      for (let shot = 0; shot < 12 && !lifted; shot++) { c.ammo = c.d.maxAmmo; c.next = 0; w.fire(c, b); run(w, .5); }
      if (!lifted || !b.salmonAirborne) continue;
      found = true;
      assert.equal(w.hit(c, b, 500), 0, `${label}: no damage while lifted`);
      run(w, 1.1); assert(!b.salmonAirborne, `${label}: landed`);
      assert.equal(w.hit(c, b, 500), 500, `${label}: damageable after landing`);
    }
    assert(found, `${label}: a CC round lifted the target`);
  }
}
console.log('PASS Airborne invulnerability: Purple leap, Salmon catch and Chartreuse lift take no damage in the air; Salmon landing damage still applies (main and beta definitions).');
