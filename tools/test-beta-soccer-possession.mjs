// Beta Soccer Kick possession rules, exercised on the real functions from src/beta-season.js:
// catch and hold, tackle only by opponents after 1 s, kicks only by the holder and only with ammo,
// manual aim vs auto-aim to the enemy goal, and own goals that do not count.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/beta-season.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const grab = name => {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  return source.slice(start, source.indexOf('\n}', start) + 2);
};
const constants = ['SOCCER_FIELD_HALF', 'SOCCER_GOAL_HALF_WIDTH', 'SOCCER_BALL_RADIUS', 'SOCCER_KICK_SPEED', 'SOCCER_PLAYER_KICK_COOLDOWN', 'SOCCER_CATCH_REACH', 'SOCCER_HOLD_OFFSET', 'SOCCER_TACKLE_AFTER']
  .map(name => source.match(new RegExp(`const ${name} = [^;]+;`))[0]).join('\n');
const fns = ['soccerHolderMatches', 'soccerHolderAlive', 'soccerHolderTransform', 'trySoccerCatch', 'updateSoccerHeldBall', 'kickSoccerBall', 'tryPlayerSoccerKick', 'checkSoccerGoal', 'soccerYawToEnemyGoal'].map(grab).join('\n');

const make = () => {
  const ctx = {
    clock: { elapsedTime: 10 },
    soccerBall: { position: { x: 0, z: 0 } },
    soccerState: { vx: 0, vz: 0, kickoffUntil: 0, holder: null, catchBlock: null, lastKick: 'a', lastKicker: 'bot', playerKickReadyAt: 0 },
    goldRushState: { mode: 'soccer', dead: false, ammo: 3, reloadTimer: 0, reloadDuration: 1 },
    player: { position: { x: 0, z: -1 }, rotation: { y: 0 } },
    canvas: { dataset: {} }, betaSfx: { play() {} }, goldRushStatusEl: { textContent: '' },
    updateGoldRushCombatHud() {}, goals: [], soccerGoal(team) { ctx.goals.push(team); },
  };
  vm.createContext(ctx);
  vm.runInContext(`${constants}\n${fns}\nglobalThis.api={trySoccerCatch,updateSoccerHeldBall,kickSoccerBall,tryPlayerSoccerKick,checkSoccerGoal};`, ctx);
  return ctx;
};

{
  // Catch and hold: the ball follows the holder and does not drop by itself.
  const c = make(), { api } = c;
  assert(api.trySoccerCatch(c.player.position, 'a', 'player'));
  c.player.position.x = 5; c.player.rotation.y = Math.PI / 2;
  api.updateSoccerHeldBall();
  assert(Math.abs(c.soccerBall.position.x - (5 + 0.95)) < 1e-9 && Math.abs(c.soccerBall.position.z + 1) < 1e-9, 'ball in front of holder');
  c.clock.elapsedTime += 30; api.updateSoccerHeldBall();
  assert.equal(c.soccerState.holder.type, 'player', 'still held');
  // Teammates cannot take it; opponents can only after 1 s.
  const bot = { dead: false, mesh: { position: { ...c.soccerBall.position }, rotation: { y: 0 } } };
  assert(!api.trySoccerCatch(c.soccerBall.position, 'a', 'bot', bot), 'teammate cannot steal');
  c.soccerState.holder.since = c.clock.elapsedTime - .5;
  assert(!api.trySoccerCatch(c.soccerBall.position, 'b', 'bot', bot), 'no tackle before 1 s');
  c.soccerState.holder.since = c.clock.elapsedTime - 1.1;
  assert(api.trySoccerCatch(c.soccerBall.position, 'b', 'bot', bot), 'tackle after 1 s');
  assert.equal(c.soccerState.holder.team, 'b');
  // Holder falls: ball drops.
  bot.dead = true; api.updateSoccerHeldBall();
  assert.equal(c.soccerState.holder, null);
}
{
  // Kicks: holder only, spend one ammo, manual aim uses facing, auto-aim heads to the enemy goal.
  const c = make(), { api } = c;
  assert(!api.tryPlayerSoccerKick(false), 'cannot kick without holding');
  assert.equal(c.goldRushState.ammo, 3);
  api.trySoccerCatch(c.player.position, 'a', 'player'); api.updateSoccerHeldBall();
  c.player.rotation.y = Math.PI / 2;
  assert(api.tryPlayerSoccerKick(true));
  assert.equal(c.goldRushState.ammo, 2, 'kick spends ammo');
  assert(c.soccerState.vx > 16 && Math.abs(c.soccerState.vz) < 1e-9, 'manual aim kicks along facing');
  assert.equal(c.soccerState.holder, null);
  assert(!api.trySoccerCatch(c.player.position, 'a', 'player'), 'kicker cannot re-catch instantly');
  c.clock.elapsedTime += 1; c.soccerBall.position = { x: 0, z: -.5 };
  assert(api.trySoccerCatch(c.player.position, 'a', 'player')); api.updateSoccerHeldBall();
  assert(api.tryPlayerSoccerKick(false));
  assert(c.soccerState.vz > 16, 'auto-aim kicks toward the +Z enemy goal');
  c.goldRushState.ammo = 0; c.clock.elapsedTime += 1; c.soccerBall.position = { x: 0, z: -.5 };
  api.trySoccerCatch(c.player.position, 'a', 'player');
  assert(!api.tryPlayerSoccerKick(false), 'no kick without ammo');
  assert.equal(c.soccerState.holder.type, 'player', 'keeps the ball when out of ammo');
}
{
  // Own goals do not count; real goals do.
  const c = make(), { api } = c;
  c.soccerState.lastKick = 'a'; c.soccerBall.position = { x: 0, z: -20.2 }; c.soccerState.vz = -10;
  api.checkSoccerGoal();
  assert.deepEqual(c.goals, [], 'blue ball into blue goal (-Z) is not a goal');
  assert(c.soccerBall.position.z > -19 && c.soccerState.vz > 0, 'bounced back into the field');
  c.soccerState.lastKick = 'b'; c.soccerBall.position = { x: 0, z: 20.2 };
  api.checkSoccerGoal();
  assert.deepEqual(c.goals, [], 'red own goal blocked too');
  c.soccerState.lastKick = 'a'; c.soccerBall.position = { x: 0, z: 20.2 };
  api.checkSoccerGoal();
  assert.deepEqual(c.goals, ['a'], 'blue scores in the +Z goal');
}
console.log('PASS Beta soccer: catch and hold, ball follows holder, teammates cannot steal, tackle after 1 s, drop on death, holder-only kicks spend ammo, manual/auto aim, no re-catch right after kicking, own goals blocked.');
