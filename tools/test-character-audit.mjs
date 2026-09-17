import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/config/characters.js';
const source = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const state = { gameTime: 10, running: true, players: [], projectiles: [], chopWoodMode: true };
let relays = 0;
const ctx = vm.createContext({ state, CHARACTERS, createHealEffect() {},
  isInBush: () => true, createBoomerangMesh: () => ({}), audio: { play() {} },
  setGreenConcealedVisual(f, concealed) { f.greenConcealedVisual = concealed; },
  getPlayer: () => state.players[0], bushStealthRevealRangeSq: 9,
  isVisibleThroughBush: () => true,
  mpConfig: { isHost: false }, mp: { relay() { relays++; } }, flashHitMarker() {} });
for (const name of ['applyDamage', 'updatePinkRevives', 'tryUsePinkUltimate', 'beginBoomerangAttack', 'isFighterVisible', 'chooseBotTarget']) {
  const start = source.indexOf(`function ${name}(`);
  vm.runInContext(source.slice(start, source.indexOf('\n}', start) + 2), ctx);
}
const make = (id, team) => ({ id, team, characterType: 'pink', dead: false, health: 100, maxHealth: 100,
  mesh: { position: { x: 0, z: 0 } }, shadow: {}, healthBar: {} });
const pink = make(1, 0), ally = make(2, 0), enemy = make(3, 1);
pink.pinkUltimateCharge = 15; ally.dead = true;
state.players = [pink, ally, enemy];
assert.equal(ctx.tryUsePinkUltimate(pink), true);
assert.equal(ally.dead, false); assert.equal(ally.health, 40); assert.equal(ally.invulnerableUntil, 12);
assert.equal(enemy.revivePendingUntil, undefined);
assert.equal(ctx.applyDamage(ally, 100), 0); assert.equal(ally.health, 40);
state.takedownMode = true; ally.isBoss = true;
state.gameTime = 12; ctx.applyDamage(ally, 100, { isPlayer: true }); assert.equal(relays, 1);
state.takedownMode = false; ally.isBoss = false;
// A death during the final buff second still gets its full delayed revive.
ally.dead = true; ally.revivePendingUntil = 20; ally.reviveAt = 22; ally.reviveHealthRatio = 0.4;
state.gameTime = 21; ctx.updatePinkRevives(); assert.equal(ally.dead, true); assert.equal(ally.reviveAt, 22);
state.gameTime = 22; ctx.updatePinkRevives(); assert.equal(ally.dead, false); assert.equal(ally.health, 40);
// Null teams in free-for-all do not turn opponents into allies.
state.chopWoodMode = false; pink.team = null; enemy.team = null; pink.pinkUltimateCharge = 15;
ctx.tryUsePinkUltimate(pink); assert.equal(enemy.revivePendingUntil, undefined);
const green = { id: 4, characterType: 'green', dead: false, ammo: 3, nextAttackAt: 0,
  spread: 0, recoilKick: 0, mesh: { position: {} }, yaw: 0, greenUltimateBush: { expiresAt: 40 } };
ctx.beginBoomerangAttack(green);
assert.equal(green.revealedUntil, 25); assert.equal(state.projectiles.length, 4);
assert.equal(green.greenConcealedVisual, false);
// Beyond bush proximity range, an attack must still make Green targetable.
green.mesh.position = { x: 15, z: 0 }; green.health = 100; green.maxHealth = 100;
const bot = make(5, 1); state.players = [bot, green];
state.gameTime = 23;
assert.equal(ctx.isFighterVisible(bot, green), true);
assert.equal(ctx.chooseBotTarget(bot), green);
state.gameTime = 25;
assert.equal(ctx.isFighterVisible(bot, green), false);
assert.equal(ctx.chooseBotTarget(bot), null);
// A new attack must not shorten a longer existing reveal debuff.
green.revealedUntil = 40; green.nextAttackAt = 0;
ctx.beginBoomerangAttack(green); assert.equal(green.revealedUntil, 40);
console.log('Character audit checks passed: revive invulnerability/expiry, late-buff revive, immediate ally revival, FFA exclusion, Green attack reveal.');
