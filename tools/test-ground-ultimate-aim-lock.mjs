// Ground-targeted ultimates (Ivory, Mint, Raspberry, Purple's landing, Yellow's device) must land on the
// point aimed at cast time, even when the caster keeps moving during the ultimate's cast motion (motionWindup).
// Players aim at a point; bots aim at their target. Both go through the same engine cast().
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

function setup(id, automatic, point) {
  const config = structuredClone(defs);
  const ult = config[id].special ?? config[id].ultimate;
  ult.motionWindup ||= .25;
  const w = createBeta6Combat(config, { bounds: 40 });
  const caster = w.add(id, { automatic, team: 'a', x: -10, z: 0, next: 99 });
  // Bots cast at their target, so the target stands on the aimed point; players aim at the point directly.
  const enemy = w.add('red', automatic ? { automatic: false, team: 'b', ...point, next: 99 } : { automatic: false, team: 'b', x: 20, z: 20, next: 99 });
  enemy.hp = 1e6; enemy.d = { ...enemy.d, maxHealth: 1e6 };
  assert(caster.u.motionWindup > 0, `${id} has a cast motion`);
  caster.charge = caster.u.chargeRequired;
  const aim = automatic ? {} : { point, angle: Math.atan2(point.z, point.x + 10) };
  assert(w.cast(caster, enemy, aim), `${id} ${automatic ? 'bot' : 'player'} cast`);
  return { w, caster, enemy };
}
// Walk sideways during the cast motion, then let the ultimate resolve.
function walkThroughCast(w, caster, stop = () => false) {
  const start = { x: caster.x, z: caster.z };
  for (let i = 0; i < 60 * 2 && !stop(); i++) { if (caster.ultimatePreparing) { caster.x += .1; caster.z -= .08; } w.update(1 / 60); }
  return Math.hypot(caster.x - start.x, caster.z - start.z);
}

for (const automatic of [false, true]) {
  const who = automatic ? 'bot' : 'player';
  for (const id of ['ivory', 'mint', 'raspberry']) {
    const point = { x: -7, z: 1 };
    const { w, caster } = setup(id, automatic, point);
    assert(walkThroughCast(w, caster) > 1, `${id} ${who} moved during the cast motion`);
    if (id === 'ivory') {
      const center = w.projectiles.find(p => p.kind === 'ivory' && p.ultimate);
      // Projectiles may already have landed; use the recorded fields if still in flight, else the closest zone.
      const landing = center ? { x: center.origin.x + Math.cos(center.yaw) * center.reach, z: center.origin.z + Math.sin(center.yaw) * center.reach }
        : w.zones.filter(z => z.owner === caster).sort((a, b) => Math.hypot(a.x - point.x, a.z - point.z) - Math.hypot(b.x - point.x, b.z - point.z))[0];
      near(landing, point, `ivory ${who} center impact`);
    } else {
      const zone = w.zones.find(z => z.owner === caster && ['mint', 'vinePrison', 'vinePrisonWarning'].includes(z.kind));
      assert(zone, `${id} ${who} zone exists`);
      near(zone, point, `${id} ${who} zone`);
    }
  }
  {
    // Purple's leap lands on the aimed point.
    const point = { x: -5, z: 2 };
    const { w, caster: purple } = setup('purple', automatic, point);
    let leap = null;
    walkThroughCast(w, purple, () => (leap = purple.leap));
    assert(leap, `purple ${who} leaps`);
    assert(Math.hypot(leap.from.x + 10, leap.from.z) > 1, `purple ${who} moved during the cast motion`);
    near(leap.to, point, `purple ${who} landing`);
  }
}
{
  // Yellow (player): the device goes on the aimed point. Bots alternate a ±2.5 offset by design.
  const point = { x: -4, z: 2 };
  const { w, caster: yellow } = setup('yellow', false, point);
  assert(walkThroughCast(w, yellow) > 1, 'yellow moved during the cast motion');
  assert.equal(yellow.devices.length, 1, 'yellow device placed');
  near(yellow.devices[0], point, 'yellow device');
}
console.log('ground ultimate aim lock: ok (Ivory, Mint, Raspberry, Purple for player and bot; Yellow device)');
