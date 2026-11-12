// Ivory 11.12: the basic attack's ice-cream zone is 3.5 tiles, the ultimate's zones keep 4 tiles; range 9.5.
import assert from 'node:assert/strict';
import { season9CycleConfig } from './beta9-cycle-definitions.mjs';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const defs = season9CycleConfig();
assert.equal(defs.ivory.iceCreamZoneRadius, 3.5);
assert.equal(defs.ivory.ultimate.zoneRadius, 4);
assert.equal(defs.ivory.iceCreamRange, 9.5);
const zoneRadius = ultimate => {
  const w = createBeta6Combat(defs, { seed: 1, aimError: 0, bounds: 40 });
  const a = w.add('ivory', { automatic: false, x: 0, next: 0, charge: ultimate ? 99 : 0 });
  const b = w.add('red', { automatic: false, x: 6, team: 'b' });
  if (ultimate) w.cast(a, b); else w.fire(a, b);
  for (let f = 0; f < 120 && !w.zones.some(z => z.kind === 'ivory'); f++) w.update(1 / 60);
  const zone = w.zones.find(z => z.kind === 'ivory');
  assert(zone, ultimate ? 'ultimate leaves zones' : 'basic attack leaves a zone');
  return zone.radius;
};
assert.equal(zoneRadius(false), 3.5, 'basic attack zone');
assert.equal(zoneRadius(true), 4, 'ultimate zones keep 4 tiles');
assert(defs.ivory.basicAttack.description.includes('반경 3.5타일') && defs.ivory.basicAttack.description.includes('0~9.5타일'));
console.log('PASS Ivory zone: basic 3.5 tiles, ultimate 4 tiles, range 9.5, description updated.');
