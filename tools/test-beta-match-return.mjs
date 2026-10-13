import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8');
const extract = name => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, name);
  const firstLine = source.slice(start, source.indexOf('\n', start)).trimEnd();
  if (firstLine.endsWith('}')) return firstLine;
  return source.slice(start, source.indexOf('\n}', start) + 2);
};
const element = () => ({ visible: true, textContent: '', classList: { add() {}, remove() {} } });
const movement = source.slice(source.indexOf('  let isMoving = false;'), source.indexOf('  restoreModelAttackPose();'));

function setup(mode, dead) {
  const position = {
    x: 0, y: 1.7, z: 15,
    set(x, y, z) { Object.assign(this, { x, y, z }); },
    copy(point) { this.set(point.x, point.y, point.z); },
  };
  const context = vm.createContext({
    THREE: { MathUtils: { clamp: (n, low, high) => Math.max(low, Math.min(high, n)) } },
    clock: { elapsedTime: 100 },
    goldRushState: { active: true, ended: false, mode, dead, health: dead ? 0 : 1000,
      maxHealth: 6000, ammo: 0, maxAmmo: 3, reloadTimer: .8, respawnAt: 105,
      invulnerableUntil: 0, kills: 0, winCountdownStartedAt: null },
    betaState: { selectedCharacter: 'red', characterTrophies: { red: 100 },
      soccerKick: { games: 0, wins: 0, losses: 0 }, daily: { pendingRewards: 0 },
      showdownWinStreak: 0, oneVsOne: { wins: 0, losses: 0 },
      characterShowdownWins: {}, orderEvent: { progress: 0 } },
    player: { visible: !dead, position, rotation: { y: 0 } },
    initialSpawnPoint: { ...position }, TRAINING_TELEPORT_POINT: { x: -40, y: 6.33, z: 10 },
    currentArenaMode: mode, activeEventLayout: {}, testTargets: [], goldRushBots: [{ dead: false }],
    canvas: { dataset: {} }, document: { body: { classList: { remove() {} } } },
    betaSfx: { play() {} },
    clearAzureWave() {}, clearYellowCircuit() {}, clearLavenderPractice() {}, clearCrystalUltimate() {},
    saveBetaState() {}, setBetaMatchMusic() {}, showToast() {}, playOrderVictoryEffect() {},
    showDailyRewardReveal() {}, dropGoldRushGold() {}, resetAxe() {},
    clearGoldRushBots() { context.beta6Combat = null; context.beta6PlayerActor = null; },
    beta6Combat: { time: 50 }, beta6PlayerActor: { frozenUntil: 100, lockUntil: 100 },
    SHOWDOWN_PLUS_KILL_SCORE: 2,
    updateBlueDash: () => false, updateAzureWave: () => false, updatePurpleLeap: () => false,
    updateCrystalUltimate: () => false, crystalUltimateBusy: () => false,
    input: { x: 0, y: 1, lengthSq: () => 1, normalize() { return this; },
      multiplyScalar(n) { this.y *= n; return this; } },
    HAS_BETA6_CONTENT: true, BETA_CHARACTERS: { red: { moveSpeedMultiplier: 1 } },
    dt: .1, yaw: 0, manualAimActive: false, holdAiming: false,
    ivoryUltimateAiming: false, directionalUltimateAiming: false, applyArenaWallBlock() {},
  });
  for (const name of ['playerGoldRushHealthBar', 'goldRushPlayerPanel', 'goldRushStatusEl',
    'goldMine', 'gemArena', 'chopWoodArena', 'goldArena', 'chopWoodHud', 'playerAxe',
    'respawnOverlay', 'goldRushHud', 'iceCreamShowdownMap', 'soccerArena', 'map', 'alphaBoss']) context[name] = element();
  vm.runInContext(['calcShowdownTrophyChange', 'calcShowdownStreakBonus', 'endGoldRush',
    'killGoldRushPlayer', 'isSoccerFrozen', 'beta6PlayerAttackBlocked', 'resetPlayer'].map(extract).join('\n'), context);
  return context;
}

function checkReturn(context) {
  const state = context.goldRushState;
  assert.equal(context.currentArenaMode, 'lobby');
  assert.equal(state.active, false);
  assert.equal(state.ended, true);
  assert.equal(state.dead, false);
  assert.equal(state.respawnAt, 0);
  assert.equal(state.health, state.maxHealth);
  assert.equal(state.ammo, state.maxAmmo);
  assert.equal(state.reloadTimer, 0);
  assert.equal(context.player.visible, true);
  assert.equal(context.player.position.x, -40);
  assert.equal(context.player.position.z, 10);
  const z = context.player.position.z;
  vm.runInContext(movement, context);
  assert.ok(context.player.position.z > z, 'actual movement branch accepts input after returning');
  const trophies = context.betaState.characterTrophies.red;
  context.endGoldRush('duplicate result');
  assert.equal(context.betaState.characterTrophies.red, trophies, 'result cannot be applied twice');
}

for (const mode of ['showdown', 'soccer', 'gemGrab', 'goldRush', 'chopWood']) {
  for (const dead of [false, true]) for (const won of [false, true]) {
    const context = setup(mode, dead);
    context.endGoldRush('match result', won);
    checkReturn(context);
  }
}
const showdown = setup('showdown', false);
showdown.killGoldRushPlayer();
checkReturn(showdown);
assert.equal(showdown.betaState.characterTrophies.red, 108, 'second-place result remains unchanged');
const abandoned = setup('chopWood', true);
abandoned.endGoldRush('exit while dead', false, null, true);
checkReturn(abandoned);
assert.equal(abandoned.betaState.characterTrophies.red, 100);
console.log('PASS: all beta modes return alive and movable after win/loss; showdown death, exit while dead and duplicate rewards.');
