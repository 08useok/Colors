import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
import { applyBeta7Balance } from '../src/config/beta7-balance.js';
import { applyBeta6Balance, beta6Ultimate } from '../src/config/beta6-balance.js';
import { createBeta6Combat } from '../src/combat/beta6-combat.js';

const original = structuredClone(BETA_CHARACTERS);
const config = applyBeta7Balance(BETA_CHARACTERS);
const amounts = { orange: .33, lavender: .05, ivory: .1, mint: .33, blue: .33 };
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} vs ${expected}`);
for (const [id, amount] of Object.entries(amounts)) {
  close(beta6Ultimate(config[id], id).rechargePerHit, amount, `${id} config`);
}
assert.deepEqual(BETA_CHARACTERS, original, 'base shared with main remains unchanged');
assert.equal(beta6Ultimate(applyBeta6Balance(original).mint, 'mint').rechargePerHit, undefined, 'season 6 unchanged');

function probe(id, count, ultimate, seconds) {
  const events = [];
  const world = createBeta6Combat(config, { bounds: 40, aimError: 0, seed: 123, onEvent(e) { if (e.type === 'damage') events.push(e); } });
  const owner = world.add(id, { automatic: false, team: 1, next: 0, charge: ultimate ? beta6Ultimate(config[id], id).chargeRequired : 0 });
  const targets = Array.from({ length: count }, (_, i) => world.add('red', { automatic: false, team: 2, x: 2, z: (i - (count - 1) / 2) * .15, hp: 1e7 }));
  assert(ultimate ? world.cast(owner, targets[0], { angle: 0 }) : world.fire(owner, targets[0], 0));
  if (ultimate) assert.equal(owner.charge, 0, `${id} spends gauge before damage`);
  for (let i = 0; i < Math.ceil(seconds * 60); i++) world.update(1 / 60);
  const hits = events.filter(e => e.owner === owner).length;
  assert(hits > 0, `${id} really hits`);
  close(owner.charge, Math.min(owner.u.chargeRequired, ultimate ? hits * amounts[id] : id === 'orange' ? 1 : hits), `${id} actual hit recharge`);
  return { owner, world, targets };
}
for (const id of ['orange', 'lavender', 'ivory', 'mint']) {
  probe(id, 1, true, 12);
  probe(id, 3, true, 12);
  probe(id, 1, false, .8);
}
const firstTick = probe('lavender', 6, true, 1 / 60);
close(firstTick.owner.charge, .3, 'six enemies cannot instantly refill');
const fullField = probe('lavender', 6, true, 12);
close(fullField.owner.charge, 1.8, 'six enemies for full duration stay below full gauge');

const immune = createBeta6Combat(config, { bounds: 40 });
const caster = immune.add('lavender', { automatic: false, team: 1, charge: 6 });
const target = immune.add('red', { automatic: false, team: 2, x: 2, invulnerableUntil: 20 });
immune.cast(caster, target, { angle: 0 });
for (let i = 0; i < 360; i++) immune.update(1 / 60);
assert.equal(caster.charge, 0, 'no damage means no recharge');
// Run the actual practice zone loop, including mixed normal/ultimate puddles.
const source = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8');
const practiceLoop = source.slice(source.indexOf('  const dueIvoryZoneTargets = new Map();'), source.indexOf('  canvas.dataset.mintIceZones = String(mintIceZones.length);'));
assert(practiceLoop.length > 1000);
function practice(ivoryKinds, immune = false) {
  const enemy = { visible: true, position: { x: 0, z: 0 }, userData: { health: 100000, mintFrozenUntil: 100 } };
  const zone = fromUltimate => ({ x: 0, z: 0, radius: 5, expiresAt: 10, nextTickAt: 1, fromUltimate, puddle: { material: {}, scale: { setScalar() {} } } });
  const sandbox = { BETA_CHARACTERS: config, testTargets: [enemy], ivoryIceCreamZones: ivoryKinds.map(zone),
    mintIceZones: [{ x: 0, z: 0, radius: 5, expiresAt: 10, nextTickAt: 1, startedAt: 0, slideStrength: 0, slideAcceleration: 0, mesh: { rotation: { z: 0 } } }],
    clock: { elapsedTime: 1 }, dt: 1 / 60, canvas: { dataset: {} }, player: { position: { x: 0, z: 0 } },
    betaState: { selectedCharacter: 'mint' }, mintUltimateCharge: 0, ivoryCharge: 0,
    betaEventBushHidden() { return false; }, applyMintIce() {}, updateCrimsonUltimateGauge() {},
    damageTarget(t, amount) { if (!immune) t.userData.health -= amount; } };
  vm.createContext(sandbox);
  vm.runInContext('function chargeIvoryUltimate(amount) { ivoryCharge += amount; }' + practiceLoop, sandbox);
  return sandbox;
}
close(practice([true]).ivoryCharge, .1, 'ultimate practice tick');
close(practice([false]).ivoryCharge, 1, 'normal practice tick');
for (const order of [[true, false], [false, true]]) {
  const result = practice(order);
  close(result.ivoryCharge, 1, 'overlap charges normal once in either order');
  close(result.testTargets[0].userData.health, 100000 - config.ivory.iceCreamZoneDamage - config.mint.special.damagePerSecond, 'overlap damage stays unstacked');
  close(result.mintUltimateCharge, .33, 'mint practice matches battle');
}
close(practice([true], true).mintUltimateCharge, 0, 'immune practice target gives no mint charge');
close(practice([true], true).ivoryCharge, 0, 'immune practice target gives no ivory charge');
console.log('PASS: beta-only tuning, spend before hits, normal attack charge, multi-target recharge and invulnerability.');
