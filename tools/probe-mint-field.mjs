// Measures how Mint's ice field moves a stationary enemy: outward drift, exit time, damage and ice.
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
const rows = [];
for (const [label, start, wall] of [['centre', 0.01, null], ['3 tiles out', 3, null], ['7 tiles out', 7, null], ['centre, wall at 4', 0.01, 4]]) {
  const w = createBeta6Combat(defs, { bounds: 40, blocked: wall ? (x, z, r) => x + r >= wall : undefined });
  const mint = w.add('mint', { automatic: false, team: 'a', x: 0, z: -6, next: 0 });
  const t = w.add('red', { automatic: false, team: 'b', x: start, z: 0, hp: 1e6 }); t.d = { ...t.d, maxHealth: 1e6 };
  mint.charge = mint.u.chargeRequired;
  if (!w.cast(mint, t, { angle: Math.atan2(0 - mint.z, 0 - mint.x), point: { x: 0, z: 0 } })) throw new Error('cast failed');
  let exitAt = null, frozen = false; const hp0 = t.hp;
  for (let i = 0; i < 60 * 11; i++) { w.update(1 / 60); if (exitAt == null && Math.hypot(t.x, t.z) > mint.u.radius) exitAt = +w.time.toFixed(2); if (w.time < t.frozenUntil) frozen = true; }
  rows.push({ label, exitAt: exitAt ?? 'stays', finalX: +t.x.toFixed(2), damage: Math.round(hp0 - t.hp), ice: t.ice, frozen });
}
console.table(rows);
