// Ground-targeted ultimates (Ivory, Mint, Raspberry) must land on the point aimed at cast time,
// even when the caster keeps moving during the ultimate's cast motion (motionWindup).
import assert from 'node:assert/strict';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta8Balance } from '../src/config/beta8-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';
import { RASPBERRY_CHARACTER } from '../src/config/raspberry.js';
import { BETA_ULTIMATE_MOTIONS } from '../src/config/beta-ultimate-motion.js';

const defs = applyBeta8Balance(applyBeta7Balance(BETA_CHARACTERS));
// Same wiring as beta-season.js: Raspberry joins with its ultimate motion release as the cast motion.
defs.raspberry = structuredClone(RASPBERRY_CHARACTER);
defs.raspberry.ultimate.motionWindup = BETA_ULTIMATE_MOTIONS.raspberry.release;
const near = (p, q, label) => assert(Math.hypot(p.x - q.x, p.z - q.z) < 1e-6, `${label}: (${p.x.toFixed(3)}, ${p.z.toFixed(3)}) ≠ (${q.x}, ${q.z})`);

for (const id of ['ivory', 'mint', 'raspberry']) {
  const config = structuredClone(defs);
  const ult = config[id].special ?? config[id].ultimate;
  ult.motionWindup ||= .25;
  const w = createBeta6Combat(config, { bounds: 40 });
  const caster = w.add(id, { automatic: false, team: 'a', x: -10, z: 0, next: 99 });
  const enemy = w.add('red', { automatic: false, team: 'b', x: 20, z: 20, next: 99 });
  assert(caster.u.motionWindup > 0, `${id} has a cast motion`);
  caster.charge = caster.u.chargeRequired;
  const point = { x: -7, z: 1 };
  assert(w.cast(caster, enemy, { point, angle: Math.atan2(point.z, point.x + 10) }), `${id} cast`);
  // Player walks sideways during the cast motion.
  for (let i = 0; i < 60 * 2; i++) { if (caster.ultimatePreparing) { caster.x += .1; caster.z -= .08; } w.update(1 / 60); }
  assert(caster.x > -9, `${id} moved during the cast motion`);
  if (id === 'ivory') {
    const center = w.projectiles.find(p => p.kind === 'ivory' && p.ultimate);
    // Projectiles may already have landed; use the recorded fields if still in flight, else the zone.
    const landing = center ? { x: center.origin.x + Math.cos(center.yaw) * center.reach, z: center.origin.z + Math.sin(center.yaw) * center.reach }
      : w.zones.filter(z => z.owner === caster).sort((a, b) => Math.hypot(a.x - point.x, a.z - point.z) - Math.hypot(b.x - point.x, b.z - point.z))[0];
    near(landing, point, 'ivory center impact');
  } else {
    const zone = w.zones.find(z => z.owner === caster && ['mint', 'vinePrison', 'vinePrisonWarning'].includes(z.kind));
    assert(zone, `${id} zone exists`);
    near(zone, point, `${id} zone`);
  }
}
console.log('ground ultimate aim lock: ok');
