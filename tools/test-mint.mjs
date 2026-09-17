// Execute the actual main.js combat functions without DOM/WebGL or a browser.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/config/characters.js';
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
function extract(name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0);
  return source.slice(start, source.indexOf('\n}', start) + 2);
}
class Mesh {
  constructor() { this.position = { set(x, y, z) { Object.assign(this, { x, y, z }); } }; this.rotation = {}; }
}
const state = { gameTime: 0, running: true, players: [], mintZones: [], chopWoodMode: true };
let moved = 0, disposed = 0;
const ctx = vm.createContext({ CHARACTERS, state, baseMoveSpeed: 10.4,
  THREE: { Mesh, CircleGeometry: class {}, MeshBasicMaterial: class {}, DoubleSide: 2 },
  scene: { add() {} }, audio: { play() {} },
  tempVec3: { set(x, y, z) { Object.assign(this, { x, y, z }); } },
  moveFighter() { moved++; }, disposeSceneObject() { disposed++; },
  applyDamage(f, n) { f.health -= n; }, ULTIMATE_CHARACTERS: new Set(['mint']),
});
for (const name of ['applyMintIce', 'applyMintBulletHit', 'tryUseMintUltimate', 'updateMintZones', 'getMoveSpeed', 'beginAttackCore', 'tryUseUltimate']) vm.runInContext(extract(name), ctx);
const fighter = (id, team) => ({ id, team, characterType: 'mint', health: 6600, dead: false, yaw: 0, mesh: { position: { x: 0, z: 0 } } });
const owner = fighter(1, 0), enemy = fighter(2, 1), ally = fighter(3, 0);
for (let i = 0; i < 3; i++) ctx.applyMintIce(enemy, 25);
assert.equal(enemy.mintIce, 75); assert.equal(enemy.mintFrozenUntil, undefined);
ctx.applyMintIce(enemy, 25);
assert.equal(enemy.mintIce, 0); assert.equal(enemy.mintFrozenUntil, 2);
assert.equal(ctx.getMoveSpeed(enemy), 0);
assert.equal(ctx.beginAttackCore(enemy), false);
enemy.mintUltimateCharge = 7;
assert.equal(ctx.tryUseUltimate(enemy), false); assert.equal(enemy.mintUltimateCharge, 7);
state.gameTime = 2;
assert.equal(ctx.getMoveSpeed(enemy), 10.4 * 1.05);
assert.equal(ctx.tryUseMintUltimate(owner), false);
owner.mintUltimateCharge = 7;
assert.equal(ctx.tryUseUltimate(owner), true); assert.equal(owner.mintUltimateCharge, 0);
assert.equal(state.mintZones.length, 1); assert.equal(state.mintZones[0].z, 10);
enemy.mesh.position.z = 11; ally.mesh.position.z = 11;
state.players = [owner, enemy, ally];
const hp = enemy.health;
ctx.updateMintZones(1 / 60);
assert.equal(enemy.health, hp - 300); assert.equal(enemy.mintIce, 5);
assert.equal(ally.health, 6600); assert.equal(owner.health, 6600); assert.equal(moved, 1);
ctx.updateMintZones(1 / 60); assert.equal(enemy.health, hp - 300);
enemy.mintFrozenUntil = 4; const before = moved;
state.gameTime = 3; ctx.updateMintZones(1 / 60); assert.equal(moved, before);
assert.equal(enemy.health, hp - 600);
state.gameTime = 12; ctx.updateMintZones(1 / 60);
assert.equal(state.mintZones.length, 0); assert.equal(disposed, 1);
enemy.dead = true; const ice = enemy.mintIce; ctx.applyMintIce(enemy, 25); assert.equal(enemy.mintIce, ice);
const attacker = fighter(4, 0), victim = fighter(5, 1);
ctx.applyMintBulletHit(attacker, victim, 0); assert.equal(attacker.mintUltimateCharge, undefined);
for (let i = 0; i < 10; i++) ctx.applyMintBulletHit(attacker, victim, 700);
assert.equal(attacker.mintUltimateCharge, 7);
assert.match(source, /if \(proj\.isMintIce\)[\s\S]*?applyMintBulletHit\(attacker, target, dealt\)/);
assert.match(source, /new Set\(\[[^\n]+"mint"\]\)/);
console.log('Mint main combat checks passed: ice threshold, freeze/expiry, action locks, charge, field damage, ally exclusion, sliding, cleanup.');
