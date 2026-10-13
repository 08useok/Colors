import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/config/characters.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
for (const key of ['damage', 'speed', 'duration', 'hitRadius', 'chargeRequired', 'rechargePerHit']) assert.equal(CHARACTERS.blue.ultimate[key], BETA_CHARACTERS.blue.special[key]);
const state = { running: true, gameTime: 0, players: [], solids: [], chopWoodMode: true };
const ctx = vm.createContext({ CURRENT_SEASON: "beta6", state, CHARACTERS, audio: { play() {} },
  THREE: { MathUtils: { clamp: (n, a, b) => Math.max(a, Math.min(b, n)) } },
  tempVec3: { set(x, y, z) { Object.assign(this, { x, y, z }); } },
  moveFighter(f, v, dt) { f.mesh.position.x += v.x * dt; f.mesh.position.z += v.z * dt; },
  applyDamage(f, n) { if (f.invulnerable) return 0; const dealt = Math.min(f.health, n); f.health -= dealt; return dealt; },
  areSameTeam: (a, b) => a.team === b.team,
  createBulletHitEffect() {}, ULTIMATE_CHARACTERS: new Set(['blue']),
});
for (const name of ['intersectsRect', 'tryUseBlueUltimate', 'updateBlueDashes', 'tryUseUltimate']) {
  const start = source.indexOf(`function ${name}(`); assert(start >= 0);
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), ctx);
}
const make = (id, z, team = 0) => ({ id, characterType: 'blue', health: 4800, yaw: 0, radius: 1.05, team,
  mesh: { position: { x: 0, y: 0, z }, rotation: {} }, blueUltimateCharge: 0 });
const player = make(1, 0), enemy = make(2, 1, 1), ally = make(3, 1);
state.players = [player, enemy, ally];
assert.equal(ctx.tryUseUltimate(player), false);
player.blueUltimateCharge = 4; player.mintFrozenUntil = 2;
assert.equal(ctx.tryUseUltimate(player), false); assert.equal(player.blueUltimateCharge, 4);
player.mintFrozenUntil = 0;
assert.equal(ctx.tryUseUltimate(player), true); assert.equal(player.blueUltimateCharge, 0);
assert.equal(ctx.tryUseUltimate(player), false);
ctx.updateBlueDashes(1 / 60);
assert.equal(enemy.health, 3200); assert.equal(ally.health, 4800); assert(enemy.blueKnockback.z > 0);
assert.equal(player.blueUltimateCharge, 0.33, 'dash damage recharges the next ultimate');
ctx.updateBlueDashes(1 / 60); assert.equal(enemy.health, 3200);
assert.equal(player.blueUltimateCharge, 0.33, 'same enemy recharges once per dash');
// A thin wall must reflect a high-speed dash without tunneling.
state.solids = [{ x: 0, z: 3, width: 20, depth: 0.2 }];
ctx.updateBlueDashes(0.2);
assert(player.blueDash.bounces > 0); assert(player.blueDash.z < 0); assert(player.mesh.position.z < 3);
player.malfunctionUntil = 2; ctx.updateBlueDashes(0.01); assert.equal(player.blueDash, null);
player.malfunctionUntil = 0; player.blueUltimateCharge = 4; state.solids = []; state.players = [player];
ctx.tryUseUltimate(player); const startZ = player.mesh.position.z;
ctx.updateBlueDashes(2);
assert.equal(player.blueDash, null);
assert(Math.abs(Math.abs(player.mesh.position.z - startZ) - 24 * 1.15) < 1e-8);
assert.equal(player.blueUltimateCharge, 0, 'missing enemies does not recharge');
player.mesh.position.z = 0; enemy.mesh.position.z = .8; enemy.invulnerable = true;
state.players = [player, enemy]; player.blueUltimateCharge = 4; ctx.tryUseUltimate(player);
ctx.updateBlueDashes(1 / 60); assert.equal(player.blueUltimateCharge, 0, 'no damage means no recharge');
enemy.invulnerable = false; player.blueDash = null; player.mesh.position.z = 0;
player.blueUltimateCharge = 4; ctx.tryUseUltimate(player); player.blueUltimateCharge = 4;
ctx.updateBlueDashes(1 / 60); assert.equal(player.blueUltimateCharge, 4, 'charge is capped');
player.blueUltimateCharge = 4; ctx.tryUseUltimate(player); player.dead = true;
ctx.updateBlueDashes(0.1); assert.equal(player.blueDash, null);
assert.match(source, /proj\.isBullet && !proj\.isMintIce && attacker\?\.characterType === "blue" && dealt > 0/);
assert.match(source, /player\.characterType === "blue" \? \(player\.blueUltimateCharge/);
console.log('Blue checks passed: beta settings, charge gate, input dispatch, freeze lock, damage once, allies, knockback, wall bounce, duration and death cleanup.');

// Exercise the separate beta practice dash, which does not use the combat simulator.
const betaSource = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const betaTarget = { visible: true, position: { x: 0, z: .5 }, userData: { health: 10000 } };
const betaAlly = { visible: true, position: { x: 0, z: .5 }, userData: { health: 10000, isAlly: true } };
const betaCtx = vm.createContext({ BETA_CHARACTERS,
  blueDashState: null, blueSpecialCharge: 4, IS_BETA5_TEST: false, HAS_BETA6_CONTENT: true,
  goldRushState: { dead: false }, betaState: { selectedCharacter: 'blue' },
  player: { position: { x: 0, y: 1.7, z: 0, set(x,y,z) { Object.assign(this,{x,y,z}); } }, rotation: { y: 0 } },
  beta6PlayerAttackBlocked: () => false, getArenaSolids: () => [],
  testTargets: [betaTarget, betaAlly], attackComboState: {}, canvas: { dataset: {} },
  updateCrimsonUltimateGauge() {}, createGroundPulse() {},
  damageTarget(target, damage) { if (!target.userData.invulnerable) target.userData.health -= damage; },
});
for (const name of ['performBlueDash', 'updateBlueDash']) {
  const start = betaSource.indexOf(`function ${name}(`);
  vm.runInContext(betaSource.slice(start, betaSource.indexOf('\n}', start) + 2), betaCtx);
}
betaCtx.performBlueDash(); assert.equal(betaCtx.blueSpecialCharge, 0);
betaCtx.updateBlueDash(1/60);
assert.equal(betaCtx.blueSpecialCharge, 0.33);
assert.equal(betaAlly.userData.health, 10000);
betaCtx.updateBlueDash(1/60); assert.equal(betaCtx.blueSpecialCharge, 0.33);
betaCtx.blueDashState = null; betaCtx.player.position.z = 0;
betaCtx.blueSpecialCharge = 4; betaTarget.userData.invulnerable = true;
betaCtx.performBlueDash(); betaCtx.updateBlueDash(1/60);
assert.equal(betaCtx.blueSpecialCharge, 0, 'beta practice requires actual damage');
betaCtx.blueDashState = null; betaCtx.player.position.z = 0;
betaCtx.blueSpecialCharge = 4; betaTarget.userData.invulnerable = false;
betaCtx.performBlueDash(); betaCtx.blueSpecialCharge = 4; betaCtx.updateBlueDash(1/60);
assert.equal(betaCtx.blueSpecialCharge, 4, 'beta practice caps recharge');
console.log('Beta practice: dash hit recharge, once per target, allies, no-damage hit and charge cap passed.');

const { createBeta6Combat } = await import('../src/combat/beta6-combat.js');
const { applyBeta6Balance } = await import('../src/config/beta6-balance.js');
const world = createBeta6Combat(applyBeta6Balance(), { bounds: 40, aimError: 0 });
const blue = world.add('blue', { automatic: false, charge: 3, x: 0, z: 0 });
const opponent = world.add('orange', { automatic: false, x: 1, z: 0 });
assert(world.cast(blue, opponent, { angle: 0 }));
world.update(1/60);
assert.equal(blue.charge, 0.33, 'actual beta combat and simulator use fractional dash recharge');
world.update(1/60);
assert.equal(blue.charge, 0.33, 'simulator does not repeat charge against the same target');
console.log('Beta combat/simulation: 0.33-unit dash recharge passed.');
