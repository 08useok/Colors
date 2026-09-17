import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/config/characters.js';
import { BETA_CHARACTERS } from '../src/config/beta-characters.js';
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
for (const key of ['damage', 'speed', 'duration', 'hitRadius', 'chargeRequired']) assert.equal(CHARACTERS.blue.ultimate[key], BETA_CHARACTERS.blue.special[key]);
const state = { running: true, gameTime: 0, players: [], solids: [], chopWoodMode: true };
const ctx = vm.createContext({ state, CHARACTERS, audio: { play() {} },
  THREE: { MathUtils: { clamp: (n, a, b) => Math.max(a, Math.min(b, n)) } },
  tempVec3: { set(x, y, z) { Object.assign(this, { x, y, z }); } },
  moveFighter(f, v, dt) { f.mesh.position.x += v.x * dt; f.mesh.position.z += v.z * dt; },
  applyDamage(f, n) { f.health -= n; }, createBulletHitEffect() {}, ULTIMATE_CHARACTERS: new Set(['blue']),
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
ctx.updateBlueDashes(1 / 60); assert.equal(enemy.health, 3200);
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
player.blueUltimateCharge = 4; ctx.tryUseUltimate(player); player.dead = true;
ctx.updateBlueDashes(0.1); assert.equal(player.blueDash, null);
assert.match(source, /proj\.isBullet && !proj\.isMintIce && attacker\?\.characterType === "blue" && dealt > 0/);
assert.match(source, /player\.characterType === "blue" \? \(player\.blueUltimateCharge/);
console.log('Blue checks passed: beta settings, charge gate, input dispatch, freeze lock, damage once, allies, knockback, wall bounce, duration and death cleanup.');
